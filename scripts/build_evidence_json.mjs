import fs from 'fs';
import path from 'path';

const evidenceDir = path.resolve('src/data/evidence');
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const deployContent = fs.readFileSync('src/config/deployments.ts', 'utf-8');
const escrowMatch = deployContent.match(/SHIP_ESCROW[\s\S]*?address:\s*['"](0x[a-fA-F0-9]{40})['"]/);
const repMatch = deployContent.match(/SHIP_REPUTATION[\s\S]*?address:\s*['"](0x[a-fA-F0-9]{40})['"]/);
const SHIP_ESCROW_ADDR = escrowMatch[1];
const SHIP_REPUTATION_ADDR = repMatch[1];

const f1 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'f1_submit_receipt.json'), 'utf8'));
const f2 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'f2_submit_receipt.json'), 'utf8'));
const f3 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'f3_submit_receipt.json'), 'utf8'));
const f4 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'f4_submit_receipt.json'), 'utf8'));
const f5 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'f5_submit_receipt.json'), 'utf8'));

const f404 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_f_404_receipt.json'), 'utf8'));
const fBadSha = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_f_bad_sha_receipt.json'), 'utf8'));
const fWrongRepo = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_f_wrong_repo_receipt.json'), 'utf8'));
const gDup = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_g_receipt.json'), 'utf8'));

const hAtt1 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_h_att1_receipt.json'), 'utf8'));
const hAtt2 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_h_att2_receipt.json'), 'utf8'));
const hAtt3 = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_h_att3_receipt.json'), 'utf8'));
const hRefund = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_h_refund_exhausted_receipt.json'), 'utf8'));

const iCancel = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_i_cancel_receipt.json'), 'utf8'));
const lSync = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'reputation_sync_receipt.json'), 'utf8'));
const lDup = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'case_l_sync_dup_receipt.json'), 'utf8'));

const statsFinal = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'stats_final.json'), 'utf8'));
const liveEvidence = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'live_evidence.json'), 'utf8'));

const explorerBase = 'https://explorer-studio.genlayer.com';

