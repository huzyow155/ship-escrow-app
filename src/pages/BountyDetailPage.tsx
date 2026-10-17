import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBounty, listSubmissions, getSubmission, getSettlement, isSettledFor } from '../services/escrowRead';
import { submitWork, cancelBounty, refundExhausted } from '../services/escrowWrite';
import { Bounty, Submission, Settlement } from '../types';
import { VerdictStamp } from '../components/VerdictStamp';
import { StopwatchTimer } from '../components/StopwatchTimer';
import { ArrowLeft, ExternalLink, RefreshCw, GitPullRequest, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export const BountyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Submit Work Form State
  const [prUrl, setPrUrl] = useState<string>('https://github.com/huzyow155/ship-escrow-fixtures/pull/2');
  const [headSha, setHeadSha] = useState<string>('5db0441e76af93606fd82feebbe49c5a2f145326');
  const [fetchingSha, setFetchingSha] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionRunning, setActionRunning] = useState<boolean>(false);

  // Settlement Check Tool State
  const [checkBountyId, setCheckBountyId] = useState<string>('');
  const [checkCriteriaHash, setCheckCriteriaHash] = useState<string>('');
  const [checkHeadSha, setCheckHeadSha] = useState<string>('');
  const [checkDev, setCheckDev] = useState<string>('');
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await getBounty(id);
      setBounty(b);

      const subIds = await listSubmissions(id);
      const loadedSubs: Submission[] = [];
      for (const sid of subIds) {
        const s = await getSubmission(sid);
        if (s) loadedSubs.push(s);
      }
      setSubmissions(loadedSubs);

      if (b && b.status === 'SETTLED') {
        const sett = await getSettlement(id);
        setSettlement(sett);
        if (sett) {
          setCheckBountyId(sett.bounty_id);
          setCheckCriteriaHash(sett.criteria_hash);
          setCheckHeadSha(sett.head_sha);
          setCheckDev(sett.dev);
        }
      }
    } catch (err) {
      console.error('Error loading bounty detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch head SHA from public GitHub API (CORS enabled)
  const fetchHeadShaFromGithub = async () => {
    setFetchingSha(true);
    setSubmitError('');
    try {
      const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
      if (!match) {
        throw new Error('Enter a valid GitHub pull request URL first.');
      }
      const [, owner, repo, pullNumber] = match;
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}.`);
      }
      const json = await res.json();
      if (json?.head?.sha) {
        setHeadSha(json.head.sha);
      } else {
        throw new Error('head.sha not found in GitHub PR response.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Could not fetch head SHA');
    } finally {
      setFetchingSha(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError('');
    setSubmitting(true);
    setElapsed(0);
    setStatusMsg(undefined);

    try {
      await submitWork(id, prUrl.trim(), headSha.trim(), (sec, msg) => {
        setElapsed(sec);
        if (msg) setStatusMsg(msg);
      });
      await loadAll();
    } catch (err: any) {
      setSubmitError(err?.message || 'Work submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionError('');
    setActionRunning(true);
    try {
      await cancelBounty(id);
      await loadAll();
    } catch (err: any) {
      setActionError(err?.message || 'Cancel failed');
    } finally {
      setActionRunning(false);
    }
  };

  const handleRefundExhausted = async () => {
    if (!id) return;
    setActionError('');
    setActionRunning(true);
    try {
      await refundExhausted(id);
      await loadAll();
    } catch (err: any) {
      setActionError(err?.message || 'Refund failed');
    } finally {
      setActionRunning(false);
    }
  };

  const handleCheckSettlement = async () => {
    setChecking(true);
    try {
      const res = await isSettledFor(
        checkBountyId.trim(),
        checkCriteriaHash.trim(),
        checkHeadSha.trim(),
        checkDev.trim()
      );
      setCheckResult(res);
    } catch (err) {
      console.error(err);
      setCheckResult(false);
    } finally {
      setChecking(false);
    }
  };

  const mutateOneChar = () => {
    if (checkHeadSha && checkHeadSha.length > 5) {
      const mutated =
        checkHeadSha[0] === '0'
          ? '1' + checkHeadSha.slice(1)
          : '0' + checkHeadSha.slice(1);
      setCheckHeadSha(mutated);
      setCheckResult(null);
    }
  };

  if (loading && !bounty) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading bounty ticket #{id}...</p>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>Bounty not found</p>
        <Link to="/app" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Bounties
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 0 60px 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Navigation Back */}
        <div style={{ marginBottom: '16px' }}>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to Manifest
          </Link>
        </div>

        {/* Bounty Overview Ticket */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="font-mono" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '18px' }}>
                #{bounty.id}
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 800 }}>{bounty.title}</h1>
            </div>
            <span className={`badge badge-${bounty.status.toLowerCase()}`}>
              {bounty.status}
            </span>
          </div>

          <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Repository: </span>
                <a
                  href={`https://github.com/${bounty.owner_repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono"
                  style={{ textDecoration: 'underline' }}
                >
                  {bounty.owner_repo}
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Creator: </span>
                <span className="font-mono">{bounty.creator.slice(0, 8)}...{bounty.creator.slice(-4)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Attempts: </span>
                <strong>{bounty.attempts}/3</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Reward: </span>
                <strong>{bounty.amount} Credits</strong>
              </div>
            </div>

            {/* Criteria */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Acceptance Criteria:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bounty.criteria.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      background: 'var(--bg-subtle)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: c.level === 'MUST' ? 'var(--primary-faint)' : 'var(--bg-card)',
                        color: c.level === 'MUST' ? 'var(--primary)' : 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {c.level}
                    </span>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Paths */}
            {bounty.required_paths.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Required Path Prefixes:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {bounty.required_paths.map((p, idx) => (
                    <span key={idx} className="font-mono" style={{ background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Actions */}
            {actionError && (
              <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{actionError}</div>
            )}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-dashed)' }}>
              {bounty.status === 'OPEN' && (
                <button onClick={handleCancel} disabled={actionRunning} className="btn btn-outline" style={{ color: 'var(--danger)', fontSize: '13px' }}>
                  Cancel Bounty (Refund Remaining)
                </button>
              )}
              {bounty.status === 'EXHAUSTED' && (
                <button onClick={handleRefundExhausted} disabled={actionRunning} className="btn btn-danger" style={{ fontSize: '13px' }}>
                  Claim Exhausted Refund
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settlement Panel (if SETTLED) */}
        {settlement && (
          <div className="ticket-card" style={{ marginBottom: '24px', border: '1px solid var(--success)' }}>
            <div className="ticket-header" style={{ background: 'var(--success-faint)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--success)' }}>
                <ShieldCheck size={18} />
                <span>Bounty Settled: {settlement.verdict}</span>
              </div>
              <VerdictStamp verdict={settlement.verdict} size="sm" />
            </div>

            <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '14px' }}>
                <div>Developer Paid: <strong>{settlement.dev_amount} Credits</strong></div>
                <div>Creator Retained: <strong>{settlement.creator_amount} Credits</strong></div>
              </div>

              {/* Settlement Check Tool */}
              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '6px', border: '1px dashed var(--border-dashed)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong>Settlement check (is_settled_for)</strong>
                  <button onClick={mutateOneChar} className="btn btn-secondary" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    <Sparkles size={12} /> Mutate 1 Char
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    className="input font-mono"
                    style={{ fontSize: '12px' }}
                    value={checkCriteriaHash}
                    onChange={(e) => setCheckCriteriaHash(e.target.value)}
                    placeholder="Criteria Hash"
                  />
                  <input
                    type="text"
                    className="input font-mono"
                    style={{ fontSize: '12px' }}
                    value={checkHeadSha}
                    onChange={(e) => setCheckHeadSha(e.target.value)}
                    placeholder="Head SHA"
                  />
                  <input
                    type="text"
                    className="input font-mono"
                    style={{ fontSize: '12px' }}
                    value={checkDev}
                    onChange={(e) => setCheckDev(e.target.value)}
                    placeholder="Developer Address"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={handleCheckSettlement} disabled={checking} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                    Verify Settlement On-Chain
                  </button>
                  {checkResult !== null && (
                    <span
                      className="font-mono"
                      style={{
                        fontWeight: 800,
                        fontSize: '14px',
                        color: checkResult ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {checkResult ? '✓ VERIFIED: TRUE' : '✗ MISMATCH: FALSE'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Section */}
        <div className="ticket-card" style={{ marginBottom: '24px' }}>
          <div className="ticket-header">
            <span style={{ fontWeight: 700 }}>Submission Records ({submissions.length})</span>
            <button
              onClick={loadAll}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              aria-label="Refresh submissions list"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="ticket-body">
            {submissions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No submissions evaluated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '16px',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="font-mono" style={{ fontWeight: 800 }}>Attempt #{sub.attempt}</span>
                        <a
                          href={sub.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', textDecoration: 'underline' }}
                        >
                          PR #{sub.pr_number} <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Dev: {sub.dev.slice(0, 8)}... | Head: {sub.head_sha.slice(0, 8)}...
                      </div>
                      {sub.gate && (
                        <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px' }}>
                          Hard Gate: <strong>{sub.gate}</strong>
                        </div>
                      )}
                    </div>

                    <VerdictStamp verdict={sub.verdict} size="md" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Work Form (when OPEN and attempts < 3) */}
        {bounty.status === 'OPEN' && parseInt(bounty.attempts, 10) < 3 && (
          <div className="ticket-card">
            <div className="ticket-header">
              <span style={{ fontWeight: 700 }}>Submit Pull Request Work</span>
              <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Attempt {parseInt(bounty.attempts, 10) + 1} of 3
              </span>
            </div>

            <form onSubmit={handleSubmitWork} className="ticket-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {submitError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'var(--danger-faint)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    fontSize: '13px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Pull Request URL
                </label>
                <input
                  type="url"
                  className="input font-mono"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/123"
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>
                    Commit Head SHA (40 hex chars)
                  </label>
                  <button
                    type="button"
                    onClick={fetchHeadShaFromGithub}
                    disabled={fetchingSha}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <GitPullRequest size={12} />
                    {fetchingSha ? 'Fetching...' : 'Get head sha from GitHub'}
                  </button>
                </div>
                <input
                  type="text"
                  className="input font-mono"
                  value={headSha}
                  onChange={(e) => setHeadSha(e.target.value)}
                  placeholder="40-character hex commit sha"
                  maxLength={40}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                {submitting ? (
                  <StopwatchTimer seconds={elapsed} statusMessage={statusMsg} />
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                    Evaluation round takes ~15 - 45s on Studionet
                  </span>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {submitting ? 'Evaluating with Validators...' : 'Submit Work for Consensus'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
