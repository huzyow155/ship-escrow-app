import React from 'react';
import { BountyVerdict } from '../lib/decide';

interface Props {
  verdict: BountyVerdict | string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictStamp: React.FC<Props> = ({ verdict, size = 'md' }) => {
  if (!verdict) return null;

  let label = verdict;
  let styleClass = 'stamp-review';

  switch (verdict) {
    case 'RELEASE_100':
      label = 'RELEASED 100%';
      styleClass = 'stamp-release-100';
      break;
    case 'RELEASE_75':
      label = 'RELEASED 75%';
      styleClass = 'stamp-release-75';
      break;
    case 'RELEASE_50':
      label = 'RELEASED 50%';
      styleClass = 'stamp-release-50';
      break;
    case 'RELEASE_25':
      label = 'RELEASED 25%';
      styleClass = 'stamp-release-25';
      break;
    case 'REFUND':
      label = 'REFUNDED';
      styleClass = 'stamp-refund';
      break;
    case 'REVIEW':
      label = 'MANUAL REVIEW';
      styleClass = 'stamp-review';
      break;
  }

  const fontSize = size === 'lg' ? '18px' : size === 'sm' ? '11px' : '14px';
  const padding = size === 'lg' ? '10px 20px' : size === 'sm' ? '4px 8px' : '6px 14px';

  return (
    <div
      className={`stamp-seal ${styleClass}`}
      style={{ fontSize, padding }}
      role="status"
      aria-label={`Verdict: ${label}`}
    >
      <span>{label}</span>
    </div>
  );
};
