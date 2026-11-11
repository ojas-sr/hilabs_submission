// Client-side demo store: persona, intake pipeline, submissions, tracker,
// attestation, payer-ops queue and a hash-chained audit log. Persisted to
// localStorage when available; everything still works without it.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState} from 'react';
import {Alert, Snackbar} from '@mui/material';
import {PERSONAS} from '../constants/index.js';
import {entryHash} from '../utils/hash.js';
import {AUDIT_SEED, PAYER_QUEUE_SEED} from '../../data/history.js';
import {mapHeaders} from '../../services/mock/schemaMapper.js';
import {runPreflight} from '../../services/mock/preflight.js';
import {applyResolutions, routeToPayers} from '../../services/mock/payerRouter.js';
import {fieldByKey} from '../../data/canonicalFields.js';

const STORAGE_KEY = 'medcare-copilot-demo-v1';
const GENESIS = '0000000000000000';

function chain(entries) {
  let prev = GENESIS;
  return entries.map((e, i) => {
    const entry = {id: `AUD-${String(i + 1).padStart(5, '0')}`, ...e, prevHash: prev};
    entry.hash = entryHash(entry, prev);
    prev = entry.hash;
    return entry;
  });
}

function initialState() {
  return {
    persona: 'groupAdmin',
    intake: null,
    submission: null,
    attestation: {status: 'pending'},
    payerQueue: PAYER_QUEUE_SEED,
    audit: chain(AUDIT_SEED),
    guide: {active: false, step: 0},
  };
}

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return {...initialState(), ...JSON.parse(raw)};
  } catch { /* storage unavailable: fall back to in-memory */ }
  return initialState();
}

function appendAudit(state, entries) {
  const audit = [...state.audit];
  let prev = audit.length ? audit[audit.length - 1].hash : GENESIS;
  const persona = PERSONAS[state.persona];
  entries.forEach((e) => {
    const entry = {
      id: `AUD-${String(audit.length + 1).padStart(5, '0')}`, ts: Date.now(),
      actor: persona.user.split(' (')[0], org: persona.org, field: '—', original: '—', aiSuggestion: '—', final: '—',
      ...e, prevHash: prev,
    };
    entry.hash = entryHash(entry, prev);
    prev = entry.hash;
    audit.push(entry);
  });
  return {...state, audit};
}

