import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    teal: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    gold: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    danger: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span
          style={{
            fontSize: '0.775rem',
            fontFamily: 'var(--font-statement)',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              background: currentTheme.bg,
              border: `1px solid ${currentTheme.border}`,
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
          >
            <Icon size={20} color={currentTheme.text} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: '1.9rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginBottom: '4px',
          fontFamily: 'var(--font-statement)',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
