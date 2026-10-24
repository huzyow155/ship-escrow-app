import { createClient, chains } from 'genlayer-js';
import { SHIP_ESCROW } from '../config/deployments';
import { Bounty, Submission, Settlement, EscrowStats, EscrowLimits } from '../types';

export const readOnlyClient = createClient({
  chain: chains.studionet,
});

export async function getBounty(id: string): Promise<Bounty | null> {
  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_bounty',
      args: [id],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading bounty ${id}:`, err);
    return null;
  }
}

export async function getSubmission(subId: string): Promise<Submission | null> {
  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_submission',
      args: [subId],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading submission ${subId}:`, err);
    return null;
  }
}

export async function getSettlement(bountyId: string): Promise<Settlement | null> {
  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_settlement',
      args: [bountyId],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading settlement ${bountyId}:`, err);
    return null;
  }
}

export async function getBalance(addr: string): Promise<string> {
  try {
    const bal = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_balance',
      args: [addr],
    });
    return String(bal || '0');
  } catch (err) {
    console.error(`Error loading balance for ${addr}:`, err);
    return '0';
  }
}

export async function listBounties(limit: number = 10): Promise<string[]> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'list_bounties',
      args: [limit],
    });
    return Array.isArray(res) ? res.map(String) : [];
  } catch (err) {
    console.error('Error listing bounties:', err);
    return [];
  }
}

export async function listBountiesByCreator(addr: string, limit: number = 10): Promise<string[]> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'list_bounties_by_creator',
      args: [addr, limit],
    });
    return Array.isArray(res) ? res.map(String) : [];
  } catch (err) {
    console.error(`Error listing bounties by creator ${addr}:`, err);
    return [];
  }
}

export async function listSubmissions(bountyId: string): Promise<string[]> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'list_submissions',
      args: [bountyId],
    });
    return Array.isArray(res) ? res.map(String) : [];
  } catch (err) {
    console.error(`Error listing submissions for bounty ${bountyId}:`, err);
    return [];
  }
}

export async function listSubmissionsByDev(addr: string, limit: number = 10): Promise<string[]> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'list_submissions_by_dev',
      args: [addr, limit],
    });
    return Array.isArray(res) ? res.map(String) : [];
  } catch (err) {
    console.error(`Error listing submissions by dev ${addr}:`, err);
    return [];
  }
}

export async function latestSubmissionBy(addr: string): Promise<Submission | null> {
  try {
    // V2: Query developer's submission index
    const subIds = await listSubmissionsByDev(addr, 1);
    if (subIds && subIds.length > 0) {
      return await getSubmission(subIds[0]);
    }
    // Fallback if legacy contract
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'latest_submission_by',
      args: [addr],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error getting latest submission for ${addr}:`, err);
    return null;
  }
}

export async function hasClaimedDemo(addr: string): Promise<boolean> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'has_claimed_demo',
      args: [addr],
    });
    return Boolean(res);
  } catch (err) {
    console.error(`Error checking demo claim for ${addr}:`, err);
    return false;
  }
}

export async function getDevAttempts(bountyId: string, dev: string): Promise<number> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_dev_attempts',
      args: [bountyId, dev],
    });
    return Number(res || 0);
  } catch (err) {
    console.error(`Error getting dev attempts for bounty ${bountyId} / dev ${dev}:`, err);
    return 0;
  }
}

export async function getLedgerInvariant(): Promise<any> {
  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_ledger_invariant',
      args: [],
    });
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  } catch (err) {
    console.error('Error reading ledger invariant:', err);
    return null;
  }
}

export async function getStats(): Promise<EscrowStats> {
  const fallback: EscrowStats = {
    open: 0,
    settled: 0,
    cancelled: 0,
    exhausted: 0,
    refunded: 0,
    verdict_release_100: 0,
    verdict_release_75: 0,
    verdict_release_50: 0,
    verdict_release_25: 0,
    verdict_refund: 0,
    verdict_review: 0,
    schema_version: '2',
  };

  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_stats',
      args: [],
    });
    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }
    return raw as unknown as EscrowStats;
  } catch (err) {
    console.error('Error loading stats:', err);
    return fallback;
  }
}

export async function getLimits(): Promise<EscrowLimits> {
  const fallback: EscrowLimits = {
    title_min_chars: 3,
    title_max_chars: 80,
    amount_min: 1,
    amount_max: 1000000,
    max_attempts: 6,
    max_criteria: 5,
    min_criteria: 1,
    diff_cap_chars: 14000,
    max_required_paths: 3,
    verdict_thresholds: {
      RELEASE_100: 90,
      RELEASE_75: 65,
      RELEASE_50: 40,
      RELEASE_25: 15,
      REFUND: 0,
    },
  };

  try {
    const raw = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_limits',
      args: [],
    });
    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }
    return raw as unknown as EscrowLimits;
  } catch (err) {
    console.error('Error loading limits:', err);
    return fallback;
  }
}

export async function isSettledFor(
  bountyId: string,
  criteriaHash: string,
  headSha: string,
  dev: string,
  minPayoutPct: number = 25
): Promise<boolean> {
  try {
    const res = await readOnlyClient.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'is_settled_for',
      args: [bountyId, criteriaHash, headSha, dev, minPayoutPct],
    });
    return Boolean(res);
  } catch (err) {
    console.error('Error in is_settled_for check:', err);
    return false;
  }
}