const tierLabel = (t) => t[0].toUpperCase() + t.slice(1);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PERSONA':
      return {...state, persona: action.persona};

    case 'LOAD_FILE': {
      const {fileName, headers, rows} = action;
      const mapping = mapHeaders(headers, rows);
      const result = runPreflight(rows, mapping);
      const avg = mapping.filter((m) => m.target).reduce((s, m) => s + m.confidence, 0) / Math.max(1, mapping.filter((m) => m.target).length);
      const next = {...state, intake: {fileName, headers, rows, mapping, result, loadedAt: Date.now()}, submission: null};
      return appendAudit(next, [
        {event: 'File received', record: fileName, original: `${rows.length} rows, ${headers.length} columns`,
          aiSuggestion: `Mapped ${mapping.filter((m) => m.target).length}/${headers.length} columns (avg ${Math.round(avg * 100)}%)`, action: 'Uploaded', final: 'Accepted for pre-flight'},
        {actor: 'Co-Pilot (simulated AI)', event: 'Pre-flight complete', record: fileName, original: `${result.stats.totalRows} rows`,
          aiSuggestion: `${result.stats.normalisations} auto-normalisations; ${result.exceptions.length} exceptions`, action: 'Automated checks', final: `${Math.round(result.stats.touchlessRate * 1000) / 10}% touchless`},
      ]);
    }

    case 'SET_MAPPING': {
      const {intake} = state;
      const mapping = intake.mapping.map((m) => {
        if (m.source === action.source) return {...m, target: action.target, confidence: action.target ? 1 : 0, reason: action.target ? 'Confirmed by user' : 'Ignored by user', userEdited: true};
        if (action.target && m.target === action.target) return {...m, target: '', confidence: 0, reason: `Reassigned to "${action.source}" by user`};
        return m;
      });
      const prev = Object.fromEntries(intake.result.exceptions.map((e) => [e.id, e]));
      const result = runPreflight(intake.rows, mapping);
      result.exceptions = result.exceptions.map((e) => (prev[e.id] ? {...e, status: prev[e.id].status, resolution: prev[e.id].resolution} : e));
      const old = intake.mapping.find((m) => m.source === action.source);
      return appendAudit({...state, intake: {...intake, mapping, result}}, [{
        event: 'Mapping changed', record: intake.fileName, field: `Column "${action.source}"`,
        original: '—', aiSuggestion: old.target ? `${fieldByKey[old.target].label} (${Math.round(old.confidence * 100)}%)` : 'Ignore',
        action: 'Overrode AI mapping', final: action.target ? fieldByKey[action.target].label : 'Ignore',
      }]);
    }

    case 'RESOLVE_EXCEPTIONS': {
      // action.items: [{id, status: accepted|edited|rejected, value?, note?}], action.bulk
      const {intake} = state;
      const byId = Object.fromEntries(action.items.map((i) => [i.id, i]));
      const exceptions = intake.result.exceptions.map((e) => (byId[e.id]
        ? {...e, status: byId[e.id].status, resolution: {value: byId[e.id].value ?? e.value, note: byId[e.id].note ?? '', at: Date.now()}}
        : e));
      const entries = action.items.map((i) => {
        const e = intake.result.exceptions.find((x) => x.id === i.id);
        const verb = i.status === 'accepted' ? (action.bulk ? 'Bulk-accepted (High)' : `Accepted 1-click fix (${tierLabel(e.tier)})`)
          : i.status === 'edited' ? 'Edited manually' : 'Rejected AI fix, escalated';
        return {
          event: 'Exception resolved', record: `${e.providerName} · NPI ${e.npi}`, field: e.fieldLabel, original: e.current,
          aiSuggestion: `${e.suggested} (${Math.round(e.confidence * 100)}%)`, action: verb,
          final: i.status === 'rejected' ? `Kept original${i.note ? `; note: ${i.note}` : ''}` : i.status === 'edited' ? i.value : e.suggested,
        };
      });
      return appendAudit({...state, intake: {...intake, result: {...intake.result, exceptions}}}, entries);
    }

    case 'SUBMIT': {
      const {intake} = state;
      const {records, terminations} = applyResolutions(intake.result.records, intake.result.exceptions);
      const results = routeToPayers(records, terminations);
      const submittedAt = Date.now();
      const id = `SUB-2026-1111-${String(state.audit.length).padStart(3, '0')}`;
      const unresolved = intake.result.exceptions.filter((e) => e.status === 'open' || e.status === 'rejected');
      const nwHeld = results.find((r) => r.payerId === 'northwind').held.filter((h) => !unresolved.some((u) => u.recordKey === h.key));
      const escalations = [
        ...unresolved.map((e, i) => ({
          id: `PQ-${1100 + i}`, group: intake.result.groupName, provider: e.providerName, npi: e.npi, issue: e.title,
          aiSuggestion: e.suggested, providerNote: e.resolution?.note || '', ageHours: 0, tier: e.tier, status: 'open',
          source: e.status === 'rejected' ? 'Provider rejected AI fix' : 'Unresolved at submission', submissionId: id,
        })),
        ...nwHeld.map((h, i) => ({
          id: `PQ-${1150 + i}`, group: intake.result.groupName, provider: h.name, npi: h.npi, issue: h.reasons[0],
          aiSuggestion: h.reasons[0].startsWith('Licence') ? 'Keep on hold until renewal verified' : 'Request missing value from group',
          providerNote: '', ageHours: 0, tier: 'medium', status: 'open', source: 'Northwind rule hold', submissionId: id,
        })),
      ];
      const submission = {
        id, submittedAt, fileName: intake.fileName, groupName: intake.result.groupName, persona: state.persona,
        rowCount: intake.result.stats.totalRows, touchlessRate: intake.result.stats.touchlessRate,
        resolved: intake.result.exceptions.length - unresolved.length, exceptionCount: intake.result.exceptions.length,
        results, terminations, ackCount: 0,
        providers: records.map((r) => ({key: r.key, npi: r.npi, name: r.name, specialty: r.specialty, city: r.city})),
      };
      return appendAudit({...state, submission, payerQueue: [...escalations, ...state.payerQueue.filter((q) => !q.submissionId)]}, [{
        event: 'Submitted', record: id, original: `${records.length} provider records`, aiSuggestion: '—',
        action: 'Submitted to 3 payers', final: results.map((r) => `${r.payerId}: ${r.accepted} ok / ${r.held.length} held`).join('; '),
      }]);
    }

    case 'ACK': {
      const s = state.submission;
      if (!s) return state;
      return appendAudit({...state, submission: {...s, ackCount: s.ackCount + 1}}, [{
        actor: 'System (ack file)', org: 'Payer EDI gateway', event: 'Payer status', record: s.id, field: 'Status',
        original: `Ack #${s.ackCount}`, action: 'Ack file processed', final: `Ack #${s.ackCount + 1} applied to 3 payers`,
      }]);
    }

    case 'ATTEST': {
      const confirmationId = `ATT-${String(Date.now()).slice(-6)}`;
      const next = {...state, attestation: {status: 'attested', attestedAt: Date.now(), confirmationId, changes: action.changes}};
      const prevPersona = state.persona;
      const withPersona = {...next, persona: 'practice'};
      const logged = appendAudit(withPersona, [
        ...action.changes.map((c) => ({
          event: 'Attestation change', record: `${c.provider} · NPI ${c.npi}`, field: c.field, original: c.original,
          aiSuggestion: c.suggested ?? '—', action: c.action, final: c.final,
        })),
        {event: '90-day attestation', record: 'Maple Street Family Medicine', original: '4 providers',
          aiSuggestion: 'Pre-filled from NPPES + DataSpring', action: 'Attested via magic link', final: `${confirmationId}; synced to 3 payers`},
      ]);
      return {...logged, persona: prevPersona};
    }

    case 'PAYER_DECISION': {
      const item = state.payerQueue.find((q) => q.id === action.id);
      const payerQueue = state.payerQueue.map((q) => (q.id === action.id ? {...q, status: action.decision} : q));
      return appendAudit({...state, payerQueue}, [{
        event: 'Payer ops decision', record: `${item.id} · ${item.provider}`, field: item.issue, original: item.providerNote || '—',
        aiSuggestion: item.aiSuggestion, action: action.decision === 'approved' ? 'Approved AI fix' : 'Returned to provider',
        final: action.decision === 'approved' ? item.aiSuggestion : 'Magic link sent to group',
      }]);
    }

    case 'GUIDE':
      return {...state, guide: {...state.guide, ...action.guide}};

    case 'RESET':
      return {...initialState(), guide: action.keepGuide ? state.guide : {active: false, step: 0}};

    default:
      return state;
  }
}

