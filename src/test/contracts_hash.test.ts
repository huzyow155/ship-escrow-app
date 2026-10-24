import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { SHIP_ESCROW, SHIP_REPUTATION } from '../config/deployments';

describe('Contracts SHA-256 Byte-for-Byte Integrity', () => {
  it('calculates ShipEscrow.py SHA-256 dynamically and matches deployment constant', () => {
    const filePath = path.resolve(__dirname, '../../contracts/ShipEscrow.py');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath);
    const calculatedHash = crypto.createHash('sha256').update(content).digest('hex');
    expect(calculatedHash).toBe(SHIP_ESCROW.sourceSha256);
  });

  it('calculates ShipEscrowV2.py SHA-256 dynamically and matches deployment constant', () => {
    const filePath = path.resolve(__dirname, '../../contracts/ShipEscrowV2.py');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath);
    const calculatedHash = crypto.createHash('sha256').update(content).digest('hex');
    expect(calculatedHash).toBe(SHIP_ESCROW.sourceSha256);
  });

  it('calculates ShipReputation.py SHA-256 dynamically and matches deployment constant', () => {
    const filePath = path.resolve(__dirname, '../../contracts/ShipReputation.py');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath);
    const calculatedHash = crypto.createHash('sha256').update(content).digest('hex');
    expect(calculatedHash).toBe(SHIP_REPUTATION.sourceSha256);
  });

  it('calculates ShipReputationV2.py SHA-256 dynamically and matches deployment constant', () => {
    const filePath = path.resolve(__dirname, '../../contracts/ShipReputationV2.py');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath);
    const calculatedHash = crypto.createHash('sha256').update(content).digest('hex');
    expect(calculatedHash).toBe(SHIP_REPUTATION.sourceSha256);
  });
});
