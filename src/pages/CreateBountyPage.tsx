import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Criterion, computeCriteriaHash } from '../lib/criteria';
import { createBounty } from '../services/escrowWrite';
import { StopwatchTimer } from '../components/StopwatchTimer';
import { Plus, Trash2, Hash, AlertCircle } from 'lucide-react';

export const CreateBountyPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('Implement slugify helper');
  const [ownerRepo, setOwnerRepo] = useState<string>('huzyow155/ship-escrow-fixtures');
  const [criteria, setCriteria] = useState<Criterion[]>([
    {
      level: 'MUST',
      text: 'Adds a function slugify(text) in src/slug.py that lowercases and collapses runs of non-alphanumeric characters into a single hyphen',
    },
    {
      level: 'MUST',
      text: 'Adds at least one test under tests/ that calls slugify',
    },
    {
      level: 'SHOULD',
      text: 'Updates README.md with a usage example',
    },
  ]);
  const [requiredPaths, setRequiredPaths] = useState<string[]>(['src/slug.py']);
  const [amount, setAmount] = useState<string>('1000');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string | undefined>();
  const [error, setError] = useState<string>('');

  // Client-computed Criteria Hash
  const currentCriteriaHash = computeCriteriaHash(criteria, requiredPaths);

  // Scoring preview calculation
  const maxPoints = criteria.reduce((sum, c) => sum + (c.level === 'MUST' ? 3 : 1) * 2, 0);
  const p100 = Math.ceil((maxPoints * 90) / 100);
  const p75 = Math.ceil((maxPoints * 65) / 100);
  const p50 = Math.ceil((maxPoints * 40) / 100);
  const p25 = Math.ceil((maxPoints * 15) / 100);

  const addCriterion = () => {
    if (criteria.length >= 5) return;
    setCriteria([...criteria, { level: 'SHOULD', text: '' }]);
  };

  const removeCriterion = (idx: number) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const updateCriterion = (idx: number, field: 'level' | 'text', val: string) => {
    const updated = [...criteria];
    if (field === 'level') {
      updated[idx].level = val as 'MUST' | 'SHOULD';
    } else {
      updated[idx].text = val;
    }
    setCriteria(updated);
  };

  const addPath = () => {
    if (requiredPaths.length >= 3) return;
    setRequiredPaths([...requiredPaths, '']);
  };

  const removePath = (idx: number) => {
    setRequiredPaths(requiredPaths.filter((_, i) => i !== idx));
  };

  const updatePath = (idx: number, val: string) => {
    const updated = [...requiredPaths];
    updated[idx] = val;
    setRequiredPaths(updated);
  };

  const validate = (): string | null => {
    if (title.length < 3 || title.length > 80) {
      return 'Title must be between 3 and 80 ASCII characters';
    }
    if (!/^[A-Za-z0-9._-]{1,39}\/[A-Za-z0-9._-]{1,100}$/.test(ownerRepo.trim())) {
      return 'Invalid owner/repo format';
    }
    if (criteria.length < 1 || criteria.length > 5) {
      return 'Criteria count must be between 1 and 5';
    }
    if (!criteria.some((c) => c.level === 'MUST')) {
      return 'At least one criterion must have level MUST';
    }
    for (const c of criteria) {
      if (c.text.trim().length < 5 || c.text.trim().length > 200) {
        return 'Criterion text must be between 5 and 200 characters';
      }
    }
    if (requiredPaths.length > 3) {
      return 'Required paths must have between 0 and 3 items';
    }
    for (const p of requiredPaths) {
      const trimmed = p.trim();
      if (!trimmed || trimmed.startsWith('/') || trimmed.includes('..')) {
        return 'Invalid required path prefix';
      }
    }
    const amtNum = parseInt(amount, 10);
    if (isNaN(amtNum) || amtNum < 1 || amtNum > 1000000) {
      return 'Amount must be integer between 1 and 1000000';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSubmitting(true);
    setElapsed(0);
    setStatusMsg(undefined);

    try {
      const validPaths = requiredPaths.map((p) => p.trim()).filter(Boolean);
      const res = await createBounty(
        title.trim(),
        ownerRepo.trim(),
        criteria,
        validPaths,
        amount.trim(),
        (sec, msg) => {
          setElapsed(sec);
          if (msg) setStatusMsg(msg);
        }
      );

      navigate(res.bountyId ? `/app/bounty/${res.bountyId}` : '/app');
    } catch (err: any) {
      setError(err?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
          Create Bounty Manifest
        </h1>

        <form onSubmit={handleSubmit} className="ticket-card">
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Bounty Configuration</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="font-mono">
              <Hash size={14} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Criteria Hash: {currentCriteriaHash.slice(0, 10)}...{currentCriteriaHash.slice(-6)}
              </span>
            </div>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: 'var(--danger-faint)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="bounty-title" style={{ fontSize: '14px', fontWeight: 600 }}>Title</label>
                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {title.length}/80
                </span>
              </div>
              <input
                id="bounty-title"
                type="text"
                className="input font-mono"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
              />
            </div>

            {/* Owner/Repo */}
            <div>
              <label htmlFor="target-repo" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Target Repository (owner/repo)
              </label>
              <input
                id="target-repo"
                type="text"
                className="input font-mono"
                value={ownerRepo}
                onChange={(e) => setOwnerRepo(e.target.value)}
                required
              />
            </div>

            {/* Criteria Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600 }}>
                  Acceptance Criteria ({criteria.length}/5, &ge; 1 MUST)
                </label>
                <button
                  type="button"
                  onClick={addCriterion}
                  disabled={criteria.length >= 5}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <Plus size={14} /> Add Criterion
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {criteria.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      className="select font-mono"
                      aria-label={`Criterion ${idx + 1} severity level`}
                      value={c.level}
                      onChange={(e) => updateCriterion(idx, 'level', e.target.value)}
                      style={{ width: '110px' }}
                    >
                      <option value="MUST">MUST</option>
                      <option value="SHOULD">SHOULD</option>
                    </select>

                    <input
                      type="text"
                      className="input"
                      aria-label={`Criterion ${idx + 1} requirement`}
                      placeholder="Criterion requirement (5-200 chars)"
                      value={c.text}
                      onChange={(e) => updateCriterion(idx, 'text', e.target.value)}
                      minLength={5}
                      maxLength={200}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removeCriterion(idx)}
                      disabled={criteria.length <= 1}
                      className="btn btn-outline"
                      style={{ padding: '8px', color: 'var(--danger)' }}
                      title="Remove"
                      aria-label={`Remove criterion ${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Paths Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600 }}>
                  Required Path Prefixes ({requiredPaths.length}/3)
                </label>
                <button
                  type="button"
                  onClick={addPath}
                  disabled={requiredPaths.length >= 3}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <Plus size={14} /> Add Path
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requiredPaths.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input font-mono"
                      aria-label={`Required path prefix ${idx + 1}`}
                      placeholder="e.g. src/slug.py"
                      value={p}
                      onChange={(e) => updatePath(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removePath(idx)}
                      className="btn btn-outline"
                      style={{ padding: '8px', color: 'var(--danger)' }}
                      aria-label={`Remove required path ${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="escrow-amount" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Escrow Reward Amount (Credits)
              </label>
              <input
                id="escrow-amount"
                type="number"
                className="input font-mono"
                min={1}
                max={1000000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Points & Thresholds Preview */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '14px',
                borderRadius: '6px',
                border: '1px dashed var(--border-dashed)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>Points & Thresholds Preview:</div>
              <div
                className="font-mono"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}
              >
                <div>Max: <strong>{maxPoints} pts</strong></div>
                <div>100%: <strong>&ge; {p100} pts</strong></div>
                <div>75%: <strong>&ge; {p75} pts</strong></div>
                <div>50%: <strong>&ge; {p50} pts</strong></div>
                <div>25%: <strong>&ge; {p25} pts</strong></div>
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              {submitting ? (
                <StopwatchTimer seconds={elapsed} statusMessage={statusMsg} />
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '10px 24px' }}
              >
                {submitting ? 'Creating on Studionet...' : 'Publish Bounty'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
