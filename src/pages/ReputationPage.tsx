import React, { useState, useEffect } from 'react';
import { getDevScore, getCreatorScore, listRecentSettlements, syncBountyReputation } from '../services/reputation';
import { DevReputation, CreatorReputation } from '../types';
import { StopwatchTimer } from '../components/StopwatchTimer';
import { Award, RefreshCw, AlertCircle, CheckCircle2, User } from 'lucide-react';

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

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          Reputation Manifest
        </h1>

        {/* Address Search Form */}
        <form onSubmit={handleLookup} className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-body" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <User size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input font-mono"
              placeholder="0x... account address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Query Scores</span>
            </button>
          </div>
        </form>

        {/* Score Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Contributor Score */}
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>Developer Track Record</span>
              <Award size={16} style={{ color: 'var(--success)' }} />
            </div>
            <div className="ticket-body">
              {devScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Units Earned:</span>
                    <strong className="font-mono">{devScore.units_earned} Credits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Settled Bounties:</span>
                    <strong className="font-mono">{devScore.settled_count}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                      Best Verdict Distribution:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(devScore.best_verdict_counts || {}).map(([v, count]) => (
                        <span key={v} className="badge badge-settled" style={{ fontSize: '11px' }}>
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
              <Award size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="ticket-body">
              {creatorScore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bounties Settled:</span>
                    <strong className="font-mono">{creatorScore.bounties_settled}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Units Paid:</span>
                    <strong className="font-mono">{creatorScore.units_paid} Credits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Units Refunded:</span>
                    <strong className="font-mono">{creatorScore.units_refunded} Credits</strong>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No creator score recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sync Tool Section */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Synchronize Bounty Settlement</span>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cross-contract view sync
            </span>
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

              <button onClick={handleSync} disabled={syncing} className="btn btn-outline" style={{ fontSize: '13px', color: 'var(--warning)' }}>
                Sync Again (Expect Revert)
              </button>

              {syncing && <StopwatchTimer seconds={syncElapsed} />}
            </div>

            {syncStatus && (
              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>{syncStatus}</span>
              </div>
            )}

            {syncError && (
              <div
                style={{
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  background: 'var(--danger-faint)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--danger)',
                }}
              >
                <AlertCircle size={16} />
                <span>Contract Response: {syncError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Settlements List */}
        <div className="ticket-card">
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Recent Synchronized Bounties</span>
          </div>
          <div className="ticket-body">
            {recentBounties.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No settlements synchronized yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {recentBounties.map((bid) => (
                  <span
                    key={bid}
                    className="font-mono"
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    Bounty #{bid}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
