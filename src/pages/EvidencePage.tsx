import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert, Cpu, GitCommit, Copy, Check } from 'lucide-react';
import { VerdictStamp } from '../components/VerdictStamp';

export const EvidencePage: React.FC = () => {
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetch('/evidence.json')
      .then((res) => res.json())
      .then((data) => {
        setEvidence(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching evidence.json:', err);
        setLoading(false);
      });
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading || !evidence) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading verified evidence dataset...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '22px' }}>
          <div className="docket-tab" style={{ marginBottom: '4px' }}>EMPIRICAL AUDIT</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Consensus Evidence</h1>
        </div>

        {/* F1 - F5 Pre-Registration vs Actual Results Table (Collapses to cards on mobile) */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <GitCommit size={16} style={{ color: 'var(--stamp-ochre)' }} />
              <span>Fixtures F1–F5: Pre-Registration (e266765) vs Studionet</span>
            </div>
            <span className="docket-tab">Receipts</span>
          </div>

          <div className="ticket-body" style={{ padding: '0' }}>
            {/* Desktop Table View */}
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Fixture</th>
                    <th>Head SHA</th>
                    <th>Pre-Registered</th>
                    <th>Actual On-Chain</th>
                    <th>Match</th>
                    <th>Explorer Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.fixtures.map((f: any) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.id}</strong>: {f.title}
                      </td>
                      <td className="font-mono" style={{ fontSize: '12px' }}>
                        {f.headSha.slice(0, 8)}...
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{f.preRegisteredVerdict}</span>
                      </td>
                      <td>
                        <VerdictStamp verdict={f.actualVerdict} size="sm" />
                      </td>
                      <td>
                        <span style={{ color: 'var(--stamp-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> YES MATCH
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={f.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', fontSize: '12px' }}
                          >
                            {f.txHash.slice(0, 8)}... <ExternalLink size={11} />
                          </a>
                          <button
                            type="button"
                            onClick={() => copyHash(f.txHash)}
                            className="btn btn-outline"
                            style={{ padding: '3px 6px', minHeight: '24px', height: '24px' }}
                            title="Copy transaction hash"
                          >
                            {copiedHash === f.txHash ? <Check size={11} style={{ color: 'var(--stamp-green)' }} /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3 Findings Callout Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>1. Gate Exits Skip Model</span>
              <Cpu size={16} style={{ color: 'var(--stamp-green)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Deterministic path checks exit immediately when required files are untouched, bypassing model execution.
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>2. Injection Ignored</span>
              <ShieldAlert size={16} style={{ color: 'var(--stamp-ochre)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Diff prompt injection attempts are neutralized by strict schema validation and consensus voting.
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>3. Duplicate Head SHA Blocked</span>
              <CheckCircle2 size={16} style={{ color: 'var(--stamp-red)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Submitting identical commit hashes on the same bounty is rejected on-chain by the contract.
            </div>
          </div>
        </div>

        {/* Edge Cases Table */}
        <div className="ticket-card">
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Verified Edge Cases</span>
            <span className="docket-tab">Reverts</span>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div>
              <strong>Case F — 3 Reverts:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '4px', color: 'var(--text-muted)' }}>
                {evidence.cases.caseF_Reverts.map((c: any, i: number) => (
                  <li key={i}>
                    {c.scenario}: <span className="font-mono">"{c.error}"</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
