import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import BarChartCard from '../../components/charts/BarChartCard';
import WeeklyProfitChart from '../../components/charts/WeeklyProfitChart';
import { formatCurrency } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExporter';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';

import { DEMO_STORES } from '../../utils/demoData';

const ProfitAnalysisPage = () => {
  const [comparisons, setComparisons] = useState([]);
  const [avgDailySales, setAvgDailySales] = useState([]);
  const [weeklyMatrix, setWeeklyMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitData = async () => {
      const demoComparisons = DEMO_STORES.map((s, idx) => {
        const rev = 250000 + (idx * 18500);
        const cogs = Math.round(rev * 0.4);
        const exp = Math.round(rev * 0.2);
        const net = rev - cogs - exp;
        return {
          storeCode: s.storeCode,
          storeName: s.name,
          location: s.location,
          totalRevenue: rev,
          averageDailyRevenue: Math.round(rev / 30),
          cogs: cogs,
          operatingExpenses: exp,
          grossProfit: rev - cogs,
          netProfit: net,
          profitMarginPercentage: 40.0,
          growthPercentage: 5.5 + idx
        };
      });

      const demoAvgSales = DEMO_STORES.map((s, idx) => ({
        storeCode: s.storeCode,
        storeName: s.name,
        averageDailySales: 12000 + (idx * 850)
      }));

      const demoWeekly = DEMO_STORES.slice(0, 7).map((s, idx) => ({
        storeCode: s.storeCode,
        storeName: s.name,
        weeks: [
          { weekLabel: 'Week 1', netProfit: 45000 + (idx * 2000) },
          { weekLabel: 'Week 2', netProfit: 48000 + (idx * 2100) },
          { weekLabel: 'Week 3', netProfit: 52000 + (idx * 1900) },
          { weekLabel: 'Week 4', netProfit: 55000 + (idx * 2300) }
        ]
      }));

      try {
        const [compRes, avgRes, weekRes] = await Promise.all([
          axiosClient.get('/admin/analytics/store-comparison'),
          axiosClient.get('/admin/analytics/average-daily-sales'),
          axiosClient.get('/admin/analytics/weekly-profit'),
        ]);

        setComparisons(Array.isArray(compRes) ? compRes : demoComparisons);
        setAvgDailySales(Array.isArray(avgRes) ? avgRes : demoAvgSales);
        setWeeklyMatrix(Array.isArray(weekRes) ? weekRes : demoWeekly);
      } catch (err) {
        console.warn('Backend API unavailable, loading demo financial profit analytics...', err);
        setComparisons(demoComparisons);
        setAvgDailySales(demoAvgSales);
        setWeeklyMatrix(demoWeekly);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, []);

  const handleExportCSV = () => {
    const headers = [
      'Store Code',
      'Store Name',
      'Location',
      'Total Revenue (₹)',
      'Avg Daily Revenue (₹)',
      'COGS Materials (₹)',
      'Operating Expenses (₹)',
      'Gross Profit (₹)',
      'Net Profit (₹)',
      'Margin %',
      'Growth %',
    ];

    const rows = comparisons.map((row) => [
      row.storeCode,
      row.storeName,
      row.location,
      row.totalRevenue,
      row.averageDailyRevenue,
      row.cogs,
      row.operatingExpenses,
      row.grossProfit,
      row.netProfit,
      `${row.profitMarginPercentage}%`,
      `${row.growthPercentage}%`,
    ]);

    downloadCSV(`store_profit_comparison_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const comparisonColumns = [
    { header: 'Store Code', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.storeCode}</span> },
    { header: 'Store Name', accessor: (row) => row.storeName },
    { header: 'Location', accessor: (row) => row.location },
    { header: 'Total Revenue', accessor: (row) => formatCurrency(row.totalRevenue), align: 'right' },
    { header: 'Avg Daily Sales', accessor: (row) => formatCurrency(row.averageDailyRevenue), align: 'right' },
    { header: 'COGS (Materials)', accessor: (row) => formatCurrency(row.cogs), align: 'right' },
    { header: 'Store Expenses', accessor: (row) => formatCurrency(row.operatingExpenses), align: 'right' },
    { header: 'Gross Profit', accessor: (row) => <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>{formatCurrency(row.grossProfit)}</span>, align: 'right' },
    { header: 'Net Profit', accessor: (row) => <span style={{ fontWeight: 800, color: Number(row.netProfit) >= 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>{formatCurrency(row.netProfit)}</span>, align: 'right' },
    { header: 'Margin %', accessor: (row) => `${row.profitMarginPercentage}%`, align: 'right' },
    {
      header: 'Growth %',
      accessor: (row) => (
        <span className={`badge ${Number(row.growthPercentage) >= 0 ? 'badge-success' : 'badge-danger'}`}>
          {Number(row.growthPercentage) >= 0 ? `+${row.growthPercentage}%` : `${row.growthPercentage}%`}
        </span>
      ),
      align: 'right',
    },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Financial Profit Model...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Financial Profit & Performance Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Multi-branch profit model: Revenue - COGS (Raw Materials) - Operating Expenses = Net Profit
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export Financial Report CSV</span>
        </button>
      </div>

      {/* Average Daily Sales Bar Chart */}
      <BarChartCard
        title="Average Daily Sales by Branch Store (averageDailySales = Total Revenue / Trading Days)"
        data={avgDailySales}
        dataKey="averageDailySales"
        labelKey="storeCode"
        nameKey="storeName"
        color="#2563eb"
      />

      {/* Weekly Profit Matrix */}
      <WeeklyProfitChart matrixData={weeklyMatrix} />

      {/* Comprehensive Store Financial Comparison Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Detailed Store Financial Comparison & Profit Margins</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            <span>CSV</span>
          </button>
        </div>
        <DataTable columns={comparisonColumns} data={comparisons} searchPlaceholder="Search store comparisons..." />
      </div>
    </div>
  );
};

export default ProfitAnalysisPage;
