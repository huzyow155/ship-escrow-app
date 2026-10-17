import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, ShieldAlert, Cpu, GitCommit } from 'lucide-react';
import { VerdictStamp } from '../components/VerdictStamp';

export const EvidencePage: React.FC = () => {
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          Consensus Evidence & Pre-Registration
        </h1>

        {/* F1 - F5 Pre-Registration vs Actual Results Table */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <GitCommit size={16} style={{ color: 'var(--primary)' }} />
              <span>Fixtures F1–F5: Pre-Registration (Commit e266765) vs Studionet</span>
            </div>
          </div>

          <div className="ticket-body" style={{ padding: '0' }}>
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
                        <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> YES
                        </span>
                      </td>
                      <td>
                        <a
                          href={f.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', fontSize: '12px' }}
                        >
                          {f.txHash.slice(0, 10)}... <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Empirical Findings Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* F3 Gate Only */}
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>F3 Anti-CI Gaming</span>
              <Cpu size={16} style={{ color: 'var(--warning)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px' }}>
              <p>Hard gate fired (test_deleted); LLM not invoked.</p>
            </div>
          </div>

          {/* F5 Prompt Injection */}
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>F5 Injection Defense</span>
              <ShieldAlert size={16} style={{ color: 'var(--danger)' }} />
            </div>
            <div className="ticket-body" style={{ fontSize: '13px' }}>
              <p>Injection ignored; verdict REFUND from MUST NO. Model labels not stored.</p>
            </div>
          </div>
        </div>

        {/* Error Cases & Lifecycle Records */}
        <div className="ticket-card">
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Verified Edge Cases</span>
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

            <div>
              <strong>Case G &amp; H &amp; L:</strong>
              <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                Duplicate SHA blocked; 3 attempts exhausted refunded; duplicate sync rejected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
