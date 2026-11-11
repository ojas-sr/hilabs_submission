import {useCallback} from 'react';
import {SAMPLE_FILES} from '../constants/index.js';
import {parseCsv} from '../utils/csv.js';
import {buildLakeshoreSample, buildMapleSample} from '../../data/providers.js';

/** Fetches the bundled messy sample CSV (falls back to generating it in memory). */
export function useSampleRoster() {
  return useCallback(async (personaId) => {
    const file = SAMPLE_FILES[personaId === 'practice' ? 'practice' : 'groupAdmin'];
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}${file.path}`);
      if (!res.ok) throw new Error(String(res.status));
      return {name: file.name, ...parseCsv(await res.text())};
    } catch {
      const s = personaId === 'practice' ? buildMapleSample() : buildLakeshoreSample();
      return {name: file.name, headers: s.headers, rows: s.rows};
    }
  }, []);
}
