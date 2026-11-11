// Simulated pre-flight gatekeeper: normalises rows, resolves entities, and
// cross-checks against synthetic NPPES / PECOS / state licence / DataSpring
// sources. Deterministic rules stand in for ML models; confidences are fake.
import {REGISTRY, PAYER_FILE} from '../../data/providers.js';
import {PAYERS} from '../../data/payers.js';
import {DEMO_TODAY, tierFor} from '../../shared/constants/index.js';
import {parseDate, normalisePhone, normaliseTin, parseName, splitSuite, daysBetween, formatDate} from '../../shared/utils/format.js';

const GROUPS = {lakeshore: 'Lakeshore Health Partners', maple: 'Maple Street Family Medicine'};

function normaliseRow(raw, mapping, line) {
  const get = (key) => {
    const m = mapping.find((x) => x.target === key);
    return m ? String(raw[m.source] ?? '').trim() : '';
  };
  let fixes = 0;
  const track = (before, after) => { if (before && after && before !== after) fixes++; return after; };
  const nameRaw = get('name');
  const name = parseName(nameRaw);
  track(nameRaw, name.display);
  const npi = get('npi').replace(/\D/g, '');
  const tin = track(get('tin'), normaliseTin(get('tin')));
  const {street, suite} = splitSuite(get('address'));
  const effRaw = get('effectiveDate');
  const effectiveDate = parseDate(effRaw);
  track(effRaw, effectiveDate);
  const expRaw = get('licenseExpiry');
  const licenseExpiry = parseDate(expRaw);
  track(expRaw, licenseExpiry);
  const phone = track(get('phone'), normalisePhone(get('phone')));
  const acc = get('accepting').toLowerCase();
  const accepting = ['y', 'yes', 'true', '1', 'open'].includes(acc) ? 'Y' : ['n', 'no', 'false', '0', 'closed'].includes(acc) ? 'N' : '';
  const cityRaw = get('city');
  const city = track(cityRaw, cityRaw.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()));
  const licRaw = get('licenseNumber');
  const licenseNumber = licRaw.replace(/^[A-Z]{2}\s+/, '');
  const specialty = get('specialty').replace(/\s*\([0-9A-Z]{10}\)$/, '');
  return {
    line, key: `row-${line}`, name: name.display, first: name.first, last: name.last, credential: name.credential,
    nameRaw, npi, tin, street, suite, city, state: get('state').toUpperCase(), zip: get('zip'), phone,
    effectiveDate, effRaw, licenseNumber, licenseState: get('licenseState') || licRaw.slice(0, 2), licenseExpiry,
    accepting, languages: get('languages'), specialty, normalisations: fixes,
  };
}

const nextFirstOfMonth = (iso) => {
  const [y, m] = iso.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
};

function makeException(base) {
  const tier = tierFor(base.confidence);
  // Protected (contract/clinical) fields are never eligible for bulk acceptance.
  return {status: 'open', resolution: null, ...base, tier: base.protected && tier === 'high' ? 'medium' : tier};
}

