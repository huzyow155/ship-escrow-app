import React, { useState, useEffect } from 'react';
import { getLimits } from '../services/escrowRead';
import { EscrowLimits } from '../types';
import { Sliders, AlertTriangle } from 'lucide-react';

export const LimitsPage: React.FC = () => {
  const [limits, setLimits] = useState<EscrowLimits | null>(null);

  useEffect(() => {
    getLimits().then(setLimits).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          Contract Limits & Constraints
        </h1>

        {/* On-Chain Limits */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Sliders size={16} style={{ color: 'var(--primary)' }} />
              <span>Enforced Limits (from get_limits view)</span>
            </div>
          </div>

          <div className="ticket-body">
            {limits ? (
              <div
                className="font-mono"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  fontSize: '13px',
                }}
              >
                <div>Title Length: <strong>{limits.title_min_chars} – {limits.title_max_chars} chars</strong></div>
                <div>Reward Amount: <strong>{limits.amount_min} – {limits.amount_max} units</strong></div>
                <div>Max Attempts: <strong>{limits.max_attempts} attempts</strong></div>
                <div>Criteria Count: <strong>{limits.min_criteria} – {limits.max_criteria} (≥1 MUST)</strong></div>
                <div>Required Paths: <strong>0 – {limits.max_required_paths} paths</strong></div>
                <div>Diff Truncation Cap: <strong>{limits.diff_cap_chars} characters</strong></div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading on-chain limits...</p>
            )}
          </div>
        </div>

        {/* Honest Limitations */}
        <div className="ticket-card">
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              <span>Honest Operational Scope</span>
            </div>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <p>1. Internal credits: No token custody.</p>
            <p>2. No clock: Exits by cancellation or 3 attempts.</p>
            <p>3. Public GitHub: Textual diff analysis only.</p>
            <p>4. Ambiguity risk: Vague criteria causes splits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
