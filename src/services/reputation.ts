import { createClient, chains } from 'genlayer-js';
import { SHIP_REPUTATION, NETWORK_CONFIG } from '../config/deployments';
import { DevReputation, CreatorReputation } from '../types';
import { extractErrorMessage, mapContractError } from '../lib/errors';

export const readOnlyReputationClient = createClient({
  chain: chains.studionet,
});

export async function getDevScore(addr: string): Promise<DevReputation | null> {
  try {
    const raw = await readOnlyReputationClient.readContract({
      address: SHIP_REPUTATION.address,
      functionName: 'get_dev_score',
      args: [addr],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading dev score for ${addr}:`, err);
    return null;
  }
}

export async function getCreatorScore(addr: string): Promise<CreatorReputation | null> {
  try {
    const raw = await readOnlyReputationClient.readContract({
      address: SHIP_REPUTATION.address,
      functionName: 'get_creator_score',
      args: [addr],
    });
    if (!raw || typeof raw !== 'string') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading creator score for ${addr}:`, err);
    return null;
  }
}

export async function listRecentSettlements(limit: number = 10): Promise<string[]> {
  try {
    const res = await readOnlyReputationClient.readContract({
      address: SHIP_REPUTATION.address,
      functionName: 'list_recent',
      args: [limit],
    });
    return Array.isArray(res) ? res.map(String) : [];
  } catch (err) {
    console.error('Error loading recent settlements from reputation:', err);
    return [];
  }
}

export async function ensureStudionetNetwork(): Promise<void> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No Ethereum wallet detected. Please install or enable MetaMask.');
  }
  const ethereum = (window as any).ethereum;
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
    });
  } catch (switchError: any) {
    // 4902 error indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: NETWORK_CONFIG.chainIdHex,
            chainName: NETWORK_CONFIG.name,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            nativeCurrency: NETWORK_CONFIG.currency,
            blockExplorerUrls: [NETWORK_CONFIG.explorerBaseUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export interface WriteResult {
  txHash: string;
  status: string;
  elapsedSeconds: number;
}

export async function syncBountyReputation(
  bountyId: string,
  onElapsed?: (sec: number) => void
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
      onElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }

  try {
    const txHash = await client.writeContract({
      address: SHIP_REPUTATION.address,
      functionName: 'sync',
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
        'Transaction failed on-chain';
      const mapped = mapContractError(rawError);
      throw new Error(`${mapped.message} (${mapped.explanation})`);
    }

    return { txHash, status: r.status_name || r.statusName, elapsedSeconds };
  } catch (err: any) {
    if (timer) clearInterval(timer);
    const mapped = mapContractError(extractErrorMessage(err));
    throw new Error(mapped.message);
  }
}
