import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const WeeklyProfitChart = ({ matrixData }) => {
  if (!matrixData || matrixData.length === 0) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-statement)', fontWeight: 800, marginBottom: '18px' }}>
        Weekly Profit Analysis Matrix (Mon — Sun)
      </h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Store</th>
              {days.map((day) => (
                <th key={day} style={{ textAlign: 'right' }}>{day}</th>
              ))}
              <th style={{ textAlign: 'right', color: '#2563eb' }}>Weekly Total</th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row) => (
              <tr key={row.storeId}>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-statement)' }}>
                  <div style={{ color: '#2563eb' }}>{row.storeCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.storeName}</div>
                </td>
                {days.map((day) => {
                  const profit = row.dailyProfitMap?.[day] || 0;
                  const isPositive = profit >= 0;
                  return (
                    <td key={day} style={{ textAlign: 'right', fontWeight: 600, color: isPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {formatCurrency(profit)}
                    </td>
                  );
                })}
                <td style={{ textAlign: 'right', fontWeight: 900, color: '#2563eb', fontSize: '0.95rem', fontFamily: 'var(--font-statement)' }}>
                  {formatCurrency(row.weeklyTotalProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyProfitChart;
