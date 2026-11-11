// Seeded history so dashboards look lived-in before the demo runs. All synthetic.
export const PAST_SUBMISSIONS = {
  groupAdmin: [
    {id: 'SUB-2026-1028', date: '2026-10-28', file: 'LHP_delta_wk43.xlsx', rows: 37, touchless: 0.946,
      payers: {northwind: 'live', summit: 'live', bluewater: 'live'}},
    {id: 'SUB-2026-1014', date: '2026-10-14', file: 'LHP_roster_Oct.csv', rows: 198, touchless: 0.929,
      payers: {northwind: 'live', summit: 'live', bluewater: 'review'}},
    {id: 'SUB-2026-0930', date: '2026-09-30', file: 'Lakeshore Q3 roster FINAL v2.xlsx', rows: 201, touchless: 0.881,
      payers: {northwind: 'live', summit: 'live', bluewater: 'live'}},
  ],
  practice: [
    {id: 'SUB-2026-0812', date: '2026-08-12', file: 'Magic-link attestation', rows: 4, touchless: 1,
      payers: {northwind: 'live', summit: 'live', bluewater: 'live'}},
    {id: 'SUB-2026-0506', date: '2026-05-06', file: 'staff list.csv', rows: 4, touchless: 0.75,
      payers: {northwind: 'live', summit: 'live', bluewater: 'live'}},
  ],
};

export const KPI_BASELINE = {
  groupAdmin: {touchless: 0.929, openExceptions: 3, medianHoursToLive: 31, directoryAccuracy: 0.968},
  practice: {touchless: 0.96, openExceptions: 0, medianHoursToLive: 26, directoryAccuracy: 0.981},
  payerOps: {touchless: 0.912, openExceptions: 6, medianHoursToLive: 34, directoryAccuracy: 0.957},
};

// 12-week touchless auto-adjudication trend for the payer (rows across all groups).
export const TOUCHLESS_TREND = [
  {week: 'Aug 24', rate: 0.61, rows: 3120}, {week: 'Aug 31', rate: 0.64, rows: 2890}, {week: 'Sep 7', rate: 0.69, rows: 3410},
  {week: 'Sep 14', rate: 0.72, rows: 3305}, {week: 'Sep 21', rate: 0.76, rows: 3650}, {week: 'Sep 28', rate: 0.79, rows: 4980},
  {week: 'Oct 5', rate: 0.83, rows: 3720}, {week: 'Oct 12', rate: 0.86, rows: 3890}, {week: 'Oct 19', rate: 0.88, rows: 4105},
  {week: 'Oct 26', rate: 0.9, rows: 4230}, {week: 'Nov 2', rate: 0.92, rows: 4410}, {week: 'Nov 9', rate: 0.94, rows: 4380},
];

// Exceptions other groups could not resolve themselves (payer ops backlog).
export const PAYER_QUEUE_SEED = [
  {id: 'PQ-1041', group: 'Riverbend Orthopedics', provider: 'Gideon Marsh, MD', npi: '9417730012', issue: 'TIN/NPI mismatch',
    aiSuggestion: 'Use PECOS reassignment TIN 41-7720931', providerNote: 'New TIN after acquisition; contract amendment pending', ageHours: 30, tier: 'low', status: 'open', source: 'Provider rejected AI fix'},
  {id: 'PQ-1038', group: 'Harbor Pediatrics', provider: 'Lena Fischer, MD', npi: '9203348871', issue: 'Retro effective date (75 days)',
    aiSuggestion: 'Set effective date to Dec 1, 2026', providerNote: 'Credentialed Aug 28; claims already denied', ageHours: 41, tier: 'medium', status: 'open', source: 'Provider rejected AI fix'},
  {id: 'PQ-1035', group: 'Northgate Behavioral Health', provider: 'Samir Qureshi, PsyD', npi: '9558102294', issue: 'Licence expired in IN',
    aiSuggestion: 'Hold from directory until renewal verified', providerNote: '', ageHours: 52, tier: 'low', status: 'open', source: 'Unresolved at submission'},
];

const t = (d) => new Date(`${d}`).getTime();
// Historic audit entries (hash chain is computed when the store initialises).
export const AUDIT_SEED = [
  {ts: t('2026-10-28T09:12:00'), actor: 'Maya Chen', org: 'Lakeshore Health Partners', event: 'File received', record: 'LHP_delta_wk43.xlsx', field: '—', original: '37 rows, 12 columns', aiSuggestion: 'Mapped 12/12 columns (avg 95%)', action: 'Uploaded', final: 'Accepted for pre-flight'},
  {ts: t('2026-10-28T09:14:00'), actor: 'Maya Chen', org: 'Lakeshore Health Partners', event: 'Exception resolved', record: 'NPI 9000183215', field: 'Suite', original: '1450 Harborview Ave', aiSuggestion: 'Suite 200 (NPPES)', action: 'Bulk-accepted (High)', final: 'Suite 200'},
  {ts: t('2026-10-28T09:15:00'), actor: 'Maya Chen', org: 'Lakeshore Health Partners', event: 'Exception resolved', record: 'NPI 9000253170', field: 'Effective date', original: 'Aug 1, 2026', aiSuggestion: 'Nov 1, 2026', action: 'Confirmed (Medium)', final: 'Nov 1, 2026'},
  {ts: t('2026-10-28T09:16:00'), actor: 'Maya Chen', org: 'Lakeshore Health Partners', event: 'Submitted', record: 'SUB-2026-1028', field: '—', original: '—', aiSuggestion: '—', action: 'Submitted to 3 payers', final: '37 rows routed'},
  {ts: t('2026-10-29T13:40:00'), actor: 'System (ack file)', org: 'Northwind Health Plan', event: 'Payer status', record: 'SUB-2026-1028', field: 'Status', original: 'Loaded in claims', aiSuggestion: '—', action: 'Ack file processed', final: 'Live in directory'},
  {ts: t('2026-11-02T10:05:00'), actor: 'Devon Brooks', org: 'Northwind Health Plan', event: 'Payer ops decision', record: 'PQ-1029', field: 'Billing TIN', original: '83-1120458', aiSuggestion: '83-1120485 (PECOS)', action: 'Approved AI fix', final: '83-1120485'},
];
