// Normalisers used by the simulated AI pipeline, plus display helpers.
const MONTHS = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12};
const pad = (n) => String(n).padStart(2, '0');

/** Parse many messy date formats into ISO yyyy-mm-dd. Returns null if unparseable. */
export function parseDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if ((m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/))) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${pad(m[1])}-${pad(m[2])}`;
  }
  if ((m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/))) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(m[1])}`;
  }
  if ((m = s.match(/^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})$/))) {
    return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(m[2])}`;
  }
  return null;
}

export function normalisePhone(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(raw ?? '');
}

export function normaliseTin(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  return d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2)}` : String(raw ?? '');
}

/** "Shah, Anjali MD" | "Dr. A. Shah" | "ANJALI SHAH, MD" -> {first, last, credential, display} */
export function parseName(raw) {
  let s = String(raw ?? '').trim().replace(/\s+/g, ' ');
  let credential = '';
  const cred = s.match(/,?\s*(MD|DO|NP|PA-C|PA|DNP|FNP-C|MBBS)\.?$/i);
  if (cred) { credential = cred[1].toUpperCase(); s = s.slice(0, cred.index).trim(); }
  s = s.replace(/^dr\.?\s+/i, '');
  let first; let last;
  if (s.includes(',')) [last, first] = s.split(',').map((x) => x.trim());
  else { const parts = s.split(' '); last = parts.pop(); first = parts.join(' '); }
  const title = (x) => (x || '').toLowerCase().replace(/(^|[\s'-])\S/g, (c) => c.toUpperCase());
  first = title(first); last = title(last);
  return {first, last, credential, display: `${first} ${last}${credential ? `, ${credential}` : ''}`.trim()};
}

/** Split "100 Lake St Ste 200" into street + suite. */
export function splitSuite(raw) {
  const s = String(raw ?? '').trim().replace(/\s+/g, ' ');
  const m = s.match(/^(.*?)[,\s]+(?:suite|ste\.?|#|unit)\s*([\w-]+)$/i);
  return m ? {street: m[1].trim(), suite: m[2]} : {street: s, suite: ''};
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
}

export function daysBetween(isoA, isoB) {
  return Math.round((new Date(`${isoB}T12:00:00`) - new Date(`${isoA}T12:00:00`)) / 86400000);
}

export const pct = (n, digits = 1) => `${(n * 100).toFixed(digits)}%`;