const DemoContext = createContext(null);

export function DemoProvider({children}) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore quota/private mode */ }
  }, [state]);

  const notify = useCallback((message, severity = 'success') => setToast({message, severity, key: Date.now()}), []);

  const api = useMemo(() => ({
    state,
    persona: PERSONAS[state.persona],
    setPersona: (persona) => dispatch({type: 'SET_PERSONA', persona}),
    loadFile: (fileName, headers, rows) => dispatch({type: 'LOAD_FILE', fileName, headers, rows}),
    setMapping: (source, target) => dispatch({type: 'SET_MAPPING', source, target}),
    resolve: (items, bulk = false) => dispatch({type: 'RESOLVE_EXCEPTIONS', items, bulk}),
    submit: () => dispatch({type: 'SUBMIT'}),
    ack: () => dispatch({type: 'ACK'}),
    attest: (changes) => dispatch({type: 'ATTEST', changes}),
    payerDecision: (id, decision) => dispatch({type: 'PAYER_DECISION', id, decision}),
    setGuide: (guide) => dispatch({type: 'GUIDE', guide}),
    reset: (keepGuide = false) => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      dispatch({type: 'RESET', keepGuide});
    },
    notify,
  }), [state, notify]);

  return (
    <DemoContext.Provider value={api}>
      {children}
      {toast && (
        <Snackbar key={toast.key} open autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>{toast.message}</Alert>
        </Snackbar>
      )}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
