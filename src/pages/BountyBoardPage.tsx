import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listBounties, getBounty } from '../services/escrowRead';
import { Bounty, EscrowStats, BountyStatus } from '../types';
import { Plus, RefreshCw, FolderGit2, Inbox } from 'lucide-react';

export const BountyBoardPage: React.FC = () => {
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [filter, setFilter] = useState<'ALL' | BountyStatus>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await getStats();
      setStats(s);

      const ids = await listBounties(20);
      const loaded: Bounty[] = [];
      for (const id of ids) {
        const b = await getBounty(id);
        if (b) loaded.push(b);
      }
      setBounties(loaded);
    } catch (err) {
      console.error('Failed loading bounty board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = bounties.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const getStatusCount = (st: 'ALL' | BountyStatus) => {
    if (st === 'ALL') return bounties.length;
    if (stats) {
      if (st === 'OPEN') return stats.open;
      if (st === 'SETTLED') return stats.settled;
      if (st === 'CANCELLED') return stats.cancelled;
      if (st === 'EXHAUSTED') return stats.exhausted;
    }
    return bounties.filter((b) => b.status === st).length;
  };

  const renderAttemptDots = (attemptsStr: string) => {
    const attempts = parseInt(attemptsStr || '0', 10);
    return (
      <span className="font-mono" style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
        {[1, 2, 3].map((num) => (
          <span
            key={num}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: num <= attempts ? 'var(--stamp-ochre)' : 'transparent',
              border: `1.5px solid ${num <= attempts ? 'var(--stamp-ochre)' : 'var(--border-dashed)'}`,
              display: 'inline-block',
            }}
            title={`Attempt ${num}: ${num <= attempts ? 'Evaluated' : 'Available'}`}
          />
        ))}
      </span>
    );
  };

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container">
        {/* Header Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div className="docket-tab" style={{ marginBottom: '4px' }}>CUSTOMS REGISTRY</div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Manifest Bounties</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={loadData} className="btn btn-secondary" disabled={loading} title="Refresh on-chain state">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/app/create" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Bounty</span>
            </Link>
          </div>
        </div>

        {/* Docket Tabs Stat Strip from get_stats */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '22px',
            }}
          >
            {[
              { label: 'OPEN DOCKETS', count: stats.open, color: 'var(--stamp-ochre)' },
              { label: 'SETTLED', count: stats.settled, color: 'var(--stamp-green)' },
              { label: 'CANCELLED', count: stats.cancelled, color: 'var(--stamp-red)' },
              { label: 'EXHAUSTED', count: stats.exhausted, color: 'var(--stamp-ochre)' },
            ].map((tab) => (
              <div
                key={tab.label}
                className="ticket-card"
                style={{
                  padding: '12px 14px',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderTop: `3px solid ${tab.color}`,
                }}
              >
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  {tab.label}
                </div>
                <div className="font-mono" style={{ fontSize: '22px', fontWeight: 800, color: tab.color }}>
                  {tab.count}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Chips with counts */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
          {(['ALL', 'OPEN', 'SETTLED', 'CANCELLED', 'EXHAUSTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={filter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '12px', padding: '5px 12px', minHeight: '34px', height: '34px' }}
            >
              <span>{st}</span>
              <span className="docket-tab" style={{ padding: '1px 5px', fontSize: '10px', background: 'transparent' }}>
                {getStatusCount(st)}
              </span>
            </button>
          ))}
        </div>

        {/* Bounties List / Empty State */}
        {loading && bounties.length === 0 ? (
          <div className="ticket-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading on-chain records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="ticket-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Inbox size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              No bounty tickets match selected criteria.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {filtered.map((b) => {
              const badgeClass =
                b.status === 'OPEN'
                  ? 'badge-open'
                  : b.status === 'SETTLED'
                  ? 'badge-settled'
                  : b.status === 'EXHAUSTED'
                  ? 'badge-exhausted'
                  : 'badge-refunded';

              return (
                <Link
                  key={b.id}
                  to={`/app/bounty/${b.id}`}
                  className="ticket-card"
                  style={{ display: 'block' }}
                >
                  <div className="ticket-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="docket-tab">#{b.id}</span>
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>{b.title}</span>
                    </div>
                    <span className={`badge ${badgeClass}`}>{b.status}</span>
                  </div>

                  <div
                    className="ticket-body"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '14px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <FolderGit2 size={15} />
                      <span className="font-mono">{b.owner_repo}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                      <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Attempts:</span>
                        {renderAttemptDots(b.attempts)}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          fontWeight: 700,
                        }}
                      >
                        {b.amount} Credits
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
