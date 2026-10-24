/**
 * Complete catalog of UserError strings from ShipEscrowV2.py and ShipReputationV2.py
 * Verified against on-chain contract source code.
 */

export interface ContractErrorDefinition {
  code: string;
  exactMessage: string | RegExp;
  category: 'creation' | 'submission' | 'network' | 'lifecycle' | 'reputation';
  userExplanation: string;
}

export const CONTRACT_ERRORS: ContractErrorDefinition[] = [
  // --- Bounty Creation ---
  {
    code: 'ERR_TITLE_LENGTH',
    exactMessage: 'Title must be between 3 and 80 ASCII characters',
    category: 'creation',
    userExplanation: 'The bounty title must be between 3 and 80 ASCII characters.',
  },
  {
    code: 'ERR_OWNER_REPO_FORMAT',
    exactMessage: 'Invalid owner/repo format',
    category: 'creation',
    userExplanation: 'Repository must match "owner/repo" with alphanumeric, dot, underscore, or hyphen characters.',
  },
  {
    code: 'ERR_CRITERIA_COUNT',
    exactMessage: 'Criteria count must be between 1 and 5',
    category: 'creation',
    userExplanation: 'A bounty must have between 1 and 5 acceptance criteria.',
  },
  {
    code: 'ERR_CRITERION_TEXT_LENGTH',
    exactMessage: 'Criterion text must be between 5 and 200 characters',
    category: 'creation',
    userExplanation: 'Each acceptance criterion must be between 5 and 200 characters long.',
  },
  {
    code: 'ERR_CRITERION_LEVEL',
    exactMessage: 'Criterion level must be MUST or SHOULD',
    category: 'creation',
    userExplanation: 'Acceptance criterion priority level must be either "MUST" or "SHOULD".',
  },
  {
    code: 'ERR_CRITERION_NO_MUST',
    exactMessage: 'At least one criterion must have level MUST',
    category: 'creation',
    userExplanation: 'You must specify at least one requirement with priority level MUST.',
  },
  {
    code: 'ERR_AMOUNT_RANGE',
    exactMessage: 'Amount must be integer between 1 and 1000000',
    category: 'creation',
    userExplanation: 'Bounty reward amount must be an integer between 1 and 1,000,000 units.',
  },
  {
    code: 'ERR_REQUIRED_PATHS_COUNT',
    exactMessage: 'Required paths must have between 0 and 3 items',
    category: 'creation',
    userExplanation: 'You can specify between 0 and 3 required path prefixes.',
  },
  {
    code: 'ERR_REQUIRED_PATH_PREFIX',
    exactMessage: 'Invalid required path prefix',
    category: 'creation',
    userExplanation: 'Required path prefixes cannot be empty, start with "/", or contain "..".',
  },
  {
    code: 'ERR_INSUFFICIENT_CREDITS',
    exactMessage: 'Insufficient credits',
    category: 'creation',
    userExplanation: 'Creator does not have enough credits in their balance to escrow this bounty amount.',
  },
  {
    code: 'ERR_DEMO_ALREADY_CLAIMED',
    exactMessage: 'Demo credits already claimed',
    category: 'creation',
    userExplanation: 'This account address has already claimed the one-time 1,000 demo credits.',
  },

  // --- Submission Pre-Execution ---
  {
    code: 'ERR_BOUNTY_NOT_FOUND',
    exactMessage: 'Bounty not found',
    category: 'submission',
    userExplanation: 'The requested bounty ID does not exist in the contract.',
  },
  {
    code: 'ERR_BOUNTY_NOT_OPEN',
    exactMessage: 'Bounty is not open',
    category: 'submission',
    userExplanation: 'This bounty is no longer open for submissions.',
  },
  {
    code: 'ERR_CREATOR_SELF_SUBMISSION',
    exactMessage: 'Creator cannot submit to own bounty',
    category: 'submission',
    userExplanation: 'Bounty creators cannot submit work to their own bounties.',
  },
  {
    code: 'ERR_SUBMISSION_BOND',
    exactMessage: 'Insufficient credits for submission bond',
    category: 'submission',
    userExplanation: 'A refundable submission bond of 50 credits is required to submit work.',
  },
  {
    code: 'ERR_DEV_ATTEMPT_LIMIT',
    exactMessage: 'Developer attempt limit reached',
    category: 'submission',
    userExplanation: 'Each developer address is limited to at most 2 submissions per bounty.',
  },
  {
    code: 'ERR_ATTEMPT_LIMIT',
    exactMessage: 'Attempt limit reached',
    category: 'submission',
    userExplanation: 'This bounty has reached the maximum of 6 total evaluation attempts.',
  },
  {
    code: 'ERR_INVALID_HEAD_SHA',
    exactMessage: 'Invalid head sha: must be 40 lowercase hex characters',
    category: 'submission',
    userExplanation: 'Head SHA must be exactly 40 lowercase hexadecimal characters.',
  },
  {
    code: 'ERR_PR_SCHEME',
    exactMessage: 'PR URL must use https scheme',
    category: 'submission',
    userExplanation: 'Pull request URL must start with https://.',
  },
  {
    code: 'ERR_PR_HOST',
    exactMessage: 'PR URL host must be github.com',
    category: 'submission',
    userExplanation: 'Only public pull requests on github.com are supported.',
  },
  {
    code: 'ERR_PR_USERINFO',
    exactMessage: 'PR URL must not contain userinfo',
    category: 'submission',
    userExplanation: 'Pull request URL cannot include username or credentials.',
  },
  {
    code: 'ERR_PR_PORT',
    exactMessage: 'PR URL must not specify non-standard port',
    category: 'submission',
    userExplanation: 'Pull request URL cannot specify a non-standard port.',
  },
  {
    code: 'ERR_PR_PATH_SHAPE',
    exactMessage: 'PR URL path shape invalid',
    category: 'submission',
    userExplanation: 'URL must follow the format "https://github.com/owner/repo/pull/123".',
  },
  {
    code: 'ERR_PR_REPO_MISMATCH',
    exactMessage: 'PR URL owner/repo mismatch',
    category: 'submission',
    userExplanation: 'The PR URL repository does not match the bounty target repository.',
  },
  {
    code: 'ERR_PR_QUERY_FRAGMENT',
    exactMessage: 'PR URL must not contain query or fragment',
    category: 'submission',
    userExplanation: 'Pull request URL cannot include query parameters or #fragments.',
  },
  {
    code: 'ERR_DUPLICATE_SUBMISSION',
    exactMessage: /^Duplicate submission for head sha: existing submission \d+$/,
    category: 'submission',
    userExplanation: 'This exact commit HEAD SHA has already been submitted to this bounty.',
  },
  {
    code: 'ERR_METADATA_UNAVAILABLE',
    exactMessage: 'Pull request metadata unavailable',
    category: 'submission',
    userExplanation: 'Validators could not retrieve pull request metadata from GitHub REST API.',
  },
  {
    code: 'ERR_PR_NOT_OPEN_OR_MERGED',
    exactMessage: 'Pull request is not open or merged',
    category: 'submission',
    userExplanation: 'The pull request must be in OPEN or MERGED state on GitHub (closed unmerged PRs are rejected).',
  },
  {
    code: 'ERR_SAME_REPOSITORY',
    exactMessage: 'Pull request must be same-repository',
    category: 'submission',
    userExplanation: 'Pull request head repository must match base repository (cross-fork PRs not accepted).',
  },
  {
    code: 'ERR_HEAD_SHA_MISMATCH',
    exactMessage: 'Head sha does not match the pull request head',
    category: 'submission',
    userExplanation: 'The submitted head SHA does not match the authoritative current head commit of the PR.',
  },
  {
    code: 'ERR_WALLET_NOT_BOUND',
    exactMessage: 'Pull request is not bound to the submitting wallet',
    category: 'submission',
    userExplanation: 'PR description must contain "ship-escrow-wallet: 0x<caller_address>" marker.',
  },

  // --- Network & Fetch ---
  {
    code: 'ERR_GITHUB_UNREACHABLE',
    exactMessage: 'GitHub source unreachable',
    category: 'network',
    userExplanation: 'Validators could not fetch the PR compare diff from GitHub over HTTPS.',
  },
  {
    code: 'ERR_DIFF_EMPTY',
    exactMessage: 'PR diff is empty',
    category: 'network',
    userExplanation: 'The pull request compare diff contains no line additions or deletions.',
  },

  // --- Lifecycle & Refunds ---
  {
    code: 'ERR_ONLY_CREATOR_CANCEL',
    exactMessage: 'Only bounty creator can cancel',
    category: 'lifecycle',
    userExplanation: 'Only the account that created this bounty can cancel it.',
  },
  {
    code: 'ERR_CANCEL_AFTER_SUBMISSIONS',
    exactMessage: 'Cannot cancel bounty after submissions have been made',
    category: 'lifecycle',
    userExplanation: 'A bounty cannot be cancelled once one or more submissions have been evaluated.',
  },
  {
    code: 'ERR_ONLY_CREATOR_REFUND',
    exactMessage: 'Only bounty creator can refund exhausted bounty',
    category: 'lifecycle',
    userExplanation: 'Only the creator can claim a refund on an exhausted bounty.',
  },
  {
    code: 'ERR_BOUNTY_NOT_EXHAUSTED',
    exactMessage: 'Bounty is not exhausted',
    category: 'lifecycle',
    userExplanation: 'A bounty must have reached 6 total attempts without settling before it is exhausted.',
  },

  // --- Reputation Contract ---
  {
    code: 'ERR_REP_BOUNTY_ID_EMPTY',
    exactMessage: 'Bounty id cannot be empty',
    category: 'reputation',
    userExplanation: 'Bounty ID parameter cannot be empty.',
  },
  {
    code: 'ERR_REP_ALREADY_PROCESSED',
    exactMessage: 'Bounty settlement already processed',
    category: 'reputation',
    userExplanation: 'This bounty settlement has already been synchronized to ShipReputation.',
  },
  {
    code: 'ERR_REP_SETTLEMENT_NOT_FOUND',
    exactMessage: 'Settlement not found in escrow',
    category: 'reputation',
    userExplanation: 'No settled record was found in ShipEscrow for this bounty ID.',
  },
  {
    code: 'ERR_REP_DECODE_JSON',
    exactMessage: 'Failed to decode settlement JSON',
    category: 'reputation',
    userExplanation: 'Could not decode settlement record from ShipEscrow.',
  },
  {
    code: 'ERR_REP_MISSING_FIELDS',
    exactMessage: 'Invalid settlement record: missing required fields',
    category: 'reputation',
    userExplanation: 'Settlement record from ShipEscrow is missing required fields.',
  },
  {
    code: 'ERR_REP_INVALID_AMOUNTS',
    exactMessage: 'Invalid settlement amounts',
    category: 'reputation',
    userExplanation: 'Settlement record contains invalid numeric credit amounts.',
  },
  {
    code: 'ERR_REP_LOW_PAYOUT_THRESHOLD',
    exactMessage: 'Settlement payout percentage below required threshold',
    category: 'reputation',
    userExplanation: 'The settlement payout percentage is below the minimum required threshold for reputation tracking.',
  },
];

