import { createClient, createAccount, chains } from 'genlayer-js';
import fs from 'node:fs';
import path from 'node:path';

// Read deployment addresses dynamically to keep git grep clean
const deployContent = fs.readFileSync('src/config/deployments.ts', 'utf-8');
const escrowMatch = deployContent.match(/SHIP_ESCROW[\s\S]*?address:\s*['"](0x[a-fA-F0-9]{40})['"]/);
const repMatch = deployContent.match(/SHIP_REPUTATION[\s\S]*?address:\s*['"](0x[a-fA-F0-9]{40})['"]/);

if (!escrowMatch || !repMatch) {
  throw new Error('Could not find contract addresses in src/config/deployments.ts');
}

const SHIP_ESCROW_ADDRESS = escrowMatch[1];
const SHIP_REPUTATION_ADDRESS = repMatch[1];
const EVIDENCE_DIR = path.resolve('docs/evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

function ensureJson(raw) {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

function saveReceipt(filename, receipt) {
  const filePath = path.join(EVIDENCE_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(receipt, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
  console.log(`[Saved Receipt] ${filePath}`);
}

async function main() {
  console.log('=== STARTING E2E LIVE TEST ON STUDIONET ===');
  console.log('ShipEscrow:', SHIP_ESCROW_ADDRESS);
  console.log('ShipReputation:', SHIP_REPUTATION_ADDRESS);

  // 1. Generate 3 throwaway accounts
  const creator = createAccount();
  const dev = createAccount();
  const other = createAccount();

  console.log('\n[Accounts Generated]');
  console.log('Creator:', creator.address);
  console.log('Dev:    ', dev.address);
  console.log('Other:  ', other.address);

  const creatorClient = createClient({ chain: chains.studionet, account: creator });
  const devClient = createClient({ chain: chains.studionet, account: dev });
  const otherClient = createClient({ chain: chains.studionet, account: other });

  // Standard F1 fixture parameters
  const criteria = [
    {
      level: 'MUST',
      text: 'Adds a function slugify(text) in src/slug.py that lowercases and collapses runs of non-alphanumeric characters into a single hyphen',
    },
    {
      level: 'MUST',
      text: 'Adds at least one test under tests/ that calls slugify',
    },
    {
      level: 'SHOULD',
      text: 'Updates README.md with a usage example',
    },
    {
      level: 'SHOULD',
      text: 'Changes no unrelated files',
    },
  ];
  const requiredPaths = ['src/slug.py'];
  const repo = 'huzyow155/ship-escrow-fixtures';
  const prUrlF1 = 'https://github.com/huzyow155/ship-escrow-fixtures/pull/2';
  const headShaF1 = '5db0441e76af93606fd82feebbe49c5a2f145326';
  const prUrlF3 = 'https://github.com/huzyow155/ship-escrow-fixtures/pull/3';
  const headShaF3 = '3de6b566532aeae6c2d15951a87b47008985161c';

  // --- STEP 1: Creator creates bounty ---
  console.log('\n--- STEP 1: Creator creates bounty ---');
  const t0 = Date.now();
  const createTxHash = await creatorClient.writeContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'create_bounty',
    args: [
      'Slugify Helper E2E',
      repo,
      JSON.stringify(criteria),
      JSON.stringify(requiredPaths),
      1000,
    ],
    value: 0n,
  });
  console.log('Create tx submitted:', createTxHash);
  const createReceipt = await creatorClient.waitForTransactionReceipt({
    hash: createTxHash,
    retries: 120,
    interval: 3000,
  });
  const createElapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`Create receipt confirmed in ${createElapsed}s`);
  saveReceipt('e2e_create_bounty_receipt.json', createReceipt);

  // Discover newly created bounty ID
  const creatorBountiesRaw = await creatorClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'list_bounties_by_creator',
    args: [creator.address],
  });
  const creatorBounties = ensureJson(creatorBountiesRaw);
  const bountyId = String(creatorBounties[0]);
  console.log(`Created Bounty ID: ${bountyId}`);

  // --- STEP 2: Creator attempts self-submission (Expect Revert) ---
  console.log('\n--- STEP 2: Creator attempts self-submission (Expect Revert: Creator cannot submit to own bounty) ---');
  const t1 = Date.now();
  const selfSubmitTxHash = await creatorClient.writeContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'submit_work',
    args: [bountyId, prUrlF1, headShaF1],
    value: 0n,
  });
  console.log('Self-submit tx submitted:', selfSubmitTxHash);
  const selfSubmitReceipt = await creatorClient.waitForTransactionReceipt({
    hash: selfSubmitTxHash,
    retries: 120,
    interval: 3000,
  });
  const selfSubmitElapsed = ((Date.now() - t1) / 1000).toFixed(2);
  console.log(`Self-submit receipt confirmed in ${selfSubmitElapsed}s`);
  saveReceipt('e2e_creator_self_submit_receipt.json', selfSubmitReceipt);
  const selfLeaderRes = selfSubmitReceipt.consensus_data?.leader_receipt?.[0];
  console.log('Self-submit Execution Result:', selfLeaderRes?.execution_result);
  console.log('Self-submit Error Payload:', JSON.stringify(selfLeaderRes?.result));

  // --- STEP 3: Dev submits PR #3 (Expect REFUND, bounty stays open) ---
  console.log('\n--- STEP 3: Dev submits PR #3 (Expect REFUND, attempts -> 1, status remains OPEN) ---');
  const t2 = Date.now();
  const pr3TxHash = await devClient.writeContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'submit_work',
    args: [bountyId, prUrlF3, headShaF3],
    value: 0n,
  });
  console.log('PR #3 submit tx submitted:', pr3TxHash);
  const pr3Receipt = await devClient.waitForTransactionReceipt({
    hash: pr3TxHash,
    retries: 120,
    interval: 3000,
  });
  const pr3Elapsed = ((Date.now() - t2) / 1000).toFixed(2);
  console.log(`PR #3 receipt confirmed in ${pr3Elapsed}s`);
  saveReceipt('e2e_pr3_refund_receipt.json', pr3Receipt);

  const bountyAfterPR3Raw = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'get_bounty',
    args: [bountyId],
  });
  const bountyAfterPR3 = ensureJson(bountyAfterPR3Raw);
  console.log(`Bounty status after PR#3: ${bountyAfterPR3.status}, attempts: ${bountyAfterPR3.attempts}`);

  // --- STEP 4: Dev attempts duplicate submission with same head sha (Expect Revert: Duplicate submission) ---
  console.log('\n--- STEP 4: Dev attempts duplicate submission with same head sha (Expect Revert) ---');
  const t3 = Date.now();
  const dupTxHash = await devClient.writeContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'submit_work',
    args: [bountyId, prUrlF3, headShaF3],
    value: 0n,
  });
  console.log('Duplicate submit tx submitted:', dupTxHash);
  const dupReceipt = await devClient.waitForTransactionReceipt({
    hash: dupTxHash,
    retries: 120,
    interval: 3000,
  });
  const dupElapsed = ((Date.now() - t3) / 1000).toFixed(2);
  console.log(`Duplicate submit receipt confirmed in ${dupElapsed}s`);
  saveReceipt('e2e_duplicate_submission_receipt.json', dupReceipt);
  const dupLeaderRes = dupReceipt.consensus_data?.leader_receipt?.[0];
  console.log('Duplicate submit Execution Result:', dupLeaderRes?.execution_result);
  console.log('Duplicate submit Error Payload:', JSON.stringify(dupLeaderRes?.result));

  // --- STEP 5: Dev submits F1 (PR #2) (Expect RELEASE_100, status -> SETTLED) ---
  console.log('\n--- STEP 5: Dev submits F1 (Expect RELEASE_100, status -> SETTLED) ---');
  const t4 = Date.now();
  const f1TxHash = await devClient.writeContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'submit_work',
    args: [bountyId, prUrlF1, headShaF1],
    value: 0n,
  });
  console.log('F1 submit tx submitted:', f1TxHash);
  const f1Receipt = await devClient.waitForTransactionReceipt({
    hash: f1TxHash,
    retries: 120,
    interval: 3000,
  });
  const f1Elapsed = ((Date.now() - t4) / 1000).toFixed(2);
  console.log(`F1 submit receipt confirmed in ${f1Elapsed}s`);
  saveReceipt('e2e_f1_submit_receipt.json', f1Receipt);

  const bountySettledRaw = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'get_bounty',
    args: [bountyId],
  });
  const bountySettled = ensureJson(bountySettledRaw);
  console.log(`Bounty final status: ${bountySettled.status}, attempts: ${bountySettled.attempts}`);

  const settlementRaw = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'get_settlement',
    args: [bountyId],
  });
  const settlement = ensureJson(settlementRaw);
  console.log('Settlement object:', settlement);
  console.log('Verdict:', settlement.verdict);
  console.log('Dev amount:', settlement.dev_amount);
  console.log('Creator amount:', settlement.creator_amount);

  // --- STEP 6: is_settled_for checks ---
  console.log('\n--- STEP 6: is_settled_for checks (True and False cases) ---');
  const validCriteriaHash = settlement.criteria_hash;
  const validHeadSha = settlement.head_sha;
  const validDev = settlement.dev;

  const checkValid = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'is_settled_for',
    args: [bountyId, validCriteriaHash, validHeadSha, validDev],
  });
  console.log(`Check Valid (expected true): ${checkValid}`);

  const mutatedHash = validCriteriaHash.substring(0, 63) + (validCriteriaHash[63] === '0' ? '1' : '0');
  const checkMutatedHash = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'is_settled_for',
    args: [bountyId, mutatedHash, validHeadSha, validDev],
  });
  console.log(`Check Mutated criteria_hash (expected false): ${checkMutatedHash}`);

  const mutatedSha = validHeadSha.substring(0, 39) + (validHeadSha[39] === '0' ? '1' : '0');
  const checkMutatedSha = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'is_settled_for',
    args: [bountyId, validCriteriaHash, mutatedSha, validDev],
  });
  console.log(`Check Mutated head_sha (expected false): ${checkMutatedSha}`);

  const checkMutatedDev = await devClient.readContract({
    address: SHIP_ESCROW_ADDRESS,
    functionName: 'is_settled_for',
    args: [bountyId, validCriteriaHash, validHeadSha, other.address],
  });
  console.log(`Check Mutated dev (expected false): ${checkMutatedDev}`);

  // --- STEP 7: Reputation sync (First Success, Second Revert) ---
  console.log('\n--- STEP 7: Reputation sync (First Success, Second Revert) ---');
  const t5 = Date.now();
  const sync1TxHash = await otherClient.writeContract({
    address: SHIP_REPUTATION_ADDRESS,
    functionName: 'sync',
    args: [bountyId],
    value: 0n,
  });
  console.log('Sync #1 tx submitted:', sync1TxHash);
  const sync1Receipt = await otherClient.waitForTransactionReceipt({
    hash: sync1TxHash,
    retries: 120,
    interval: 3000,
  });
  const sync1Elapsed = ((Date.now() - t5) / 1000).toFixed(2);
  console.log(`Sync #1 receipt confirmed in ${sync1Elapsed}s`);
  saveReceipt('e2e_reputation_sync_receipt.json', sync1Receipt);

  // Sync #2 (Duplicate)
  const t6 = Date.now();
  const sync2TxHash = await otherClient.writeContract({
    address: SHIP_REPUTATION_ADDRESS,
    functionName: 'sync',
    args: [bountyId],
    value: 0n,
  });
  console.log('Sync #2 tx submitted:', sync2TxHash);
  const sync2Receipt = await otherClient.waitForTransactionReceipt({
    hash: sync2TxHash,
    retries: 120,
    interval: 3000,
  });
  const sync2Elapsed = ((Date.now() - t6) / 1000).toFixed(2);
  console.log(`Sync #2 receipt confirmed in ${sync2Elapsed}s`);
  saveReceipt('e2e_reputation_sync_duplicate_receipt.json', sync2Receipt);
  const sync2LeaderRes = sync2Receipt.consensus_data?.leader_receipt?.[0];
  console.log('Sync #2 Execution Result:', sync2LeaderRes?.execution_result);
  console.log('Sync #2 Error Payload:', JSON.stringify(sync2LeaderRes?.result));

  console.log('\n=== ALL E2E STEPS COMPLETED SUCCESSFULLY ===');
}

main().catch((err) => {
  console.error('\n[E2E FATAL ERROR]:', err);
  process.exit(1);
});
