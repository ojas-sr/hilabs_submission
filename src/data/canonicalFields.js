// Canonical roster schema (subset of the 300+ field model) with header synonyms
// the simulated schema-mapping model "knows".
export const CANONICAL_FIELDS = [
  {key: 'name', label: 'Provider full name', synonyms: ['doc name', 'provider', 'provider name', 'name', 'physician', 'clinician', 'full name', 'rendering provider']},
  {key: 'npi', label: 'Individual NPI', synonyms: ['npi', 'npi #', 'npi number', 'natl provider id', 'national provider id', 'type 1 npi'], pattern: /^\d{4}-?\d{6}$/},
  {key: 'tin', label: 'Billing TIN', protected: true, synonyms: ['taxid', 'tax id', 'tin', 'tax id no', 'ein', 'fein', 'tax identification'], pattern: /^\d{2}-?\d{7}$/},
  {key: 'specialty', label: 'Specialty / taxonomy', protected: true, synonyms: ['specialty', 'specialty/taxonomy', 'taxonomy', 'dept', 'department', 'spec']},
  {key: 'address', label: 'Practice street address', synonyms: ['prac addr', 'practice address', 'office address', 'address', 'street', 'service location', 'addr']},
  {key: 'city', label: 'City', synonyms: ['city', 'town']},
  {key: 'state', label: 'State', synonyms: ['st', 'state', 'prov']},
  {key: 'zip', label: 'ZIP code', synonyms: ['zip', 'zip code', 'postal', 'postal code', 'zipcode'], pattern: /^\d{5}(-\d{4})?$/},
  {key: 'phone', label: 'Practice phone', synonyms: ['phone', 'phone #', 'tel', 'telephone', 'office phone', 'ph']},
  {key: 'effectiveDate', label: 'Effective date', protected: true, synonyms: ['eff dt', 'effective date', 'start date', 'eff date', 'begin date', 'effective']},
  {key: 'licenseNumber', label: 'State licence number', protected: true, synonyms: ['lic #', 'license', 'licence', 'license number', 'lic no', 'state license']},
  {key: 'licenseState', label: 'Licence state', synonyms: ['lic st', 'license state', 'lic state']},
  {key: 'licenseExpiry', label: 'Licence expiry', protected: true, synonyms: ['lic exp', 'license expiration', 'lic expiry', 'expiration']},
  {key: 'accepting', label: 'Accepting new patients', synonyms: ['new pts?', 'new pts', 'accepting new patients', 'taking new patients', 'accepting', 'panel open']},
  {key: 'languages', label: 'Languages spoken', synonyms: ['lang spoken', 'languages', 'language', 'langs']},
];

export const fieldByKey = Object.fromEntries(CANONICAL_FIELDS.map((f) => [f.key, f]));
