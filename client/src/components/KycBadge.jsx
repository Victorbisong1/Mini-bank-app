import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function KycBadge({ tier = 1, onUpgrade }) {
  const tierConfig = {
    1: { limit: 50000, label: 'Tier 1', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
    2: { limit: 200000, label: 'Tier 2', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
    3: { limit: 5000000, label: 'Tier 3', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  };

  const config = tierConfig[tier] || tierConfig[1];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 'var(--radius-md)',
      background: config.bg,
      border: `1px solid ${config.border}`,
      fontSize: '0.8125rem'
    }}>
      <ShieldCheck size={16} color={config.color} />
      <span style={{ color: config.color, fontWeight: 600 }}>
        {config.label}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        (Max ₦{config.limit.toLocaleString()}/day)
      </span>
      {tier < 3 && (
        <button 
          type="button"
          onClick={onUpgrade}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginLeft: 4
          }}
        >
          Upgrade <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  );
}