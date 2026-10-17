import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  seconds: number;
  statusMessage?: string;
}

export const StopwatchTimer: React.FC<Props> = ({ seconds, statusMessage }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        fontSize: '13px',
        fontFamily: 'var(--mono)',
      }}
    >
      <Clock size={16} className="text-primary" />
      <span>{seconds}s elapsed</span>
      {statusMessage && (
        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
          ({statusMessage})
        </span>
      )}
    </div>
  );
};
