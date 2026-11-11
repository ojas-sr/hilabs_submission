// Synthetic provider registry (stands in for NPPES / DataSpring / payer files).
// Every name, address, TIN and NPI here is fabricated. NPIs start with "9" so
// they can never collide with a real NPPES number (real NPIs start with 1 or 2).
// Plain JS (no JSX, no aliases) so scripts/generate-samples.mjs can import it.
import {createRng} from '../shared/utils/rng.js';

const FIRST = ['Anjali', 'Robert', 'Maria', 'James', 'Priya', 'David', 'Elena', 'Marcus', 'Grace', 'Samuel', 'Leah', 'Omar',
  'Hannah', 'Victor', 'Nora', 'Isaac', 'Chloe', 'Daniel', 'Fatima', 'Ethan', 'Irene', 'Kwame', 'Lucia', 'Noah', 'Mei',
  'Aaron', 'Sofia', 'Tariq', 'Julia', 'Felix', 'Amara', 'Caleb', 'Yuki', 'Rahul', 'Teresa', 'Ben', 'Ava', 'Diego', 'Zara', 'Paul'];
const LAST = ['Kim', 'Lopez', 'Okafor', 'Novak', 'Brennan', 'Patel', 'Haddad', 'Lindqvist', 'Moreau', 'Ibarra', 'Castellano',
  'Whitfield', 'Nakamura', 'Osei', 'Petrov', 'Delacroix', 'Fairbanks', 'Gallo', 'Hartman', 'Iyer', 'Jorgensen', 'Kowalski',
  'Mbeki', 'Oduya', 'Quinlan', 'Rasmussen', 'Sorensen', 'Thorne', 'Valdez', 'Wexler', 'Yilmaz', 'Zielinski', 'Abernathy',
  'Barros', 'Crane', 'Duarte', 'Ellison', 'Farouk', 'Greer', 'Holloway'];
const SPECIALTIES = [
  ['Family Medicine', '207Q00000X'], ['Internal Medicine', '207R00000X'], ['Pediatrics', '208000000X'],
  ['Cardiology', '207RC0000X'], ['Orthopaedic Surgery', '207X00000X'], ['Obstetrics & Gynecology', '207V00000X'],
  ['Dermatology', '207N00000X'], ['Psychiatry', '2084P0800X'], ['Nurse Practitioner', '363L00000X'],
  ['Physician Assistant', '363A00000X'], ['Endocrinology', '207RE0101X'], ['Gastroenterology', '207RG0100X'],
];
const LANGS = ['English', 'English, Spanish', 'English', 'English, Polish', 'English, Hindi', 'English', 'English, Mandarin', 'English, Arabic'];

// Lakeshore sites. TINs are fabricated (one TIN per legal entity).
export const LAKESHORE_SITES = [
  {street: '1450 Harborview Ave', suite: '200', city: 'Chicago', state: 'IL', zip: '60614', tin: '36-4815162'},
  {street: '88 Lakeshore Pkwy', suite: '410', city: 'Evanston', state: 'IL', zip: '60201', tin: '36-4815162'},
  {street: '3200 Prairie Mill Rd', suite: '105', city: 'Oak Park', state: 'IL', zip: '60302', tin: '36-2718281'},
  {street: '725 Cedar Bluff Dr', suite: '3B', city: 'Naperville', state: 'IL', zip: '60540', tin: '36-2718281'},
  {street: '19 Foundry Sq', suite: '600', city: 'Gary', state: 'IN', zip: '46402', tin: '35-1414213'},
  {street: '502 Willow Creek Blvd', suite: '220', city: 'Kenosha', state: 'WI', zip: '53140', tin: '39-1732050'},
];

// Indices of planted issues (deterministic).
export const PLANTED = {duplicate: 5, missingSuiteA: 12, tinMismatch: 33, missingSuiteB: 57, retro: 88, licenseExpired: 121, noLanguage: 140, noAccepting: 163};

const npiFor = (i, offset = 0) => `9${String(100000000 + ((i + offset) * 7919) % 899999999).padStart(9, '0')}`;

function buildLakeshore() {
  const rng = createRng(20261111);
  const usedNames = new Set();
  const out = [];
  for (let i = 0; i < 200; i++) {
    let first; let last;
    if (i === PLANTED.duplicate) { first = 'Anjali'; last = 'Shah'; } else {
      do { first = rng.pick(FIRST); last = rng.pick(LAST); } while (usedNames.has(first + last));
    }
    usedNames.add(first + last);
    const [specialty, taxonomy] = SPECIALTIES[i % 7 === 0 ? 8 + (i % 2) : rng.int(0, SPECIALTIES.length - 1)];
    const credential = specialty === 'Nurse Practitioner' ? 'NP' : specialty === 'Physician Assistant' ? 'PA-C' : rng.chance(0.82) ? 'MD' : 'DO';
    const site = LAKESHORE_SITES[i % LAKESHORE_SITES.length];
    out.push({
      id: `LHP-${String(i + 1).padStart(4, '0')}`,
      group: 'lakeshore', first, last, credential,
      npi: npiFor(i), tin: site.tin, specialty, taxonomy,
      street: site.street, suite: site.suite, city: site.city, state: site.state, zip: site.zip,
      phone: `(${site.state === 'IL' ? 312 : site.state === 'IN' ? 219 : 262}) 555-${String(1000 + rng.int(0, 8999)).slice(0, 4)}`,
      effectiveDate: '2026-12-01',
      licenseNumber: `${site.state === 'IL' ? '036' : site.state === 'IN' ? '01' : 'WI'}.${String(rng.int(100000, 999999))}`,
      licenseState: site.state,
      licenseExpiry: i === PLANTED.licenseExpired ? '2026-10-31' : `202${rng.int(7, 9)}-0${rng.int(1, 9)}-28`,
      accepting: rng.chance(0.85) ? 'Y' : 'N',
      languages: rng.pick(LANGS),
    });
  }
  return out;
}

