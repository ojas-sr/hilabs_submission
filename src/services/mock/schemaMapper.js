// Simulated "AI schema mapping": deterministic header-synonym + value-pattern
// matching that returns a fake but explainable confidence per column.
import {CANONICAL_FIELDS, fieldByKey} from '../../data/canonicalFields.js';

// Ambiguous headers get a lower, explained confidence (so the demo shows review).
const AMBIGUOUS = {
  st: [0.86, 'Ambiguous abbreviation (State or Street); values are 2-letter codes'],
  'lic st': [0.82, 'Abbreviation; values look like state codes, paired with "Lic #"'],
  'new pts?': [0.88, 'Abbreviated header; values are Y/N/Yes/No'],
  dept: [0.74, '"Dept" usually means department; values match specialty taxonomy'],
  'lic exp': [0.91, 'Abbreviation; values parse as dates after "Lic #"'],
  license: [0.84, 'Values combine state + licence number; split automatically'],
};

const norm = (h) => h.toLowerCase().replace(/\s+/g, ' ').trim();
const tokens = (h) => norm(h).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean);

function patternScore(field, values) {
  if (!field.pattern) return null;
  const sample = values.filter(Boolean).slice(0, 50);
  if (!sample.length) return null;
  return sample.filter((v) => field.pattern.test(v.replace(/\s/g, ''))).length / sample.length;
}

export function mapHeaders(headers, rows) {
  const candidates = headers.map((source) => {
    const h = norm(source);
    const values = rows.map((r) => r[source] ?? '');
    let best = null;
    for (const f of CANONICAL_FIELDS) {
      let conf = 0; let reason = '';
      if (f.synonyms.includes(h)) {
        const ps = patternScore(f, values);
        conf = ps === null ? 0.95 : 0.9 + 0.09 * ps;
        reason = ps === null ? `Known synonym for "${f.label}"` : `Known synonym; ${Math.round(ps * 100)}% of values match ${f.label} format`;
        if (AMBIGUOUS[h]) [conf, reason] = AMBIGUOUS[h];
      } else {
        const ht = tokens(source);
        const overlap = f.synonyms.some((s) => tokens(s).some((t) => t.length > 2 && ht.includes(t)));
        if (overlap) { conf = 0.72; reason = `Partial header match with "${f.label}"`; }
      }
      if (conf > (best?.confidence ?? 0)) best = {target: f.key, confidence: conf, reason};
    }
    if (!best) {
      // Value-based inference as a fallback.
      for (const f of CANONICAL_FIELDS) {
        const ps = patternScore(f, values);
        if (ps && ps > 0.8 && ps * 0.7 > (best?.confidence ?? 0)) best = {target: f.key, confidence: ps * 0.7, reason: `Inferred from values (${Math.round(ps * 100)}% match ${f.label} format)`};
      }
    }
    return {source, sample: values.filter(Boolean).slice(0, 3), ...(best ?? {target: '', confidence: 0, reason: 'No confident match; column will be ignored'}), userEdited: false};
  });
  // One source column per canonical field: keep the highest-confidence claim.
  const claimed = {};
  candidates.forEach((c, i) => {
    if (!c.target) return;
    const prev = claimed[c.target];
    if (prev === undefined || candidates[prev].confidence < c.confidence) {
      if (prev !== undefined) Object.assign(candidates[prev], {target: '', confidence: 0, reason: `Lower-confidence duplicate of ${fieldByKey[c.target].label}`});
      claimed[c.target] = i;
    } else Object.assign(c, {target: '', confidence: 0, reason: `Lower-confidence duplicate of ${fieldByKey[c.target].label}`});
  });
  return candidates;
}
