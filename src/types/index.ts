import { Criterion } from '../lib/criteria';
import { BountyVerdict } from '../lib/decide';

export type BountyStatus = 'OPEN' | 'SETTLED' | 'CANCELLED' | 'EXHAUSTED' | 'REFUNDED';

export interface Bounty {
  id: string;
  creator: string;
  owner_repo: string;
  title: string;
  criteria: Criterion[];
  criteria_hash: string;
  required_paths: string[];
  amount: string;
  status: BountyStatus;
  attempts: string;
  seq: string;
  schema_version: string;
}

export interface Submission {
  id: string;
  bounty_id: string;
  dev: string;
  pr_url: string;
  pr_number: string;
  head_sha: string;
  verdict: BountyVerdict;
  evidence_sha16: string;
  criterion_results: string[];
  gate: string;
  attempt: string;
  seq: string;
  schema_version: string;
}

export interface Settlement {
  bounty_id: string;
  submission_id: string;
  dev: string;
  creator: string;
  dev_amount: string;
  creator_amount: string;
  verdict: BountyVerdict;
  criteria_hash: string;
  head_sha: string;
  pr_url: string;
  evidence_sha16: string;
  schema_version: string;
}

export interface DevReputation {
  settled_count: number;
  units_earned: string;
  best_verdict_counts: Record<string, number>;
  schema_version: string;
}

export interface CreatorReputation {
  bounties_settled: number;
  units_paid: string;
  units_refunded: string;
  schema_version: string;
}

export interface EscrowStats {
  open: number;
  settled: number;
  cancelled: number;
  exhausted: number;
  refunded: number;
  verdict_release_100: number;
  verdict_release_75: number;
  verdict_release_50: number;
  verdict_release_25: number;
  verdict_refund: number;
  verdict_review: number;
  schema_version: string;
}

export interface EscrowLimits {
  title_min_chars: number;
  title_max_chars: number;
  amount_min: number;
  amount_max: number;
  max_attempts: number;
  max_criteria: number;
  min_criteria: number;
  diff_cap_chars: number;
  max_required_paths: number;
  verdict_thresholds: Record<string, number>;
}
