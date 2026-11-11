import {describe, expect, it} from 'vitest';
import {buildLakeshoreSample, buildMapleSample, REGISTRY} from '../data/providers.js';
import {mapHeaders} from '../services/mock/schemaMapper.js';
import {runPreflight} from '../services/mock/preflight.js';
import {applyResolutions, routeToPayers} from '../services/mock/payerRouter.js';
import {parseCsv, toCsv} from '../shared/utils/csv.js';
import {parseDate} from '../shared/utils/format.js';

const load = (b) => parseCsv(toCsv(b.headers, b.rows));

describe('synthetic data', () => {
  it('uses fake 10-digit NPIs starting with 9', () => {
    Object.keys(REGISTRY).forEach((n) => expect(n).toMatch(/^9\d{9}$/));
  });
});

describe('pre-flight pipeline', () => {
  it('maps every messy Lakeshore header and surfaces exactly the 7 planted exceptions', () => {
    const {headers, rows} = load(buildLakeshoreSample());
    const mapping = mapHeaders(headers, rows);
    expect(mapping.every((m) => m.target)).toBe(true);
    const r = runPreflight(rows, mapping);
    expect(r.groupId).toBe('lakeshore');
    expect(r.exceptions.map((e) => e.type).sort()).toEqual(
      ['duplicate', 'license_expired', 'missing_suite', 'missing_suite', 'retro_date', 'termination', 'tin_mismatch'],
    );
    expect(r.stats.touchlessRate).toBeGreaterThan(0.95);
    expect(r.exceptions.filter((e) => e.protected).every((e) => e.tier !== 'high')).toBe(true);
  });

  it('routes to payers with isolated rules', () => {
    const {headers, rows} = load(buildLakeshoreSample());
    const r = runPreflight(rows, mapHeaders(headers, rows));
    const accepted = r.exceptions.map((e) => ({...e, status: 'accepted'}));
    const {records, terminations} = applyResolutions(r.records, accepted);
    const results = routeToPayers(records, terminations);
    expect(records).toHaveLength(200);
    expect(results.find((x) => x.payerId === 'summit').held.length).toBeGreaterThan(0);
    expect(results.find((x) => x.payerId === 'northwind').held.length).toBeLessThan(results.find((x) => x.payerId === 'summit').held.length + 2);
  });

  it('handles the small-practice sample', () => {
    const {headers, rows} = load(buildMapleSample());
    const r = runPreflight(rows, mapHeaders(headers, rows));
    expect(r.groupId).toBe('maple');
    expect(r.exceptions).toHaveLength(1);
  });

  it('parses messy date formats', () => {
    ['12/01/2026', '2026-12-01', 'Dec 1 2026', '1-Dec-26'].forEach((d) => expect(parseDate(d)).toBe('2026-12-01'));
  });
});
