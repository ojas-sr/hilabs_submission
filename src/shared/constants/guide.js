// The 2-minute reviewer journey: one strategic-positioning intro, then three
// persona flows. Each stop pins a route + persona and anchors a tooltip to
// `target` ([data-tour="..."]); missing or oversized targets fall back to a
// docked panel. `next` names an action the guide performs before moving on.
export const MAGIC_TOKEN = 'mk_7Q2xR9-maple';

export const FLOWS = {
  group: {n: 1, label: 'Large group: bulk roster update', persona: 'groupAdmin'},
  practice: {n: 2, label: 'Small practice: 90-day check', persona: 'practice'},
  payer: {n: 3, label: 'Health plan: exceptions only', persona: 'payerOps'},
};

// Shown on the landing card and on the first stop of each flow.
export const PERSONA_CARDS = [
  {id: 'groupAdmin', flow: 'group', name: 'Maya', role: 'CVO analyst, Lakeshore Health Partners (200 clinicians)',
    pain: '3 payers, 3 templates, then a 21+ day wait.',
    win: 'Drops her own file once; fixes only exceptions.'},
  {id: 'practice', flow: 'practice', name: 'Rosa', role: 'Office manager, Maple Street Family Medicine (4 clinicians)',
    pain: '~20 payer portals for 90-day directory checks.',
    win: 'Confirms data from one emailed link, no login.'},
  {id: 'payerOps', flow: 'payer', name: 'Devon', role: 'Network ops lead, Northwind Health Plan (the paying customer)',
    pain: 'Analysts chase stale rosters against a 2-business-day legal deadline.',
    win: 'Works only true exceptions, fully audited.'},
];

export const INTRO = {
  eyebrow: 'The case: should MedCare build a provider roster portal?',
  headline: 'Not another data-entry portal. An AI co-pilot that takes the roster providers already have.',
  problem: 'Health plans get provider rosters by email, spreadsheet and phone. Directories go stale, claims deny, and the No Surprises Act now expects changes live within 2 business days.',
  pillars: [
    {title: 'Why not a portal?', body: 'Providers already juggle DataSpring (CAQH), Availity and ~20 payer portals. Another form goes unused, and bypasses the AI customers pay MedCare for.'},
    {title: 'What we built instead', body: 'Drop any file → AI maps, validates and suggests fixes → provider confirms only exceptions → each payer gets clean, rule-checked data.'},
    {title: 'Where it fits', body: 'Complements DataSpring (the provider profile). MedCare owns the last mile: payer-specific checks, routing, claims-readiness, audit.'},
  ],
  // 2x2 positioning (same axes as the deck). Quadrant keys: [y][x], with y: 'ai' | 'forms' and x: 'generic' | 'payer'.
  matrix: {
    x: ['Generic provider profile', 'Payer-specific: contract, site, date'],
    y: ['Provider types into forms', 'Native files, AI-checked'],
    cells: {
      ai: {
        generic: [{name: 'symplr-type tools', stance: 'We accept their exports'}],
        payer: [{name: 'MedCare Roster Co-Pilot', stance: 'Open white space', us: true}],
      },
      forms: {
        generic: [{name: 'DataSpring (CAQH)', stance: 'Pre-fill source'}, {name: 'Availity', stance: 'Embed as a tile'}],
        payer: [{name: 'Payer-owned portals', stance: 'Host our widget'}],
      },
    },
    note: 'Positions are a hypothesis to validate in discovery.',
  },
};

export const GUIDE_STEPS = [
  {type: 'intro', route: '/', persona: 'groupAdmin'},

  // Flow 1: Maya, delegated group admin
  {flow: 'group', route: '/intake', persona: 'groupAdmin', target: 'sample', next: 'loadSample', meet: true,
    title: 'Drop the file she already has',
    what: 'No template. Maya drops her raw spreadsheet with messy headers and mixed date formats. Press Next to load the sample.',
    why: 'Rigid templates are why providers fall back to email.',
    metric: 'Upload abandonment < 10%'},
  {flow: 'group', route: '/intake/mapping', persona: 'groupAdmin', target: 'mapping',
    title: 'AI maps the columns',
    what: '"Doc Name", "NPI #" and "Eff Dt" are matched to standard fields. The 2 low-confidence matches are flagged.',
    why: 'She checks 2 columns, not 15. Showing confidence builds trust.',
    metric: 'Mappings accepted without edits ≥ 90%'},
  {flow: 'group', route: '/intake/exceptions', persona: 'groupAdmin', target: 'bulk',
    title: 'Only the exceptions need her',
    what: '201 rows are checked against NPPES, state licences and payer records. 97% pass; 7 need a decision.',
    why: 'Effort drops from every row to a few. AI never silently changes contract or clinical fields.',
    metric: 'Exceptions resolved inline ≥ 70%'},
  {flow: 'group', route: '/intake/submit', persona: 'groupAdmin', target: 'payers', next: 'submit',
    title: 'Submit once, 3 payers receive it',
    what: 'Each payer applies its own private rules, so results can differ per plan.',
    why: 'Providers enter data once; payers keep control of their contract logic.',
    metric: 'Touchless rows ≥ 80% (North Star)'},
  {flow: 'group', route: '/tracker', persona: 'groupAdmin', target: 'ack', next: 'ack',
    title: 'When can each doctor bill?',
    what: 'Per-payer status from submitted to live in claims and directory, against the 2-business-day deadline.',
    why: 'Getting paid, not "data quality", is what brings providers back.',
    metric: '≥ 50% fewer "where is my roster?" calls'},

  // Flow 2: Rosa, small practice
  {flow: 'practice', route: '/attestation', persona: 'practice', target: 'magic', meet: true,
    title: 'The 90-day check arrives by email',
    what: 'Rosa gets a magic link instead of another portal login.',
    why: 'Small practices will not adopt a new login. Meet them in their inbox.',
    metric: 'Completion ≥ 45% in 5 days (vs ~12% by phone/fax)'},
  {flow: 'practice', route: `/attest/${MAGIC_TOKEN}`, persona: 'practice', target: 'attest',
    title: 'Confirm, don\'t retype',
    what: 'Data is pre-filled from public registries; only the 4 changes are highlighted. One click confirms.',
    why: 'Verifying is faster and less error-prone than data entry.',
    metric: 'Median time to attest < 2 min'},

  // Flow 3: Devon, payer ops (the buyer)
  {flow: 'payer', route: '/payer-ops', persona: 'payerOps', target: 'queue', meet: true,
    title: 'The payer sees only what is left',
    what: 'Devon\'s team works only the items providers could not resolve.',
    why: 'This is the ROI the health plan pays for: fewer analyst hours and updates live within 48h.',
    metric: '100% of verified updates live < 48h'},
  {flow: 'payer', route: '/audit', persona: 'payerOps', target: 'verify',
    title: 'Every change is traceable',
    what: 'Original value → AI suggestion → who approved it, chained so tampering shows.',
    why: 'Audit-readiness turns a convenience tool into a compliance must-have.',
    metric: '100% of changes traceable'},
];
