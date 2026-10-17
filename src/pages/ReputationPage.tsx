import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDevScore, getCreatorScore, listRecentSettlements, syncBountyReputation } from '../services/reputation';
import { DevReputation, CreatorReputation } from '../types';
import { StopwatchTimer } from '../components/StopwatchTimer';
import { Award, RefreshCw, AlertCircle, CheckCircle2, User, History } from 'lucide-react';

export const ReputationPage: React.FC = () => {
  const [address, setAddress] = useState<string>('0x8506682bf3eb10343ddeae251e240eb0b74031ce');
  const [devScore, setDevScore] = useState<DevReputation | null>(null);
  const [creatorScore, setCreatorScore] = useState<CreatorReputation | null>(null);
  const [recentBounties, setRecentBounties] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Action State
  const [syncBountyId, setSyncBountyId] = useState<string>('14');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncElapsed, setSyncElapsed] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [syncError, setSyncError] = useState<string>('');

  const loadScores = async (targetAddr: string) => {
    setLoading(true);
    try {
      const [dev, creator, recents] = await Promise.all([
        getDevScore(targetAddr),
        getCreatorScore(targetAddr),
        listRecentSettlements(10),
      ]);
      setDevScore(dev);
      setCreatorScore(creator);
      setRecentBounties(recents);
    } catch (err) {
      console.error('Error loading reputation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores(address.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      loadScores(address.trim());
    }
  };

  const handleSync = async () => {
    if (!syncBountyId.trim()) return;
    setSyncing(true);
    setSyncElapsed(0);
    setSyncStatus('');
    setSyncError('');

    try {
      const res = await syncBountyReputation(syncBountyId.trim(), (sec) => {
        setSyncElapsed(sec);
      });
      setSyncStatus(`Sync successful (Tx: ${res.txHash.slice(0, 10)}...)`);
      await loadScores(address.trim());
    } catch (err: any) {
      setSyncError(err?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const totalVerdictCount = devScore
    ? Object.values(devScore.best_verdict_counts || {}).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div className="docket-tab" style={{ marginBottom: '4px' }}>LEDGER AUDIT</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Reputation Manifest</h1>
        </div>

        {/* Address Search Form */}
        <form onSubmit={handleLookup} className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-body" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <User size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input font-mono"
              placeholder="0x... account address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ flex: 1, minWidth: '240px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: '44px' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Query Scores</span>
            </button>
          </div>
        </form>

        {/* Score Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Contributor Score */}
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>Developer Track Record</span>
              <Award size={16} style={{ color: 'var(--stamp-green)' }} />
            </div>
            <div className="ticket-body">
              {devScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Units Earned:</span>
                    <span className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--stamp-green)' }}>
                      {devScore.units_earned} Credits
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Settled Bounties:</span>
                    <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800 }}>
                      {devScore.settled_count}
                    </span>
                  </div>

                  {/* Verdict Distribution Small Bar */}
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Verdict Distribution
                    </div>
                    {totalVerdictCount > 0 ? (
                      <div className="payout-split-bar" style={{ height: '12px', margin: '0 0 8px 0' }}>
                        {Object.entries(devScore.best_verdict_counts || {}).map(([v, count]) => {
                          const pct = Math.round((count / totalVerdictCount) * 100);
                          const bg = v.includes('100') || v.includes('75')
                            ? 'var(--stamp-green)'
                            : v.includes('REVIEW')
                            ? 'var(--stamp-ochre)'
                            : 'var(--stamp-red)';
                          return (
                            <div
                              key={v}
                              className="payout-split-segment"
                              style={{ width: `${pct}%`, background: bg }}
                              title={`${v}: ${count} (${pct}%)`}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(devScore.best_verdict_counts || {}).map(([v, count]) => (
                        <span key={v} className="badge badge-settled" style={{ fontSize: '10px' }}>
                          {v}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No developer score recorded yet.</p>
              )}
            </div>
          </div>

          {/* Creator Score */}
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>Creator Escrow Record</span>
              <Award size={16} style={{ color: 'var(--stamp-ochre)' }} />
            </div>
            <div className="ticket-body">
              {creatorScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Bounties Settled:</span>
                    <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800 }}>
                      {creatorScore.bounties_settled}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Units Paid:</span>
                    <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--stamp-green)' }}>
                      {creatorScore.units_paid} Credits
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Units Refunded:</span>
                    <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--stamp-red)' }}>
                      {creatorScore.units_refunded} Credits
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No creator score recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sync Tool Section with Duplicate-Revert Example */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Synchronize Bounty Settlement</span>
            <span className="docket-tab">Cross-Contract Sync</span>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input font-mono"
                value={syncBountyId}
                onChange={(e) => setSyncBountyId(e.target.value)}
                placeholder="Bounty ID to sync"
                style={{ maxWidth: '180px' }}
              />

              <button onClick={handleSync} disabled={syncing} className="btn btn-primary" style={{ fontSize: '13px' }}>
                {syncing ? 'Syncing...' : 'Sync Settlement'}
              </button>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn btn-secondary"
                style={{ fontSize: '13px', color: 'var(--stamp-ochre)' }}
                title="Testing duplicate sync execution against contract validation"
              >
                Sync Again (Expect Revert)
              </button>

              {syncing && <StopwatchTimer seconds={syncElapsed} />}
            </div>

            {syncStatus && (
              <div style={{ color: 'var(--stamp-green)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>{syncStatus}</span>
              </div>
            )}

            {syncError && (
              <div
                style={{
                  color: 'var(--stamp-red)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  background: 'var(--stamp-red-faint)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--stamp-red)',
                }}
                role="alert"
              >
                <AlertCircle size={16} />
                <span>Contract Response: {syncError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Settlements List as Manifest Rows */}
        <div className="ticket-card">
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} style={{ color: 'var(--stamp-ochre)' }} />
              <span style={{ fontWeight: 700 }}>Recent Synchronized Bounties</span>
            </div>
            <span className="docket-tab">Ledger Audit</span>
          </div>
          <div className="ticket-body">
            {recentBounties.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No settlements synchronized yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentBounties.map((bid) => (
                  <div
                    key={bid}
                    className="ruled-line"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      paddingBottom: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="docket-tab">#{bid}</span>
                      <span className="font-mono">Settlement Synchronized</span>
                    </div>
                    <Link
                      to={`/app/bounty/${bid}`}
                      style={{ fontSize: '12px', textDecoration: 'underline', color: 'var(--stamp-ochre)' }}
                    >
                      View Docket &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
