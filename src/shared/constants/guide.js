// Guided 2-minute demo path. Each step pins a route + persona; `next` names an
// optional action the guide performs before moving on.
export const MAGIC_TOKEN = 'mk_7Q2xR9-maple';

export const GUIDE_STEPS = [
  {route: '/', persona: 'groupAdmin', title: 'Meet Lakeshore Health Partners',
    body: 'A 200-clinician delegated group submitting to 3 payers. Today that means payer-specific templates and a 21+ day wait. Goal: at least 80% of rows touchless and live in under 48h.'},
  {route: '/intake', persona: 'groupAdmin', title: 'Zero-Template Drop', next: 'loadSample',
    body: 'Drop any CSV/XLSX as-is, with no template. Click "Use sample messy roster", or press Next and the guide will do it.'},
  {route: '/intake/mapping', persona: 'groupAdmin', title: 'AI schema mapping',
    body: 'The Co-Pilot mapped messy headers ("Doc Name", "NPI #", "Eff Dt") to the canonical schema. Ambiguous ones such as "St" show lower confidence. Change any with the dropdown.'},
  {route: '/intake/exceptions', persona: 'groupAdmin', title: 'Only the exceptions surface',
    body: 'About 97% of rows passed untouched. Bulk-accept the High-tier fixes; Medium and Low need per-row confirmation, and contract or clinical fields are locked.'},
  {route: '/intake/submit', persona: 'groupAdmin', title: 'Submit once, route to many', next: 'submit',
    body: 'One submission fans out to 3 payers, and each runs its own isolated rule set. Press Submit (or Next). Anything left unresolved goes to payer ops.'},
  {route: '/tracker', persona: 'groupAdmin', title: 'Claims-Ready tracker', next: 'ack',
    body: 'See when each doctor can bill, per payer, with a 2-business-day SLA countdown. Click "Simulate payer ack file" to advance the states.'},
  {route: '/attestation', persona: 'practice', title: 'Small practice: 90-day attestation',
    body: 'Switch to Rosa, office manager of a 4-clinician practice. The No Surprises Act 90-day check-in arrives as an email with a magic link. Open it.'},
  {route: `/attest/${MAGIC_TOKEN}`, persona: 'practice', title: 'Magic link, no login',
    body: 'Data is pre-filled from NPPES and DataSpring, and only the changes are highlighted. Review them, then click "All correct, attest".'},
  {route: '/audit', persona: 'groupAdmin', title: 'Tamper-evident audit trail',
    body: 'Every original value, AI suggestion and human action is chained by hash. Click "Verify chain".'},
  {route: '/payer-ops', persona: 'payerOps', title: 'Payer ops: exceptions only',
    body: 'Northwind ops sees only what providers could not resolve, plus the touchless trend and FTE hours saved. That is the end of the tour.'},
];
