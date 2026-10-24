import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Criterion, computeCriteriaHash } from '../lib/criteria';
import { createBounty } from '../services/escrowWrite';
import { StopwatchTimer } from '../components/StopwatchTimer';
import { Plus, Trash2, Copy, Check, AlertCircle, FileCheck } from 'lucide-react';

export const CreateBountyPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('Implement slugify helper');
  const [ownerRepo, setOwnerRepo] = useState<string>('hypercybers99/ship-escrow-fixtures');
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
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

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

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentCriteriaHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
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
      <div className="container">
        <div style={{ marginBottom: '22px' }}>
          <div className="docket-tab" style={{ marginBottom: '4px' }}>CUSTOMS FORM</div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>New Bounty Docket</h1>
        </div>

        {/* Two-Column Grid on Desktop, Single-Column on Mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Form */}
          <form onSubmit={handleSubmit} className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>Docket Specifications</span>
              <span className="docket-tab">Parameters</span>
            </div>

            <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'var(--stamp-red-faint)',
                    border: '1px solid var(--stamp-red)',
                    color: 'var(--stamp-red)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  role="alert"
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Docket Title
                </label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement slugify helper"
                  maxLength={80}
                  required
                />
              </div>

              {/* Repo Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  GitHub Repository (owner/repo)
                </label>
                <input
                  type="text"
                  className="input font-mono"
                  value={ownerRepo}
                  onChange={(e) => setOwnerRepo(e.target.value)}
                  placeholder="owner/repo"
                  required
                />
              </div>

              {/* Reward Amount */}
              <div>
                <label htmlFor="bounty-reward-amount" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Bounty Reward (Credits)
                </label>
                <input
                  id="bounty-reward-amount"
                  aria-label="Bounty Reward (Credits)"
                  type="number"
                  className="input font-mono"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="1000000"
                  required
                />
              </div>

              {/* Required Paths */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>
                    Required File Paths ({requiredPaths.length}/3)
                  </label>
                  {requiredPaths.length < 3 && (
                    <button
                      type="button"
                      onClick={addPath}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 8px', minHeight: '28px', height: '28px' }}
                    >
                      <Plus size={12} /> Add Path
                    </button>
                  )}
                </div>
                {requiredPaths.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="input font-mono"
                      style={{ fontSize: '12px' }}
                      value={p}
                      onChange={(e) => updatePath(idx, e.target.value)}
                      placeholder="e.g. src/slug.py"
                    />
                    <button
                      type="button"
                      onClick={() => removePath(idx)}
                      className="btn btn-outline"
                      style={{ padding: '8px', color: 'var(--stamp-red)', minHeight: '36px', height: '36px', width: '36px' }}
                      aria-label="Remove path"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Criteria List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>
                    Acceptance Criteria ({criteria.length}/5)
                  </label>
                  {criteria.length < 5 && (
                    <button
                      type="button"
                      onClick={addCriterion}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 8px', minHeight: '28px', height: '28px' }}
                    >
                      <Plus size={12} /> Add Criterion
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {criteria.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <select
                          aria-label="Criterion severity level"
                          value={c.level}
                          onChange={(e) => updateCriterion(idx, 'level', e.target.value)}
                          className="select font-mono"
                          style={{
                            width: '105px',
                            minHeight: '32px',
                            height: '32px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          <option value="MUST">MUST (3 pts)</option>
                          <option value="SHOULD">SHOULD (1 pt)</option>
                        </select>
                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCriterion(idx)}
                            className="btn btn-outline"
                            style={{ padding: '4px', color: 'var(--stamp-red)', minHeight: '28px', height: '28px', width: '28px' }}
                            aria-label="Remove criterion"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <textarea
                        className="textarea"
                        style={{ fontSize: '12px', minHeight: '52px', padding: '8px' }}
                        value={c.text}
                        onChange={(e) => updateCriterion(idx, 'text', e.target.value)}
                        placeholder="Specify verifiable requirements for the pull request..."
                        maxLength={200}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button & Timer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                {submitting ? (
                  <StopwatchTimer seconds={elapsed} statusMessage={statusMsg} />
                ) : (
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Requires Studionet transaction sign
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {submitting ? 'Creating Docket...' : 'Create Bounty Docket'}
                </button>
              </div>
            </div>
          </form>

          {/* Right Column: Live Manifest Preview */}
          <div className="ticket-card" style={{ position: 'sticky', top: '80px' }}>
            <div className="ticket-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={16} style={{ color: 'var(--stamp-ochre)' }} />
                <span style={{ fontWeight: 700 }}>Live Manifest Preview</span>
              </div>
              <span className="docket-tab">DRAFT</span>
            </div>

            <div className="ticket-body">
              <h2 style={{ fontSize: '18px', marginBottom: '6px' }}>{title || 'Untitled Bounty'}</h2>
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Target: <strong>{ownerRepo || 'unassigned'}</strong> | Escrow: <strong>{amount} Credits</strong>
              </div>

              {/* Criteria Preview */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Evaluation Criteria
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {criteria.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'var(--bg-subtle)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '3px',
                          background: c.level === 'MUST' ? 'var(--stamp-red)' : 'var(--stamp-ochre)',
                          color: 'var(--stamp-solid-text)',
                        }}
                      >
                        {c.level}
                      </span>
                      <span>{c.text || 'Empty criterion'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thresholds Table */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Verdict Point Thresholds (Max {maxPoints} pts)
                </div>
                <div className="font-mono" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                  <div style={{ padding: '6px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--stamp-green)', fontWeight: 700 }}>100%</div>
                    <div>&ge; {p100} pts</div>
                  </div>
                  <div style={{ padding: '6px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700 }}>75%</div>
                    <div>&ge; {p75} pts</div>
                  </div>
                  <div style={{ padding: '6px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700 }}>50%</div>
                    <div>&ge; {p50} pts</div>
                  </div>
                  <div style={{ padding: '6px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--stamp-red)', fontWeight: 700 }}>25%</div>
                    <div>&ge; {p25} pts</div>
                  </div>
                </div>
              </div>

              {/* Computed Criteria Hash with Copy Button */}
              <div style={{ paddingTop: '10px', borderTop: '1px dashed var(--border-dashed)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Client-Computed Criteria Hash
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '3px 8px', minHeight: '26px', height: '26px' }}
                    title="Copy criteria hash"
                  >
                    {copiedHash ? <Check size={12} style={{ color: 'var(--stamp-green)' }} /> : <Copy size={12} />}
                    <span>{copiedHash ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    wordBreak: 'break-all',
                    background: 'var(--bg-subtle)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {currentCriteriaHash}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
