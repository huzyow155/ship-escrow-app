import { describe, it, expect } from 'vitest';
import { computeCriteriaHash, Criterion } from '../lib/criteria';
import { SHIP_ESCROW } from '../config/deployments';
import { createClient, createAccount, chains } from 'genlayer-js';

describe('Criteria Hash Computation', () => {
  const referenceCriteria: Criterion[] = [
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
  const referencePaths = ['src/slug.py'];
  const expectedHash = 'a360be5e7af9cd6f7e1b07f6113c1366657efc9e53a9da3ec1fd97607165eda8';

  it('matches pre-calculated fixture hash a360be5e...eda8', () => {
    const computed = computeCriteriaHash(referenceCriteria, referencePaths);
    expect(computed).toBe(expectedHash);
  });

  it('matches on-chain compute_criteria_hash view call for validated criteria', async () => {
    const testCriteria: Criterion[] = [{ level: 'MUST', text: '12345' }];
    const testPaths: string[] = [];

    const account = createAccount();
    const client = createClient({
      chain: chains.studionet,
      account,
    });

    const onChainHash = await client.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'compute_criteria_hash',
      args: [JSON.stringify(testCriteria), JSON.stringify(testPaths)],
    });

    const localHash = computeCriteriaHash(testCriteria, testPaths);
    expect(localHash).toBe(onChainHash);

    // Also verify against on-chain stored Bounty 14 criteria_hash
    const b14Raw = await client.readContract({
      address: SHIP_ESCROW.address,
      functionName: 'get_bounty',
      args: ['14'],
    });
    const b14 = JSON.parse(b14Raw as string);
    const b14LocalHash = computeCriteriaHash(b14.criteria, b14.required_paths);
    expect(b14LocalHash).toBe(b14.criteria_hash);
  }, 30000);

  it('guarantees required paths sorting order invariance', () => {
    const h1 = computeCriteriaHash(referenceCriteria, ['src/b.py', 'src/a.py']);
    const h2 = computeCriteriaHash(referenceCriteria, ['src/a.py', 'src/b.py']);
    expect(h1).toBe(h2);
  });

  it('produces distinct hash on modified criteria text', () => {
    const modified: Criterion[] = [
      { level: 'MUST', text: 'Modified criterion text' },
      ...referenceCriteria.slice(1),
    ];
    const h1 = computeCriteriaHash(referenceCriteria, referencePaths);
    const h2 = computeCriteriaHash(modified, referencePaths);
    expect(h1).not.toBe(h2);
  });
});
