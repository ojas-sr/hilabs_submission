# MedCare Roster Co-Pilot (prototype)

An AI-native zero-template intake, pre-flight validation and exception gateway for delegated provider rosters.
It is deliberately not a manual data-entry portal.

> **Prototype. Synthetic data only. AI behaviour simulated.** Everything runs in the browser. There is no backend,
> no login and no real API calls. Names, addresses, TINs and NPIs are fabricated (every NPI starts with `9`, which
> no real NPI does). Payer names are fictional.

## 2-minute demo path
Click **Start demo** in the top bar. The guide walks through:
1. **Overview**: KPIs (touchless rate, open exceptions, time to live, directory accuracy) and per-payer submission status.
2. **Zero-Template Drop**: "Use sample messy roster" runs Parsing → Schema mapping → Entity resolution → Pre-flight (NPPES, PECOS, state licence, DataSpring).
3. **Schema mapping**: source column → canonical field, with confidence and the reason; editable.
4. **Exceptions**: 7 of 201 rows. Bulk-accept High; confirm Medium/Low per row; protected fields are never auto-overwritten.
5. **Submit & routing**: one submission to 3 payers, each with isolated rules and its own outcome.
6. **Claims-Ready tracker**: provider × payer stepper with SLA countdown; "Simulate payer ack file".
7. **90-day attestation** (small practice persona): email preview with a magic link.
8. **Magic link** (`#/attest/mk_7Q2xR9-maple`): zero-login, pre-filled, diffs highlighted, one-click attest.
9. **Audit trail**: hash-chained log with "Verify chain" and "Simulate tamper".
10. **Payer ops**: exceptions-only queue, touchless trend, FTE hours saved.

**Reset demo** (the circular-arrow icon) restores the initial synthetic state.

## Run
Requires Node 18+.
```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # serve dist/ locally
npx vitest run    # pipeline tests
```
The build uses `HashRouter` and `base: './'`, so `dist/` works as-is on GitHub Pages, Vercel or any static host, with no rewrites.

## Structure
- `src/pages/` route screens: `home`, `intake` (drop, mapping, exceptions, submit), `tracker`, `attestation`, `audit`, `payer-ops`
- `src/components/` layout (shell, guide, footer, about) and UI primitives (status/tier chips, KPI tile, chart)
- `src/services/mock/` simulated AI: `schemaMapper`, `preflight`, `payerRouter`
- `src/data/` seeded synthetic providers, payers, canonical schema, seeded history
- `src/shared/` demo store (React context + localStorage), constants, utils (CSV parser, normalisers, hash)
- `public/samples/` bundled messy rosters (regenerate with `node scripts/generate-samples.mjs`)
- Design rules: `docs/design/DESIGN_PRINCIPLES.md`; colours come only from `src/styles/tokens.js` / `theme.js`
