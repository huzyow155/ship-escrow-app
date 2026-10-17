import React from 'react';
import { BountyVerdict } from '../lib/decide';
import { CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface Props {
  verdict: BountyVerdict | string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictStamp: React.FC<Props> = ({ verdict, size = 'md' }) => {
  if (!verdict) return null;

  let label = verdict;
  let styleClass = 'stamp-review';
  let icon = <HelpCircle size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;

  switch (verdict) {
    case 'RELEASE_100':
      label = 'RELEASED 100%';
      styleClass = 'stamp-release-100';
      icon = <CheckCircle2 size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
    case 'RELEASE_75':
      label = 'RELEASED 75%';
      styleClass = 'stamp-release-75';
      icon = <CheckCircle2 size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
    case 'RELEASE_50':
      label = 'RELEASED 50%';
      styleClass = 'stamp-release-50';
      icon = <CheckCircle2 size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
    case 'RELEASE_25':
      label = 'RELEASED 25%';
      styleClass = 'stamp-release-25';
      icon = <CheckCircle2 size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
    case 'REFUND':
      label = 'REFUNDED';
      styleClass = 'stamp-refund';
      icon = <AlertOctagon size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
    case 'REVIEW':
      label = 'MANUAL REVIEW';
      styleClass = 'stamp-review';
      icon = <HelpCircle size={size === 'lg' ? 18 : size === 'sm' ? 12 : 14} />;
      break;
  }

  const fontSize = size === 'lg' ? '16px' : size === 'sm' ? '11px' : '13px';
  const padding = size === 'lg' ? '8px 16px' : size === 'sm' ? '3px 7px' : '6px 12px';

  return (
    <div
      className={`stamp-seal ${styleClass}`}
      style={{ fontSize, padding }}
      role="status"
      aria-label={`Verdict: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};
