import { Criterion } from './criteria';

export type CriterionResultLabel = 'YES' | 'PARTIAL' | 'NO' | 'UNCLEAR';
export type BountyVerdict =
  | 'RELEASE_100'
  | 'RELEASE_75'
  | 'RELEASE_50'
  | 'RELEASE_25'
  | 'REFUND'
  | 'REVIEW';

export interface ExpectedScoreCalculation {
  points: number;
  maxPoints: number;
  percentage: number;
  verdict: BountyVerdict;
  explanation: string;
}

/**
 * Pure client-side port of decide() from ShipEscrow.py
 * NOTE: For DISPLAY and INTERACTIVE PREVIEW purposes only.
 * The contract itself always executes decide() during consensus.
 */
export function decide(
  criteria: Criterion[],
  results: CriterionResultLabel[],
  isTruncated: boolean = false
): BountyVerdict {
  if (criteria.length !== results.length) {
    return 'REVIEW';
  }

  // Truncation safety: any MUST not YES is REVIEW, max payout RELEASE_50
  if (isTruncated) {
    for (let i = 0; i < criteria.length; i++) {
      if (criteria[i].level === 'MUST' && results[i] !== 'YES') {
        return 'REVIEW';
      }
    }
  }

  // Check for MUST UNCLEAR or MUST NO
  for (let i = 0; i < criteria.length; i++) {
    if (criteria[i].level === 'MUST') {
      if (results[i] === 'UNCLEAR') return 'REVIEW';
      if (results[i] === 'NO') return 'REFUND';
    }
  }

  // Compute weighted points
  let points = 0;
  let maxPoints = 0;
  const valMap: Record<CriterionResultLabel, number> = {
    YES: 2,
    PARTIAL: 1,
    NO: 0,
    UNCLEAR: 0,
  };

  for (let i = 0; i < criteria.length; i++) {
    const weight = criteria[i].level === 'MUST' ? 3 : 1;
    maxPoints += weight * 2;
    points += weight * (valMap[results[i]] ?? 0);
  }

  if (maxPoints === 0) return 'REFUND';

  const pct = Math.floor((points * 100) / maxPoints);

  let verdict: BountyVerdict;
  if (pct >= 90) verdict = 'RELEASE_100';
  else if (pct >= 65) verdict = 'RELEASE_75';
  else if (pct >= 40) verdict = 'RELEASE_50';
  else if (pct >= 15) verdict = 'RELEASE_25';
  else verdict = 'REFUND';

  if (isTruncated && (verdict === 'RELEASE_100' || verdict === 'RELEASE_75')) {
    verdict = 'RELEASE_50';
  }

  return verdict;
}

export function calculateExpectedScore(
  criteria: Criterion[],
  results: CriterionResultLabel[],
  isTruncated: boolean = false
): ExpectedScoreCalculation {
  let points = 0;
  let maxPoints = 0;
  const valMap: Record<CriterionResultLabel, number> = {
    YES: 2,
    PARTIAL: 1,
    NO: 0,
    UNCLEAR: 0,
  };

  for (let i = 0; i < criteria.length; i++) {
    const weight = criteria[i].level === 'MUST' ? 3 : 1;
    maxPoints += weight * 2;
    if (results[i]) {
      points += weight * (valMap[results[i]] ?? 0);
    }
  }

  const percentage = maxPoints > 0 ? Math.floor((points * 100) / maxPoints) : 0;
  const verdict = decide(criteria, results, isTruncated);

  let explanation = `${points}/${maxPoints} weighted points (${percentage}%).`;
  if (verdict === 'REFUND') {
    if (criteria.some((c, i) => c.level === 'MUST' && results[i] === 'NO')) {
      explanation += ' Immediate refund: a MUST criterion evaluated to NO.';
    } else {
      explanation += ' Below minimum threshold (15%), resulting in REFUND.';
    }
  } else if (verdict === 'REVIEW') {
    if (isTruncated && criteria.some((c, i) => c.level === 'MUST' && results[i] !== 'YES')) {
      explanation += ' Truncated diff requires manual REVIEW when MUST criteria are not strictly YES.';
    } else {
      explanation += ' MUST criterion evaluated to UNCLEAR, requiring manual REVIEW.';
    }
  }

  return { points, maxPoints, percentage, verdict, explanation };
}
