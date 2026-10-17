import React, { useState, useEffect } from 'react';
import { getLimits } from '../services/escrowRead';
import { EscrowLimits } from '../types';
import { Sliders, ShieldCheck } from 'lucide-react';

export const LimitsPage: React.FC = () => {
  const [limits, setLimits] = useState<EscrowLimits | null>(null);

  useEffect(() => {
    getLimits().then(setLimits).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '22px' }}>
          <div className="docket-tab" style={{ marginBottom: '4px' }}>SPECIFICATIONS</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Contract Limits & Scope</h1>
        </div>

        {/* Clean Two-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: On-Chain Limits */}
          <div className="ticket-card">
            <div className="ticket-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Sliders size={16} style={{ color: 'var(--stamp-ochre)' }} />
                <span>Enforced On-Chain Limits</span>
              </div>
              <span className="docket-tab">get_limits</span>
            </div>

            <div className="ticket-body">
              {limits ? (
                <div
                  className="font-mono"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    fontSize: '13px',
                  }}
                >
                  <div className="ruled-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Title Length:</span>
                    <strong>{limits.title_min_chars} – {limits.title_max_chars} chars</strong>
                  </div>
                  <div className="ruled-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reward Units:</span>
                    <strong>{limits.amount_min} – {limits.amount_max} units</strong>
                  </div>
                  <div className="ruled-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Max Attempts:</span>
                    <strong>{limits.max_attempts} attempts</strong>
                  </div>
                  <div className="ruled-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Criteria Count:</span>
                    <strong>{limits.min_criteria} – {limits.max_criteria} (≥1 MUST)</strong>
                  </div>
                  <div className="ruled-line" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Required Paths:</span>
                    <strong>0 – {limits.max_required_paths} paths</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Diff Cap:</span>
                    <strong>{limits.diff_cap_chars} chars</strong>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading on-chain limits...</p>
              )}
            </div>
          </div>

          {/* Right Column: Honest Boundaries */}
          <div className="ticket-card">
            <div className="ticket-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ShieldCheck size={16} style={{ color: 'var(--stamp-green)' }} />
                <span>Honest Operational Scope</span>
              </div>
              <span className="docket-tab">Protocol</span>
            </div>

            <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div className="ruled-line">
                <strong>1. Internal Accounting:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  No external token custody; balances are tracked as ledger credits.
                </p>
              </div>
              <div className="ruled-line">
                <strong>2. No Native Clocks:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  Lifecycles conclude strictly via 3 attempts or voluntary cancellation.
                </p>
              </div>
              <div>
                <strong>3. Textual Diff Analysis:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  Public repository commits evaluated; vague criteria causes validator splits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
