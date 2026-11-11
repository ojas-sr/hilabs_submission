// Fixed "as of" date for rule evaluation so the demo is deterministic.
export const DEMO_TODAY = '2026-11-11';

export const DISCLAIMER = 'Prototype. Synthetic data only. AI behaviour simulated.';

export const PERSONAS = {
  groupAdmin: {
    id: 'groupAdmin', short: 'Group admin', label: 'Delegated group admin',
    org: 'Lakeshore Health Partners', user: 'Maya Chen (CVO analyst)', clinicians: 200,
  },
  practice: {
    id: 'practice', short: 'Practice manager', label: 'Small practice manager',
    org: 'Maple Street Family Medicine', user: 'Rosa Alvarez (office manager)', clinicians: 4,
  },
  payerOps: {
    id: 'payerOps', short: 'Payer ops', label: 'Payer ops',
    org: 'Northwind Health Plan', user: 'Devon Brooks (network ops lead)', clinicians: null,
  },
};

// Confidence tiers. High may be bulk-accepted; Medium/Low need per-row confirmation.
export const TIERS = {
  high: {label: 'High', min: 0.9, color: 'success'},
  medium: {label: 'Medium', min: 0.7, color: 'warning'},
  low: {label: 'Low', min: 0, color: 'error'},
};
export const tierFor = (c) => (c >= TIERS.high.min ? 'high' : c >= TIERS.medium.min ? 'medium' : 'low');

// Fields the AI may never overwrite without explicit human confirmation.
export const PROTECTED_FIELDS = ['tin', 'effectiveDate', 'licenseNumber', 'licenseExpiry', 'specialty', 'termination', 'entity'];

export const TRACKER_STAGES = ['Submitted', 'Validated', 'Payer approved', 'Loaded in claims', 'Live in directory'];

export const SLA_HOURS = 48; // 2 business days (No Surprises Act directory update SLA)

export const SAMPLE_FILES = {
  groupAdmin: {path: 'samples/lakeshore_roster_nov2026.csv', name: 'lakeshore_roster_nov2026.csv'},
  practice: {path: 'samples/maple_street_roster.csv', name: 'maple_street_roster.csv'},
};