export const LAKESHORE_PROVIDERS = buildLakeshore();

// On payer files but no longer on Lakeshore's roster (termination detection).
export const LAKESHORE_DEPARTED = {
  id: 'LHP-0201', group: 'lakeshore', first: 'Thomas', last: 'Reilly', credential: 'MD', npi: npiFor(200),
  tin: '36-2718281', specialty: 'Internal Medicine', taxonomy: '207R00000X', street: '3200 Prairie Mill Rd', suite: '105',
  city: 'Oak Park', state: 'IL', zip: '60302', phone: '(312) 555-7741', effectiveDate: '2024-03-01',
  licenseNumber: '036.448120', licenseState: 'IL', licenseExpiry: '2028-07-31', accepting: 'Y', languages: 'English',
};

// Persona B: small practice. `nppes` holds newer values found in NPPES (drives the magic-link diffs).
export const MAPLE_PROVIDERS = [
  {id: 'MSF-0001', group: 'maple', first: 'Priya', last: 'Raman', credential: 'MD', npi: npiFor(301), tin: '84-3091127',
    specialty: 'Family Medicine', taxonomy: '207Q00000X', street: '214 Maple St', suite: '120', city: 'Madison', state: 'WI',
    zip: '53703', phone: '(608) 555-0142', effectiveDate: '2023-05-01', licenseNumber: 'WI.552310', licenseState: 'WI',
    licenseExpiry: '2027-10-31', accepting: 'Y', languages: 'English, Tamil',
    nppes: {suite: '140', phone: '(608) 555-0199'}, nppesUpdated: '2026-10-03'},
  {id: 'MSF-0002', group: 'maple', first: 'Ben', last: 'Okafor', credential: 'DO', npi: npiFor(302), tin: '84-3091127',
    specialty: 'Family Medicine', taxonomy: '207Q00000X', street: '214 Maple St', suite: '120', city: 'Madison', state: 'WI',
    zip: '53703', phone: '(608) 555-0142', effectiveDate: '2024-01-15', licenseNumber: 'WI.561877', licenseState: 'WI',
    licenseExpiry: '2028-03-31', accepting: 'N', languages: 'English, Yoruba',
    nppes: {specialty: 'Sports Medicine (Family Medicine)', accepting: 'Y'}, nppesUpdated: '2026-09-21'},
  {id: 'MSF-0003', group: 'maple', first: 'Clara', last: 'Jensen', credential: 'NP', npi: npiFor(303), tin: '84-3091127',
    specialty: 'Nurse Practitioner', taxonomy: '363L00000X', street: '214 Maple St', suite: '120', city: 'Madison', state: 'WI',
    zip: '53703', phone: '(608) 555-0142', effectiveDate: '2025-06-01', licenseNumber: 'WI.590214', licenseState: 'WI',
    licenseExpiry: '2027-12-31', accepting: 'Y', languages: 'English, Danish', nppes: {}, nppesUpdated: '2025-06-01'},
  {id: 'MSF-0004', group: 'maple', first: 'Luis', last: 'Herrera', credential: 'MD', npi: npiFor(304), tin: '84-3091127',
    specialty: 'Pediatrics', taxonomy: '208000000X', street: '214 Maple St', suite: '120', city: 'Madison', state: 'WI',
    zip: '53703', phone: '(608) 555-0142', effectiveDate: '2022-09-01', licenseNumber: 'WI.534902', licenseState: 'WI',
    licenseExpiry: '2027-06-30', accepting: 'Y', languages: 'English, Spanish', nppes: {}, nppesUpdated: '2024-02-11'},
];

// Simulated NPPES/DataSpring lookup by NPI.
export const REGISTRY = Object.fromEntries(
  [...LAKESHORE_PROVIDERS, LAKESHORE_DEPARTED, ...MAPLE_PROVIDERS].map((p) => [p.npi, p]),
);

// Payer-side roster files (what each payer currently has on file per group).
export const PAYER_FILE = {
  lakeshore: [...LAKESHORE_PROVIDERS, LAKESHORE_DEPARTED].map((p) => p.npi),
  maple: MAPLE_PROVIDERS.map((p) => p.npi),
};

