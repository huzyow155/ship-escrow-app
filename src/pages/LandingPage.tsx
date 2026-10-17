import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ padding: '60px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Value Proposition */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            className="badge badge-open"
            style={{ marginBottom: '16px', padding: '4px 10px', fontSize: '13px' }}
          >
            GenLayer Studionet Preview
          </div>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '20px',
              letterSpacing: '-0.5px',
            }}
          >
            GitHub Bounty Escrow
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            On-demand code bounty escrow evaluating GitHub pull request diffs against
            human criteria via multi-validator GenLayer consensus.
          </p>

          <div style={{ marginTop: '28px' }}>
            <Link
              to="/app"
              className="btn btn-primary"
              style={{ fontSize: '16px', padding: '12px 28px' }}
            >
              <span>Open Bounty Board</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3 Honest Limitations */}
        <div
          className="ticket-card"
          style={{
            marginTop: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              <span>Honest System Boundaries</span>
            </div>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Chain ID: 61999
            </span>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Internal Accounting Ledger:</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
                  Balances are tracked as internal credits on Studionet. No external tokens are held in locked custody.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>No Native Expiration Clocks:</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
                  GenVM has no native timestamp. Lifecycles conclude via 3 failed attempts (exhaustion refund) or voluntary cancellation.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Cpu size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Deterministic Logic Decides:</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
                  Validators independently evaluate diffs to extract small labels; deterministic contract code calculates final payout tiers.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
