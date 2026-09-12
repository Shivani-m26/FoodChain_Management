import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const BarChartCard = ({ title, data, dataKey = 'revenue', labelKey = 'storeCode', nameKey = 'storeName', color = '#2563eb' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((item) => Number(item[dataKey] || 0)), 1);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-statement)', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>{title}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.map((item, idx) => {
          const val = Number(item[dataKey] || 0);
          const percentage = Math.min(Math.max((val / maxValue) * 100, 4), 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 700, fontFamily: 'var(--font-statement)' }}>
                <span style={{ color: 'var(--text-primary)' }}>{item[labelKey]} — {item[nameKey]}</span>
                <span style={{ color: color, fontWeight: 800 }}>{formatCurrency(val)}</span>
              </div>

              <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, #1d4ed8)`,
                    borderRadius: '5px',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChartCard;