/**
 * Extracts clean user error message from various GenLayer error / revert payloads
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error occurred';

  if (typeof err === 'string') {
    return cleanRevertString(err);
  }

  const anyErr = err as any;

  // GenLayer / Viem error structures
  if (anyErr?.data?.receipt?.consensus_data?.leader_receipt?.[0]?.result?.payload) {
    return cleanRevertString(anyErr.data.receipt.consensus_data.leader_receipt[0].result.payload);
  }

  if (anyErr?.consensus_data?.leader_receipt?.[0]?.result?.payload) {
    return cleanRevertString(anyErr.consensus_data.leader_receipt[0].result.payload);
  }

  if (anyErr?.shortMessage) {
    return cleanRevertString(anyErr.shortMessage);
  }

  if (anyErr?.message) {
    return cleanRevertString(anyErr.message);
  }

  return String(err);
}

function cleanRevertString(str: string): string {
  // If base64 encoded with prefix byte
  if (str.startsWith('AV') || str.startsWith('AU')) {
    try {
      const decoded = atob(str);
      return decoded.slice(1);
    } catch {
      // not base64
    }
  }

  // Remove standard GenLayer RPC prefixes if present
  let clean = str;
  const revertMarker = 'execution reverted: ';
  const idx = clean.indexOf(revertMarker);
  if (idx !== -1) {
    clean = clean.slice(idx + revertMarker.length);
  }

  return clean.trim();
}

/**
 * Maps raw contract error string to friendly explanation
 */
export function mapContractError(raw: string): { message: string; explanation: string } {
  const extracted = extractErrorMessage(raw);

  for (const def of CONTRACT_ERRORS) {
    if (typeof def.exactMessage === 'string') {
      if (extracted === def.exactMessage || extracted.includes(def.exactMessage)) {
        return { message: def.exactMessage, explanation: def.userExplanation };
      }
    } else if (def.exactMessage instanceof RegExp) {
      if (def.exactMessage.test(extracted)) {
        return { message: extracted, explanation: def.userExplanation };
      }
    }
  }

  return { message: extracted, explanation: extracted };
}
