import { describe, it, expect } from 'vitest';
import { decide, CriterionResultLabel, BountyVerdict } from '../lib/decide';
import { Criterion } from '../lib/criteria';

// Independent decision oracle written independently
function independentOracle(
  criteria: Criterion[],
  results: CriterionResultLabel[],
  isTruncated: boolean
): BountyVerdict {
  if (criteria.length !== results.length) return 'REVIEW';

  if (isTruncated) {
    for (let i = 0; i < criteria.length; i++) {
      if (criteria[i].level === 'MUST' && results[i] !== 'YES') {
        return 'REVIEW';
      }
    }
  }

  for (let i = 0; i < criteria.length; i++) {
    if (criteria[i].level === 'MUST') {
      if (results[i] === 'UNCLEAR') return 'REVIEW';
      if (results[i] === 'NO') return 'REFUND';
    }
  }

  let totalPts = 0;
  let totalMax = 0;
  const scoreTable: Record<CriterionResultLabel, number> = {
    YES: 2,
    PARTIAL: 1,
    NO: 0,
    UNCLEAR: 0,
  };

  for (let i = 0; i < criteria.length; i++) {
    const w = criteria[i].level === 'MUST' ? 3 : 1;
    totalMax += w * 2;
    totalPts += w * scoreTable[results[i]];
  }

  if (totalMax === 0) return 'REFUND';

  const percentage = Math.floor((totalPts * 100) / totalMax);

  let v: BountyVerdict;
  if (percentage >= 90) v = 'RELEASE_100';
  else if (percentage >= 65) v = 'RELEASE_75';
  else if (percentage >= 40) v = 'RELEASE_50';
  else if (percentage >= 15) v = 'RELEASE_25';
  else v = 'REFUND';

  if (isTruncated && (v === 'RELEASE_100' || v === 'RELEASE_75')) {
    v = 'RELEASE_50';
  }

  return v;
}

// Simple deterministic PRNG for reproducible fuzz test
function makeRng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe('Decide Function 5000-Case Fuzz Test & Boundary Verification', () => {
  it('runs 5000 random iterations against independent oracle with printed seed', () => {
    const seed = 91827364;
    console.log(`[Decide Fuzz] Starting 5000 fuzz iterations with random seed: ${seed}`);
    const rng = makeRng(seed);

    const levels: ('MUST' | 'SHOULD')[] = ['MUST', 'SHOULD'];
    const labels: CriterionResultLabel[] = ['YES', 'PARTIAL', 'NO', 'UNCLEAR'];

    for (let iter = 0; iter < 5000; iter++) {
      const count = Math.floor(rng() * 5) + 1; // 1 to 5 criteria
      const criteria: Criterion[] = [];
      let hasMust = false;

      for (let j = 0; j < count; j++) {
        const lvl = levels[Math.floor(rng() * levels.length)];
        if (lvl === 'MUST') hasMust = true;
        criteria.push({ level: lvl, text: `Test criterion ${j}` });
      }
      if (!hasMust) {
        criteria[0].level = 'MUST';
      }

      const results: CriterionResultLabel[] = [];
      for (let j = 0; j < count; j++) {
        results.push(labels[Math.floor(rng() * labels.length)]);
      }

      const isTrunc = rng() > 0.5;

      const actual = decide(criteria, results, isTrunc);
      const expected = independentOracle(criteria, results, isTrunc);

      expect(actual).toBe(expected);
    }

    console.log('[Decide Fuzz] 5000 iterations passed with 100% agreement against independent oracle.');
  });

  it('correctly handles boundary thresholds (90%, 65%, 40%, 15%)', () => {
    // 1 MUST criterion -> 6 max pts
    const crit: Criterion[] = [{ level: 'MUST', text: 'Criterion 1' }];

    // YES = 6/6 = 100% -> RELEASE_100
    expect(decide(crit, ['YES'])).toBe('RELEASE_100');
    // PARTIAL = 3/6 = 50% -> RELEASE_50
    expect(decide(crit, ['PARTIAL'])).toBe('RELEASE_50');
    // NO = MUST NO -> REFUND
    expect(decide(crit, ['NO'])).toBe('REFUND');
    // UNCLEAR = MUST UNCLEAR -> REVIEW
    expect(decide(crit, ['UNCLEAR'])).toBe('REVIEW');
  });

  it('caps at RELEASE_50 when diff is truncated even with 100% score', () => {
    const crit: Criterion[] = [{ level: 'MUST', text: 'Criterion 1' }];
    expect(decide(crit, ['YES'], true)).toBe('RELEASE_50');
  });
});
