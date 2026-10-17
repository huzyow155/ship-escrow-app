# Manual MetaMask Verification Guide (8 Steps)

This document provides step-by-step instructions for end-to-end manual verification of Ship Escrow on GenLayer Studionet (Chain ID 61999) using a real browser and MetaMask (including zero-balance accounts).

---

## Step 1: Add GenLayer Studionet Network to MetaMask
1. Open MetaMask settings -> **Networks** -> **Add Network Manually**.
2. Fill in the network details:
   - **Network Name**: GenLayer Studionet Preview
   - **New RPC URL**: `https://studio.genlayer.com/api`
   - **Chain ID**: `61999`
   - **Currency Symbol**: `GEN`
   - **Block Explorer URL**: `https://explorer-studio.genlayer.com`
3. Click **Save** and switch to this network.

---

## Step 2: Create a Bounty (Creator Perspective)
1. Navigate to `/app/create`.
2. Connect Account 1 (Creator).
3. Fill in the bounty manifest:
   - **Title**: `Slugify Helper Manifest`
   - **Target Repository**: `huzyow155/ship-escrow-fixtures`
   - **Acceptance Criteria**:
     - MUST: `Adds a function slugify(text) in src/slug.py that lowercases and collapses runs of non-alphanumeric characters into a single hyphen`
     - MUST: `Adds at least one test under tests/ that calls slugify`
     - SHOULD: `Updates README.md with a usage example`
     - SHOULD: `Changes no unrelated files`
   - **Required Path**: `src/slug.py`
   - **Reward Amount**: `1000`
4. Review the computed Criteria Hash and Max Points preview.
5. Click **Publish Bounty**. Approve the transaction in MetaMask (Gas fee: 0 GEN).
6. Observe the stopwatch timer while validators reach consensus (typically 6–12 seconds). Once confirmed, you are redirected to the new Bounty Detail page.

---

## Step 3: Submit Work (Dev Perspective)
1. Switch MetaMask to Account 2 (Dev).
2. On the Bounty Detail page, scroll to the **Submit Work for Evaluation** section.
3. Enter PR URL: `https://github.com/huzyow155/ship-escrow-fixtures/pull/2`.
4. Click **Fetch Head SHA from GitHub**. The input auto-fills with `5db0441e76af93606fd82feebbe49c5a2f145326` directly via public GitHub API.
5. Click **Submit Work for Consensus**. Approve the transaction in MetaMask.
6. Observe the elapsed-seconds timer (evaluating diff + LLM criteria classification takes ~18–40 seconds).

---

## Step 4: Inspect Verdict & Credit Settlement
1. After the receipt is confirmed, inspect the refreshed Submission Records and Settlement Panel.
2. Verify the verdict stamp displays **RELEASE_100** (Emerald seal).
3. Verify the credits distribution:
   - **Dev Amount**: 1000 Credits
   - **Creator Amount**: 0 Credits
4. Check your account balance pill in the top navigation bar to confirm your credited balance.

---

## Step 5: Verify Settlement Check
1. On the settled Bounty Detail page, locate the **Settlement Verification Tool**.
2. The 4 inputs (Bounty ID, Criteria Hash, Head SHA, Dev Address) are pre-populated with verified on-chain values.
3. Click **Verify Settlement On-Chain**.
   - Result: `✓ VERIFIED: TRUE`
4. Click the **Mutate 1 Char** button to change one character in the criteria hash or head SHA.
5. Click **Verify Settlement On-Chain** again.
   - Result: `✗ MISMATCH: FALSE`

---

## Step 6: Sync Reputation Score
1. Navigate to `/app/reputation`.
2. Connect any account or query the Dev address (`0x...`).
3. Under the **Sync Bounty Settlement** card, enter the settled Bounty ID.
4. Click **Sync Settlement** and approve the MetaMask write transaction on ShipReputation (`0x55c56f0dfFb8227345814A37c68394b05c26E901`).
5. Once confirmed, verify that the Dev score increments `RELEASE_100: 1`.

---

## Step 7: Cancel an Open Bounty
1. Switch back to Account 1 (Creator).
2. Navigate to `/app/create` and publish a secondary testing bounty.
3. Once created, click **Cancel Bounty (Refund Remaining)** in the Creator Actions panel.
4. Confirm the MetaMask transaction.
5. Verify the bounty status transitions to **CANCELLED** and the unspent escrow amount is credited back to Account 1.

---

## Step 8: Test Contract Revert Behaviors
1. **Self-Submission Revert**: As Account 1 (Creator), attempt to submit a PR to your own open bounty.
   - Expected Contract Error: `"Creator cannot submit to own bounty"`.
2. **Duplicate Submission Revert**: On an open bounty with an existing non-settling attempt, re-submit the identical Head SHA.
   - Expected Contract Error: `"Duplicate submission for head sha: existing submission <id>"`.
3. **Idempotent Sync Revert**: On `/app/reputation`, enter an already-synced Bounty ID and click **Sync Settlement** again.
   - Expected Contract Error: `"Bounty settlement already processed"`.
