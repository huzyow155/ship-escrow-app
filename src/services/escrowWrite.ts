import { createClient, chains } from 'genlayer-js';
import { SHIP_ESCROW } from '../config/deployments';
import { Criterion } from '../lib/criteria';
import { extractErrorMessage, mapContractError } from '../lib/errors';
import { ensureStudionetNetwork, WriteResult } from './reputation';

export interface SubmitWorkResult extends WriteResult {
  submissionId?: string;
  verdict?: string;
}

export async function createBounty(
  title: string,
  ownerRepo: string,
  criteria: Criterion[],
  requiredPaths: string[],
  amount: string,
  onElapsed?: (sec: number, statusMsg?: string) => void
): Promise<WriteResult & { bountyId: string }> {
  await ensureStudionetNetwork();
  const ethereum = (window as any).ethereum;
  const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  const client = createClient({
    chain: chains.studionet,
    provider: ethereum,
    account: account as any,
  });

  const startTime = Date.now();
  let timer: any = null;
  if (onElapsed) {
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const msg = elapsed > 60 ? 'validators are still working' : undefined;
      onElapsed(elapsed, msg);
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_ESCROW.address,
      functionName: 'create_bounty',
      args: [
        title,
        ownerRepo,
        JSON.stringify(criteria),
        JSON.stringify(requiredPaths),
        amount,
      ],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });

    if (timer) clearInterval(timer);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const r = receipt as any;
    const isSuccess =
      (r.status_name === 'ACCEPTED' ||
        r.status_name === 'FINALIZED' ||
        r.statusName === 'ACCEPTED' ||
        r.statusName === 'FINALIZED') &&
      (r.result_name === 'MAJORITY_AGREE' || r.resultName === 'MAJORITY_AGREE') &&
      r.consensus_data?.leader_receipt?.[0]?.execution_result === 'SUCCESS';

    if (!isSuccess) {
      const leaderResult = r.consensus_data?.leader_receipt?.[0]?.result;
      const rawError =
        (typeof leaderResult === 'object' && leaderResult?.payload) ||
        r.result ||
        'Failed to create bounty';
      const mapped = mapContractError(rawError);
      throw new Error(mapped.message);
    }

    // Extract returned bounty ID from leader readable payload if available
    let bountyId = '';
    const leaderPayload = r.consensus_data?.leader_receipt?.[0]?.result?.payload;
    if (leaderPayload) {
      if (typeof leaderPayload === 'object' && leaderPayload.readable) {
        bountyId = String(leaderPayload.readable).replace(/^"|"$/g, '');
      } else if (typeof leaderPayload === 'string') {
        bountyId = leaderPayload.replace(/^"|"$/g, '');
      }
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds, bountyId };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}

export async function submitWork(
  bountyId: string,
  prUrl: string,
  headSha: string,
  onElapsed?: (sec: number, statusMsg?: string) => void
): Promise<SubmitWorkResult> {
  await ensureStudionetNetwork();
  const ethereum = (window as any).ethereum;
  const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  const client = createClient({
    chain: chains.studionet,
    provider: ethereum,
    account: account as any,
  });

  const startTime = Date.now();
  let timer: any = null;
  if (onElapsed) {
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const msg = elapsed > 60 ? 'validators are still working' : undefined;
      onElapsed(elapsed, msg);
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_ESCROW.address,
      functionName: 'submit_work',
      args: [bountyId, prUrl, headSha],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });

    if (timer) clearInterval(timer);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const r = receipt as any;
    const isSuccess =
      (r.status_name === 'ACCEPTED' ||
        r.status_name === 'FINALIZED' ||
        r.statusName === 'ACCEPTED' ||
        r.statusName === 'FINALIZED') &&
      (r.result_name === 'MAJORITY_AGREE' || r.resultName === 'MAJORITY_AGREE') &&
      r.consensus_data?.leader_receipt?.[0]?.execution_result === 'SUCCESS';

    if (!isSuccess) {
      const leaderResult = r.consensus_data?.leader_receipt?.[0]?.result;
      const rawError =
        (typeof leaderResult === 'object' && leaderResult?.payload) ||
        r.result ||
        'Submission execution failed';
      const mapped = mapContractError(rawError);
      throw new Error(mapped.message);
    }

    // Extract returned verdict if present
    let verdict = '';
    const leaderPayload = r.consensus_data?.leader_receipt?.[0]?.result?.payload;
    if (leaderPayload) {
      if (typeof leaderPayload === 'object' && leaderPayload.readable) {
        verdict = String(leaderPayload.readable).replace(/^"|"$/g, '');
      } else if (typeof leaderPayload === 'string') {
        verdict = leaderPayload.replace(/^"|"$/g, '');
      }
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds, verdict };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}

