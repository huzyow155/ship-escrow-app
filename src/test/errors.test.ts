import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CONTRACT_ERRORS, mapContractError } from '../lib/errors';

describe('UserError Complete Catalog Coverage', () => {
  it('covers every single UserError raised in contracts/*.py', () => {
    const contractFiles = [
      path.resolve(__dirname, '../../contracts/ShipEscrow.py'),
      path.resolve(__dirname, '../../contracts/ShipReputation.py'),
    ];

    const extractedStrings: string[] = [];

    for (const f of contractFiles) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('raise gl.vm.UserError')) {
          // match string literals
          const m = line.match(/raise gl\.vm\.UserError\((f?["'])(.*?)\1\)/);
          if (m) {
            extractedStrings.push(m[2]);
          }
        }
      }
    }

    expect(extractedStrings.length).toBeGreaterThan(30);

    const missing: string[] = [];
    for (const raw of extractedStrings) {
      // f-strings like Duplicate submission
      if (raw.startsWith('Duplicate submission for head sha')) {
        const hasRegex = CONTRACT_ERRORS.some(
          (def) => def.exactMessage instanceof RegExp && def.exactMessage.test(raw)
        );
        if (!hasRegex) missing.push(raw);
        continue;
      }

      const found = CONTRACT_ERRORS.some(
        (def) => typeof def.exactMessage === 'string' && def.exactMessage === raw
      );
      if (!found) {
        missing.push(raw);
      }
    }

    console.log(`[Errors Test] Extracted ${extractedStrings.length} error raises across contracts; verified against catalog.`);
    expect(missing).toEqual([]);
  });

  it('correctly maps raw error strings to explanations', () => {
    const res = mapContractError('Title must be between 3 and 80 ASCII characters');
    expect(res.message).toBe('Title must be between 3 and 80 ASCII characters');
    expect(res.explanation).toContain('ASCII characters');

    const dupRes = mapContractError('Duplicate submission for head sha: existing submission 14');
    expect(dupRes.explanation).toContain('already been submitted');
  });
});
