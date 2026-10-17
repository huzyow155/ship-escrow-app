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
        gap: '10px',
        padding: '8px 14px',
        borderRadius: '6px',
        background: 'var(--bg-card-header)',
        border: '1px solid var(--border)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Clock size={16} style={{ color: 'var(--stamp-ochre)' }} />
        {/* Indeterminate pulse indicator */}
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--stamp-ochre)',
            animation: 'pulseDot 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
      `}</style>

      <span style={{ fontWeight: 600 }}>{seconds}s elapsed</span>

      {statusMessage && (
        <span style={{ color: 'var(--stamp-ochre)', fontWeight: 600 }}>
          ({statusMessage})
        </span>
      )}

      {seconds > 60 && !statusMessage && (
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          • validators are still working
        </span>
      )}
    </div>
  );
};