export async function cancelBounty(
  bountyId: string,
  onElapsed?: (sec: number, statusMsg?: string) => void
): Promise<WriteResult> {
  await ensureStudionetNetwork();
  const ethereum = (window as any).ethereum;
  const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  const client = createClient({
    chain: chains.studionet,
    provider: ethereum,
    account: account as any,
  });

  const startTime = Date.now();
  let timer: any = null;
  if (onElapsed) {
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const msg = elapsed > 60 ? 'validators are still working' : undefined;
      onElapsed(elapsed, msg);
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_ESCROW.address,
      functionName: 'cancel_bounty',
      args: [bountyId],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });

    if (timer) clearInterval(timer);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const r = receipt as any;
    const isSuccess =
      (r.status_name === 'ACCEPTED' ||
        r.status_name === 'FINALIZED' ||
        r.statusName === 'ACCEPTED' ||
        r.statusName === 'FINALIZED') &&
      (r.result_name === 'MAJORITY_AGREE' || r.resultName === 'MAJORITY_AGREE') &&
      r.consensus_data?.leader_receipt?.[0]?.execution_result === 'SUCCESS';

    if (!isSuccess) {
      const leaderResult = r.consensus_data?.leader_receipt?.[0]?.result;
      const rawError =
        (typeof leaderResult === 'object' && leaderResult?.payload) ||
        r.result ||
        'Cancel bounty failed';
      const mapped = mapContractError(rawError);
      throw new Error(mapped.message);
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}

export async function refundExhausted(
  bountyId: string,
  onElapsed?: (sec: number, statusMsg?: string) => void
): Promise<WriteResult> {
  await ensureStudionetNetwork();
  const ethereum = (window as any).ethereum;
  const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  const client = createClient({
    chain: chains.studionet,
    provider: ethereum,
    account: account as any,
  });

  const startTime = Date.now();
  let timer: any = null;
  if (onElapsed) {
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const msg = elapsed > 60 ? 'validators are still working' : undefined;
      onElapsed(elapsed, msg);
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_ESCROW.address,
      functionName: 'refund_exhausted',
      args: [bountyId],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });

    if (timer) clearInterval(timer);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const r = receipt as any;
    const isSuccess =
      (r.status_name === 'ACCEPTED' ||
        r.status_name === 'FINALIZED' ||
        r.statusName === 'ACCEPTED' ||
        r.statusName === 'FINALIZED') &&
      (r.result_name === 'MAJORITY_AGREE' || r.resultName === 'MAJORITY_AGREE') &&
      r.consensus_data?.leader_receipt?.[0]?.execution_result === 'SUCCESS';

    if (!isSuccess) {
      const leaderResult = r.consensus_data?.leader_receipt?.[0]?.result;
      const rawError =
        (typeof leaderResult === 'object' && leaderResult?.payload) ||
        r.result ||
        'Refund exhausted failed';
      const mapped = mapContractError(rawError);
      throw new Error(mapped.message);
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}


export async function claimDemoCredits(
  onElapsed?: (sec: number, statusMsg?: string) => void
): Promise<WriteResult> {
  await ensureStudionetNetwork();
  const ethereum = (window as any).ethereum;
  const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];

  const client = createClient({
    chain: chains.studionet,
    provider: ethereum,
    account: account as any,
  });

  const startTime = Date.now();
  let timer: any = null;
  if (onElapsed) {
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const msg = elapsed > 60 ? 'validators are still working' : undefined;
      onElapsed(elapsed, msg);
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_ESCROW.address,
      functionName: 'claim_demo_credits',
      args: [],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });

    if (timer) clearInterval(timer);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const r = receipt as any;
    const isSuccess =
      (r.status_name === 'ACCEPTED' ||
        r.status_name === 'FINALIZED' ||
        r.statusName === 'ACCEPTED' ||
        r.statusName === 'FINALIZED') &&
      (r.result_name === 'MAJORITY_AGREE' || r.resultName === 'MAJORITY_AGREE') &&
      r.consensus_data?.leader_receipt?.[0]?.execution_result === 'SUCCESS';

    if (!isSuccess) {
      const leaderResult = r.consensus_data?.leader_receipt?.[0]?.result;
      const rawError =
        (typeof leaderResult === 'object' && leaderResult?.payload) ||
        r.result ||
        'Failed to claim demo credits';
      const mapped = mapContractError(rawError);
      throw new Error(mapped.message);
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}
