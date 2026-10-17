import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listBounties, getBounty } from '../services/escrowRead';
import { Bounty, EscrowStats, BountyStatus } from '../types';
import { Plus, RefreshCw, FolderGit2 } from 'lucide-react';

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

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container">
        {/* Top Control Bar: Title & Stats */}
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
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Manifest Bounties</h1>
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

        {/* Aggregate Stats Bar */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div className="ticket-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OPEN</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                {stats.open}
              </div>
            </div>
            <div className="ticket-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SETTLED</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>
                {stats.settled}
              </div>
            </div>
            <div className="ticket-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CANCELLED</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)' }}>
                {stats.cancelled}
              </div>
            </div>
            <div className="ticket-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EXHAUSTED</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>
                {stats.exhausted}
              </div>
            </div>
            <div className="ticket-card" style={{ padding: '12px', textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REFUNDED</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-faint)' }}>
                {stats.refunded}
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {(['ALL', 'OPEN', 'SETTLED', 'EXHAUSTED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={filter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bounties List */}
        {loading && bounties.length === 0 ? (
          <div className="ticket-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading on-chain records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="ticket-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No bounties match filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {filtered.map((b) => {
              const attemptsLeft = Math.max(0, 3 - parseInt(b.attempts || '0', 10));
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
                  style={{ display: 'block', transition: 'border-color 0.15s ease' }}
                >
                  <div className="ticket-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        #{b.id}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '16px' }}>{b.title}</span>
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
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <FolderGit2 size={15} />
                      <span className="font-mono">{b.owner_repo}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                      <div className="font-mono">
                        <span style={{ color: 'var(--text-muted)' }}>Attempts: </span>
                        <strong>{b.attempts}/3</strong> ({attemptsLeft} left)
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
