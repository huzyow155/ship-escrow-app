import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, ShieldCheck, Clock, FileCode } from 'lucide-react';
import { getBounty } from '../services/escrowRead';
import { VerdictStamp } from '../components/VerdictStamp';

export const LandingPage: React.FC = () => {
  const [bounty14, setBounty14] = useState<{
    id: string;
    title: string;
    repo: string;
    reward: string;
    status: string;
    source: 'chain' | 'saved';
  }>({
    id: '14',
    title: 'Implement slugify(text) in src/slug.py',
    repo: 'huzyow155/ship-escrow-fixtures',
    reward: '1000',
    status: 'SETTLED',
    source: 'saved',
  });

  useEffect(() => {
    getBounty('14')
      .then((data) => {
        if (data) {
          setBounty14({
            id: data.id || '14',
            title: data.title || 'Implement slugify(text) in src/slug.py',
            repo: data.owner_repo || 'huzyow155/ship-escrow-fixtures',
            reward: data.amount || '1000',
            status: data.status || 'SETTLED',
            source: 'chain',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '40px 0 70px 0' }}>
      <div className="container">
        {/* Hero Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          {/* Left Column: Value Sentence & Buttons */}
          <div>
            <div className="docket-tab" style={{ marginBottom: '14px' }}>
              Customs Docket Manifest
            </div>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 46px)',
                lineHeight: 1.15,
                marginBottom: '18px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
              }}
            >
              GitHub Bounty Escrow on GenLayer
            </h1>
            <p
              style={{
                fontSize: '17px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}
            >
              On-demand code bounty escrow evaluating GitHub pull request diffs against human criteria via multi-validator consensus.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/app" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <span>Open Manifest Board</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/app/create" className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                <PlusCircle size={16} />
                <span>New Bounty Docket</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Illustrated CSS/SVG Manifest Card */}
          <div>
            <div className="ticket-card" style={{ transform: 'rotate(0.5deg)' }}>
              <div className="ticket-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="docket-tab">DOCKET #{bounty14.id}</span>
                  <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {bounty14.repo}
                  </span>
                </div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {bounty14.source === 'chain' ? 'verified on-chain' : 'from saved evidence'}
                </span>
              </div>

              <div className="ticket-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '19px', marginBottom: '6px' }}>{bounty14.title}</h2>
                    <div className="font-mono" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Reward Escrow: <strong>{bounty14.reward} Credits</strong>
                    </div>
                  </div>
                  <VerdictStamp verdict="RELEASE_100" size="md" />
                </div>

                <div className="ruled-line font-mono" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Consensus Gate: <strong>All Paths Passed</strong></span>
                  <span>Attempts: <strong>1 of 3</strong></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Ledger: 1000 credits paid to dev
                  </span>
                  <Link
                    to="/app/bounty/14"
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--stamp-ochre)', textDecoration: 'underline' }}
                  >
                    Inspect docket #14 &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Pipeline (SVG-drawn horizontal track) */}
        <div className="ticket-card" style={{ marginBottom: '40px' }}>
          <div className="ticket-header">
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '16px' }}>
              Consensus Verification Pipeline
            </span>
            <span className="docket-tab">5-Stage Execution</span>
          </div>

          <div className="ticket-body" style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                position: 'relative',
              }}
            >
              {[
                { step: '1', title: 'PR Diff Submitted', desc: 'Pull request head sha verified against GitHub.' },
                { step: '2', title: 'Hard Gates Evaluated', desc: 'Required path checks exit fast if files missing.' },
                { step: '3', title: 'Validators Extract Facts', desc: 'Multi-validator consensus labels MUST and SHOULD.' },
                { step: '4', title: 'Contract Code Decides', desc: 'Deterministic score calculation fixes verdict tier.' },
                { step: '5', title: 'Ledger Settlement', desc: 'Credits disbursed or returned to creator balance.' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--bg-card-header)',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      color: 'var(--stamp-ochre)',
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Honest Boundaries Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700, fontSize: '14px' }}>1. Internal Credits</span>
              <ShieldCheck size={16} style={{ color: 'var(--stamp-green)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Balances are tracked as internal ledger credits on Studionet. No external tokens are held in locked custody.
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700, fontSize: '14px' }}>2. No Native Clocks</span>
              <Clock size={16} style={{ color: 'var(--stamp-ochre)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              GenVM has no native timestamp. Lifecycles conclude via 3 failed attempts (exhaustion refund) or voluntary cancellation.
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700, fontSize: '14px' }}>3. Public Textual Diffs</span>
              <FileCode size={16} style={{ color: 'var(--stamp-red)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Diff evaluation inspects public repository text commits. Vague criteria causes validator splits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
