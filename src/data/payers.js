// Fictional payers. Each runs its own isolated rule set (tenant sandbox).
export const PAYERS = [
  {
    id: 'northwind', name: 'Northwind Health Plan', short: 'Northwind', line: 'Commercial PPO/HMO', core: 'FACETS',
    rules: [
      {id: 'retro', label: 'Retro effective dates up to 60 days', retroDays: 60},
      {id: 'suite', label: 'Suite required for directory display'},
      {id: 'license', label: 'Active state licence required'},
    ],
    ackHours: [0, 0.3, 8, 19, 27], // simulated hours from submission to each stage
  },
  {
    id: 'summit', name: 'Summit Care', short: 'Summit', line: 'Commercial + Exchange', core: 'QNXT',
    rules: [
      {id: 'retro', label: 'Retro effective dates up to 30 days', retroDays: 30},
      {id: 'language', label: 'Languages spoken required (directory rule)'},
      {id: 'license', label: 'Active state licence required'},
    ],
    ackHours: [0, 0.4, 11, 23, 36],
  },
  {
    id: 'bluewater', name: 'Bluewater Medicare Advantage', short: 'Bluewater MA', line: 'Medicare Advantage', core: 'FACETS',
    rules: [
      {id: 'retro', label: 'No retro effective dates (MA delegated contract)', retroDays: 0},
      {id: 'accepting', label: 'Accepting-new-patients flag required (CMS directory)'},
      {id: 'license', label: 'Active state licence + PECOS enrolment'},
    ],
    ackHours: [0, 0.5, 14, 30, 41],
  },
];

export const payerById = Object.fromEntries(PAYERS.map((p) => [p.id, p]));