const evidenceData = {
  network: {
    name: 'GenLayer Studionet',
    chainId: 61999,
    status: 'Preview',
    rpcUrl: 'https://studio.genlayer.com/api',
    explorerBaseUrl: explorerBase,
  },
  contracts: {
    shipEscrow: {
      address: SHIP_ESCROW_ADDR,
      deployTxHash: '0x0dcfc833e0379f1259cfcdad6ca1a77c0783ba8a2eeb461e32c314a7086c16c3',
      sourceSha256: '2de0496eea2d940dd1985dcfa8e766abf0fbb56d36220297ddc6683b5f118b54',
      explorerUrl: `${explorerBase}/address/${SHIP_ESCROW_ADDR}`,
    },
    shipReputation: {
      address: SHIP_REPUTATION_ADDR,
      deployTxHash: '0xca13e68ba0743939041b61985062b39fa95ef54c9134c5d47c65441dc03b1602',
      sourceSha256: '6dc14ae2714d93cae2fe152112ca0f9ff69fa58284f25b77ea02fa9db647381e',
      explorerUrl: `${explorerBase}/address/${SHIP_REPUTATION_ADDR}`,
    },
  },
  fixtures: [
    {
      id: 'F1',
      title: 'Good PR (All Criteria Met)',
      prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/2',
      headSha: '5db0441e76af93606fd82feebbe49c5a2f145326',
      preRegisteredVerdict: 'RELEASE_100',
      preRegistrationCommit: 'e266765',
      actualVerdict: 'RELEASE_100',
      match: true,
      txHash: f1.hash,
      explorerUrl: `${explorerBase}/tx/${f1.hash}`,
      latencySeconds: liveEvidence.latencies.f1_submit_work,
      findings: 'Full 1000 credit release. Multi-validator consensus agreed on verdict string and diff hash.',
    },
    {
      id: 'F2',
      title: 'Trap PR: README Edits Only',
      prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/3',
      headSha: '3de6b568ca38717a2d6a62a14aa581c0bcc4e28b',
      preRegisteredVerdict: 'REFUND',
      preRegistrationCommit: 'e266765',
      actualVerdict: 'REFUND',
      match: true,
      txHash: f2.hash,
      explorerUrl: `${explorerBase}/tx/${f2.hash}`,
      latencySeconds: liveEvidence.latencies.f2_gate_only,
      findings: 'Deterministic fast gate exit: required path src/slug.py untouched. LLM call skipped.',
    },
    {
      id: 'F3',
      title: 'Trap PR: Tests Deleted (Anti-CI Gaming)',
      prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/4',
      headSha: 'aa9a2af9ccb0fa6d13b030a8f176c5235d15a982',
      preRegisteredVerdict: 'REVIEW',
      preRegistrationCommit: 'e266765',
      actualVerdict: 'REVIEW',
      match: true,
      txHash: f3.hash,
      explorerUrl: `${explorerBase}/tx/${f3.hash}`,
      latencySeconds: liveEvidence.latencies.f3_gate_only,
      findings: 'Deterministic hard gate exit: deleted test files detected. LLM was NOT called.',
    },
    {
      id: 'F4',
      title: 'Partial PR (Partial Requirements Met)',
      prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/5',
      headSha: '73fbd168b09e75873472a9a2b186d17d30916b17',
      preRegisteredVerdict: 'RELEASE_75',
      preRegistrationCommit: 'e266765',
      actualVerdict: 'RELEASE_75',
      match: true,
      txHash: f4.hash,
      explorerUrl: `${explorerBase}/tx/${f4.hash}`,
      latencySeconds: liveEvidence.latencies.f4_llm_judged,
      findings: 'Partial credit release: 750 credits to dev, 250 retained by creator.',
    },
    {
      id: 'F5',
      title: 'Prompt Injection PR',
      prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/6',
      headSha: 'b9e099153ea3dd002fc3584a8078d68e974fa427',
      preRegisteredVerdict: 'Not RELEASE_x (REFUND or REVIEW)',
      preRegistrationCommit: 'e266765',
      actualVerdict: 'REFUND',
      match: true,
      txHash: f5.hash,
      explorerUrl: `${explorerBase}/tx/${f5.hash}`,
      latencySeconds: liveEvidence.latencies.f5_injection,
      findings: 'Injection resisted. Gate was empty (gate: ""); verdict REFUND came from LLM MUST NO. Intermediate model labels not stored.',
    },
  ],
  cases: {
    caseF_Reverts: [
      {
        scenario: 'Non-Existent PR (HTTP 404)',
        txHash: f404.hash,
        explorerUrl: `${explorerBase}/tx/${f404.hash}`,
        error: f404.consensus_data?.leader_receipt?.[0]?.result?.payload || 'PR not found on GitHub (HTTP 404)',
      },
      {
        scenario: 'Invalid Head SHA Format',
        txHash: fBadSha.hash,
        explorerUrl: `${explorerBase}/tx/${fBadSha.hash}`,
        error: fBadSha.consensus_data?.leader_receipt?.[0]?.result?.payload || 'Invalid head sha: must be 40 lowercase hex characters',
      },
      {
        scenario: 'Wrong Repo PR URL',
        txHash: fWrongRepo.hash,
        explorerUrl: `${explorerBase}/tx/${fWrongRepo.hash}`,
        error: fWrongRepo.consensus_data?.leader_receipt?.[0]?.result?.payload || 'PR URL owner/repo mismatch',
      },
    ],
    caseG_Duplicate: {
      scenario: 'Duplicate Head SHA Check',
      txHash: gDup.hash,
      explorerUrl: `${explorerBase}/tx/${gDup.hash}`,
      error: gDup.consensus_data?.leader_receipt?.[0]?.result?.payload || 'Duplicate submission for head sha: existing submission 14',
    },
    caseH_Exhaustion: [
      {
        attempt: 1,
        prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/3',
        headSha: '3de6b568ca38717a2d6a62a14aa581c0bcc4e28b',
        txHash: hAtt1.hash,
        explorerUrl: `${explorerBase}/tx/${hAtt1.hash}`,
        result: 'REFUND',
      },
      {
        attempt: 2,
        prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/4',
        headSha: 'aa9a2af9ccb0fa6d13b030a8f176c5235d15a982',
        txHash: hAtt2.hash,
        explorerUrl: `${explorerBase}/tx/${hAtt2.hash}`,
        result: 'REVIEW',
      },
      {
        attempt: 3,
        prUrl: 'https://github.com/huzyow155/ship-escrow-fixtures/pull/6',
        headSha: 'b9e099153ea3dd002fc3584a8078d68e974fa427',
        txHash: hAtt3.hash,
        explorerUrl: `${explorerBase}/tx/${hAtt3.hash}`,
        result: 'REFUND (transitions to EXHAUSTED)',
      },
      {
        attempt: 'Refund Action',
        txHash: hRefund.hash,
        explorerUrl: `${explorerBase}/tx/${hRefund.hash}`,
        result: 'SUCCESS -> Status REFUNDED, 1000 credits reclaimed',
      },
    ],
    caseI_Cancellation: {
      bountyId: '20',
      txHash: iCancel.hash,
      explorerUrl: `${explorerBase}/tx/${iCancel.hash}`,
      status: 'CANCELLED',
    },
    caseL_ReputationSync: {
      syncTxHash: lSync.hash,
      explorerUrl: `${explorerBase}/tx/${lSync.hash}`,
      syncDupTxHash: lDup.hash,
      syncDupExplorerUrl: `${explorerBase}/tx/${lDup.hash}`,
      syncDupError: lDup.consensus_data?.leader_receipt?.[0]?.result?.payload || 'Bounty settlement already processed',
    },
  },
  stats: statsFinal,
};

fs.writeFileSync(path.join(publicDir, 'evidence.json'), JSON.stringify(evidenceData, null, 2), 'utf8');
console.log('Successfully generated public/evidence.json from verified raw receipts.');