// ---------- Messy sample roster builders (shared by the app and the sample generator) ----------
const DATE_STYLES = [
  (y, m, d) => `${m}/${d}/${y}`,
  (y, m, d) => `${y}-${m}-${d}`,
  (y, m, d) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]} ${+d} ${y}`,
  (y, m, d) => `${+d}-${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]}-${y.slice(2)}`,
];
const messyDate = (iso, i) => { const [y, m, d] = iso.split('-'); return DATE_STYLES[i % 4](y, m, d); };
const messyPhone = (p, i) => {
  const d = p.replace(/\D/g, '');
  return [p, `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`, d, `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`][i % 4];
};
const messyName = (p, i) => [
  `${p.last}, ${p.first} ${p.credential}`,
  `Dr. ${p.first} ${p.last}`,
  `${p.first.toUpperCase()} ${p.last.toUpperCase()}, ${p.credential}`,
  `${p.first} ${p.last} ${p.credential}`,
][i % 4];
const messyAddr = (p, i) => (p.suite ? [`${p.street} Ste ${p.suite}`, `${p.street}, Suite ${p.suite}`, `${p.street} #${p.suite}`][i % 3] : p.street);

export const LAKESHORE_HEADERS = ['Doc Name', 'NPI #', 'TaxID', 'Specialty/Taxonomy', 'Prac Addr', 'City', 'St', 'Zip',
  'Phone #', 'Eff Dt', 'Lic #', 'Lic St', 'Lic Exp', 'New Pts?', 'Lang Spoken'];

export function buildLakeshoreSample() {
  const rows = LAKESHORE_PROVIDERS.map((p, i) => {
    const q = {...p};
    if (i === PLANTED.missingSuiteA || i === PLANTED.missingSuiteB) q.suite = '';
    if (i === PLANTED.tinMismatch) q.tin = `${q.tin.slice(0, 3)}${q.tin[4]}${q.tin[3]}${q.tin.slice(5)}`; // transposed digits
    if (i === PLANTED.retro) q.effectiveDate = '2026-09-20';
    if (i === PLANTED.noLanguage) q.languages = '';
    if (i === PLANTED.noAccepting) q.accepting = '';
    return {
      'Doc Name': i === PLANTED.duplicate ? 'Anjali Shah, MD' : messyName(q, i),
      'NPI #': i % 9 === 4 ? `${q.npi.slice(0, 4)}-${q.npi.slice(4)}` : q.npi,
      TaxID: i % 2 ? q.tin.replace('-', '') : q.tin,
      'Specialty/Taxonomy': i % 3 === 0 ? `${q.specialty} (${q.taxonomy})` : q.specialty,
      'Prac Addr': messyAddr(q, i), City: i % 5 === 0 ? q.city.toUpperCase() : q.city, St: q.state, Zip: q.zip,
      'Phone #': messyPhone(q.phone, i), 'Eff Dt': messyDate(q.effectiveDate, i),
      'Lic #': q.licenseNumber, 'Lic St': q.licenseState, 'Lic Exp': messyDate(q.licenseExpiry, i + 1),
      'New Pts?': q.accepting === '' ? '' : [q.accepting, q.accepting === 'Y' ? 'Yes' : 'No'][i % 2],
      'Lang Spoken': q.languages,
    };
  });
  // Duplicate provider with a name variant (entity resolution case).
  const s = LAKESHORE_PROVIDERS[PLANTED.duplicate];
  rows.splice(118, 0, {
    'Doc Name': 'Dr. A. Shah', 'NPI #': s.npi, TaxID: s.tin.replace('-', ''), 'Specialty/Taxonomy': s.specialty,
    'Prac Addr': `${s.street} Suite ${s.suite}`, City: s.city, St: s.state, Zip: s.zip, 'Phone #': messyPhone(s.phone, 2),
    'Eff Dt': messyDate(s.effectiveDate, 3), 'Lic #': s.licenseNumber, 'Lic St': s.licenseState,
    'Lic Exp': messyDate(s.licenseExpiry, 0), 'New Pts?': 'Yes', 'Lang Spoken': s.languages,
  });
  return {headers: LAKESHORE_HEADERS, rows};
}

export const MAPLE_HEADERS = ['Provider', 'Natl Provider ID', 'Tax ID No', 'Dept', 'Office Address', 'Town', 'State',
  'Postal', 'Tel', 'Start Date', 'License', 'Taking New Patients', 'Languages'];

export function buildMapleSample() {
  return {
    headers: MAPLE_HEADERS,
    rows: MAPLE_PROVIDERS.map((p, i) => ({
      Provider: messyName(p, i), 'Natl Provider ID': p.npi, 'Tax ID No': p.tin.replace('-', ''), Dept: p.specialty,
      'Office Address': i === 2 ? p.street : messyAddr(p, i), Town: p.city, State: p.state, Postal: p.zip,
      Tel: messyPhone(p.phone, i), 'Start Date': messyDate(p.effectiveDate, i), License: `${p.licenseState} ${p.licenseNumber}`,
      'Taking New Patients': p.accepting === 'Y' ? 'yes' : 'no', Languages: p.languages,
    })),
  };
}