export function runPreflight(rows, mapping) {
  const records = rows.map((r, i) => normaliseRow(r, mapping, i + 2)); // +2: header is line 1
  const exceptions = [];
  const checks = {nppes: 0, pecos: 0, license: 0, dataspring: 0};

  // Detect which group this roster belongs to.
  const npis = new Set(records.map((r) => r.npi));
  const groupId = Object.keys(PAYER_FILE).find((g) => PAYER_FILE[g].filter((n) => npis.has(n)).length >= PAYER_FILE[g].length * 0.5) ?? null;

  // 1) Entity resolution: same NPI appearing more than once.
  const byNpi = {};
  records.forEach((r) => { (byNpi[r.npi] ||= []).push(r); });
  const duplicateKeys = new Set();
  Object.values(byNpi).forEach((group) => {
    if (group.length < 2 || !group[0].npi) return;
    const [keep, ...dups] = group;
    dups.forEach((d) => {
      duplicateKeys.add(d.key);
      const sameLast = d.last === keep.last;
      const sameInitial = d.first[0] === keep.first[0];
      exceptions.push(makeException({
        id: `dup-${d.line}`, type: 'duplicate', title: 'Duplicate provider (entity resolution)',
        providerName: keep.name, npi: keep.npi, rowRefs: [keep.line, d.line], recordKey: d.key, field: 'entity',
        fieldLabel: 'Provider record', protected: true,
        current: `"${d.nameRaw}" (row ${d.line}) and "${keep.nameRaw}" (row ${keep.line})`,
        suggested: `Merge into one record: ${REGISTRY[keep.npi] ? `${REGISTRY[keep.npi].first} ${REGISTRY[keep.npi].last}, ${REGISTRY[keep.npi].credential}` : keep.name}`,
        confidence: sameLast && sameInitial ? 0.88 : 0.71,
        evidence: [
          {source: 'NPPES', detail: `NPI ${keep.npi} is registered to a single individual`},
          {source: 'Entity model', detail: `Same NPI, licence # and address; name "${d.nameRaw}" ≈ "${keep.nameRaw}" (initial + surname match)`},
        ],
      }));
    });
  });

  // 2) Per-record source checks.
  records.forEach((r) => {
    if (duplicateKeys.has(r.key)) return;
    const reg = REGISTRY[r.npi];
    checks.nppes++; checks.dataspring++;
    if (r.npi && r.npi.length !== 10) {
      exceptions.push(makeException({
        id: `npi-${r.line}`, type: 'npi_invalid', title: 'Invalid NPI', providerName: r.name, npi: r.npi, rowRefs: [r.line],
        recordKey: r.key, field: 'npi', fieldLabel: 'NPI', protected: false, current: r.npi || '(blank)',
        suggested: 'Ask provider to confirm 10-digit NPI', confidence: 0.4,
        evidence: [{source: 'NPPES', detail: 'NPI must be 10 digits with a valid check digit'}],
      }));
      return;
    }
    if (!r.effectiveDate && r.effRaw) {
      exceptions.push(makeException({
        id: `date-${r.line}`, type: 'date_unparseable', title: 'Unreadable effective date', providerName: r.name, npi: r.npi,
        rowRefs: [r.line], recordKey: r.key, field: 'effectiveDate', fieldLabel: 'Effective date', protected: true,
        current: r.effRaw, suggested: nextFirstOfMonth(DEMO_TODAY), confidence: 0.6,
        evidence: [{source: 'Parser', detail: `"${r.effRaw}" did not match any known date format`}],
      }));
    }
    if (!reg) return; // Outside the synthetic registry: treated as a pass in this prototype.
    checks.pecos++; checks.license++;
    r.name = `${reg.first} ${reg.last}, ${reg.credential}`; // entity resolved to canonical identity

    if (!r.suite && reg.suite && r.street.toLowerCase() === reg.street.toLowerCase()) {
      exceptions.push(makeException({
        id: `suite-${r.line}`, type: 'missing_suite', title: 'Missing suite number', providerName: r.name, npi: r.npi,
        rowRefs: [r.line], recordKey: r.key, field: 'suite', fieldLabel: 'Suite', protected: false,
        current: `${r.street} (no suite)`, suggested: `Suite ${reg.suite}`, value: reg.suite,
        confidence: r.line % 2 ? 0.97 : 0.95,
        evidence: [
          {source: 'NPPES', detail: `Practice location on file: ${reg.street}, Suite ${reg.suite}, ${reg.city} ${reg.state}`},
          {source: 'DataSpring', detail: `Group profile lists Suite ${reg.suite} for this site (attested 2026-08)`},
        ],
      }));
    }
    if (r.tin && r.tin !== reg.tin) {
      exceptions.push(makeException({
        id: `tin-${r.line}`, type: 'tin_mismatch', title: 'TIN/NPI mismatch', providerName: r.name, npi: r.npi,
        rowRefs: [r.line], recordKey: r.key, field: 'tin', fieldLabel: 'Billing TIN', protected: true,
        current: r.tin, suggested: reg.tin, value: reg.tin, confidence: 0.78,
        evidence: [
          {source: 'PECOS', detail: `Reassignment of benefits: NPI ${r.npi} bills under TIN ${reg.tin}`},
          {source: 'Payer file', detail: `All 3 payers hold TIN ${reg.tin} for this provider; roster value looks like transposed digits`},
        ],
      }));
    }
    if (r.effectiveDate && r.effectiveDate !== reg.effectiveDate && daysBetween(r.effectiveDate, DEMO_TODAY) > 30) {
      const days = daysBetween(r.effectiveDate, DEMO_TODAY);
      exceptions.push(makeException({
        id: `retro-${r.line}`, type: 'retro_date', title: 'Retro effective date', providerName: r.name, npi: r.npi,
        rowRefs: [r.line], recordKey: r.key, field: 'effectiveDate', fieldLabel: 'Effective date', protected: true,
        current: `${formatDate(r.effectiveDate)} (${days} days ago)`, suggested: formatDate(nextFirstOfMonth(DEMO_TODAY)),
        value: nextFirstOfMonth(DEMO_TODAY), confidence: 0.81,
        evidence: [
          {source: 'Payer rules', detail: PAYERS.map((p) => `${p.short}: ${p.rules[0].retroDays}-day retro limit`).join(' · ')},
          {source: 'DataSpring', detail: `Provider joined site on ${formatDate(reg.effectiveDate)}; earlier date likely a credentialing date`},
        ],
      }));
    }
    if (r.licenseExpiry && r.licenseExpiry < DEMO_TODAY) {
      exceptions.push(makeException({
        id: `lic-${r.line}`, type: 'license_expired', title: `Licence expired in ${r.licenseState}`, providerName: r.name,
        npi: r.npi, rowRefs: [r.line], recordKey: r.key, field: 'licenseExpiry', fieldLabel: 'State licence', protected: true,
        current: `${r.licenseState} ${r.licenseNumber}, expired ${formatDate(r.licenseExpiry)}`,
        suggested: 'Hold from directory and claims until renewal is verified', value: 'hold', confidence: 0.58,
        evidence: [
          {source: `${r.licenseState} licence board`, detail: `Licence ${r.licenseNumber} status: EXPIRED (${formatDate(r.licenseExpiry)}); no renewal on file`},
          {source: 'DataSpring', detail: 'Credentialing profile: renewal not yet attested'},
        ],
      }));
    }
  });

  // 3) Termination detection: on payer files but missing from this roster.
  if (groupId) {
    PAYER_FILE[groupId].filter((n) => !npis.has(n)).forEach((n) => {
      const p = REGISTRY[n];
      exceptions.push(makeException({
        id: `term-${n}`, type: 'termination', title: 'Provider termination detected', providerName: `${p.first} ${p.last}, ${p.credential}`,
        npi: n, rowRefs: [], recordKey: `term-${n}`, field: 'termination', fieldLabel: 'Network status', protected: true,
        current: 'Active on all 3 payer files, missing from this roster', suggested: 'Terminate effective Nov 30, 2026',
        value: '2026-11-30', confidence: 0.84,
        evidence: [
          {source: 'Payer file', detail: `Active at ${p.street}, ${p.city} since ${formatDate(p.effectiveDate)}`},
          {source: 'DataSpring', detail: 'Practice location end-dated Oct 31, 2026 in provider profile'},
          {source: 'NPPES', detail: 'Practice address updated to a non-Lakeshore location (Oct 28, 2026)'},
        ],
      }));
    });
  }

  const exceptionRows = new Set(exceptions.filter((e) => e.rowRefs.length).map((e) => e.recordKey));
  const normalisations = records.reduce((s, r) => s + r.normalisations, 0);
  return {
    groupId, groupName: GROUPS[groupId] ?? 'Unrecognised group', records,
    exceptions,
    stats: {
      totalRows: records.length, exceptionRows: exceptionRows.size, touchlessRows: records.length - exceptionRows.size,
      touchlessRate: records.length ? (records.length - exceptionRows.size) / records.length : 0, normalisations,
    },
    checks,
  };
}
