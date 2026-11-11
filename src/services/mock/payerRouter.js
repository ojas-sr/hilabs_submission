// Simulated federated routing: one submission, one isolated rule set per payer.
import {PAYERS} from '../../data/payers.js';
import {DEMO_TODAY} from '../../shared/constants/index.js';
import {daysBetween} from '../../shared/utils/format.js';

/** Apply exception resolutions to records. Returns final records + terminations. */
export function applyResolutions(records, exceptions) {
  const byKey = Object.fromEntries(records.map((r) => [r.key, {...r, flags: []}]));
  const terminations = [];
  exceptions.forEach((e) => {
    const rec = byKey[e.recordKey];
    const resolved = e.status === 'accepted' || e.status === 'edited';
    const value = e.status === 'edited' ? e.resolution?.value : e.value;
    if (e.type === 'termination') {
      if (resolved) terminations.push({npi: e.npi, name: e.providerName, date: value || e.value});
      else terminations.push({npi: e.npi, name: e.providerName, escalated: true});
      return;
    }
    if (!rec) return;
    if (!resolved) { rec.flags.push({type: 'escalated', reason: `${e.title}: pending payer ops review`}); return; }
    switch (e.type) {
      case 'missing_suite': rec.suite = String(value).replace(/^suite\s*/i, ''); break;
      case 'tin_mismatch': rec.tin = value; break;
      case 'retro_date': case 'date_unparseable': rec.effectiveDate = value; break;
      case 'license_expired':
        if (e.status === 'edited') { rec.licenseExpiry = value; break; }
        rec.flags.push({type: 'hold', reason: 'Licence expired: held from claims and directory'}); break;
      case 'duplicate': delete byKey[e.recordKey]; break;
      default: break;
    }
  });
  return {records: Object.values(byKey), terminations};
}

function evaluate(payer, rec) {
  const reasons = rec.flags.map((f) => f.reason);
  const retro = payer.rules.find((r) => r.id === 'retro');
  if (rec.effectiveDate && daysBetween(rec.effectiveDate, DEMO_TODAY) > retro.retroDays) {
    reasons.push(`Effective date is ${daysBetween(rec.effectiveDate, DEMO_TODAY)} days retro; ${payer.short} allows ${retro.retroDays}`);
  }
  if (payer.rules.some((r) => r.id === 'language') && !rec.languages) reasons.push('Languages spoken missing (Summit directory rule)');
  if (payer.rules.some((r) => r.id === 'accepting') && !rec.accepting) reasons.push('Accepting-new-patients flag missing (CMS MA directory rule)');
  if (payer.rules.some((r) => r.id === 'suite') && !rec.suite) reasons.push('Suite missing (Northwind directory rule)');
  return reasons;
}

export function routeToPayers(records, terminations) {
  return PAYERS.map((payer) => {
    const held = [];
    records.forEach((rec) => {
      const reasons = evaluate(payer, rec);
      if (reasons.length) held.push({npi: rec.npi, name: rec.name, key: rec.key, reasons});
    });
    const termsApplied = terminations.filter((t) => !t.escalated).length;
    return {
      payerId: payer.id, accepted: records.length - held.length, held, terminations: termsApplied,
      status: held.length ? 'review' : 'approved', stage: 1, // starts at Validated after isolated rules
    };
  });
}
