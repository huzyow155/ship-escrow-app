import React from 'react';
import { Settlement } from '../types';

interface Props {
  settlement: Settlement;
}

export const PayoutSplitBar: React.FC<Props> = ({ settlement }) => {
  const devUnits = parseInt(settlement.dev_amount || settlement.final_payout_amount || '0', 10) || 0;
  const creatorUnits = parseInt(settlement.creator_amount || settlement.refund_amount || '0', 10) || 0;
  const total = devUnits + creatorUnits;

  const devPct = total > 0 ? Math.round((devUnits / total) * 100) : 0;
  const creatorPct = total > 0 ? 100 - devPct : 0;

  return (
    <div style={{ marginTop: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          marginBottom: '6px',
        }}
      >
        <span style={{ color: 'var(--stamp-green)' }}>
          Developer Payout: <strong>{devUnits} Credits</strong> ({devPct}%)
        </span>
        <span style={{ color: creatorUnits > 0 ? 'var(--stamp-ochre)' : 'var(--text-muted)' }}>
          Creator Return: <strong>{creatorUnits} Credits</strong> ({creatorPct}%)
        </span>
      </div>

      <div className="payout-split-bar" role="progressbar" aria-label={`Payout split: ${devPct}% to developer, ${creatorPct}% returned to creator`}>
        <div
          className="payout-split-segment"
          style={{
            width: `${devPct}%`,
            background: 'var(--stamp-green)',
          }}
          title={`Dev payout: ${devUnits} credits`}
        />
        <div
          className="payout-split-segment"
          style={{
            width: `${creatorPct}%`,
            background: creatorUnits > 0 ? 'var(--stamp-ochre)' : 'var(--border)',
          }}
          title={`Creator return: ${creatorUnits} credits`}
        />
      </div>
    </div>
  );
};
