// Regenerates the bundled messy sample rosters in public/samples/ from the
// seeded synthetic dataset. Run: node scripts/generate-samples.mjs
import {writeFileSync} from 'node:fs';
import {buildLakeshoreSample, buildMapleSample} from '../src/data/providers.js';
import {toCsv} from '../src/shared/utils/csv.js';

const out = new URL('../public/samples/', import.meta.url);
const a = buildLakeshoreSample();
writeFileSync(new URL('lakeshore_roster_nov2026.csv', out), toCsv(a.headers, a.rows));
const b = buildMapleSample();
writeFileSync(new URL('maple_street_roster.csv', out), toCsv(b.headers, b.rows));
console.log(`Wrote ${a.rows.length} + ${b.rows.length} rows`);
