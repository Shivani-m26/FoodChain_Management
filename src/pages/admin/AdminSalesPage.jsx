import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import { formatCurrency } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExporter';
import { TrendingUp, Calendar, Store, Download } from 'lucide-react';

import { DEMO_ADMIN_SALES, DEMO_ITEM_RANKINGS } from '../../utils/demoData';

const AdminSalesPage = () => {
  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState([]);
  const [itemRankings, setItemRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      const [salesRes, rankRes] = await Promise.all([
        axiosClient.get('/admin/sales', { params: { date: salesDate } }),
        axiosClient.get('/admin/analytics/item-sales-ranking', { params: { endDate: salesDate } }),
      ]);
      setSales(Array.isArray(salesRes) ? salesRes : DEMO_ADMIN_SALES);
      setItemRankings(Array.isArray(rankRes) ? rankRes : DEMO_ITEM_RANKINGS);
    } catch (err) {
      console.warn('Backend API unavailable, loading demo sales data...', err);
      setSales(DEMO_ADMIN_SALES);
      setItemRankings(DEMO_ITEM_RANKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [salesDate]);

  const handleExportSalesCSV = () => {
    const headers = ['Store Code', 'Store Name', 'Sale Date', 'Total Units Sold', 'Total Revenue (₹)', 'Submitted By'];
    const rows = sales.map((row) => [
      row.storeCode,
      row.storeName,
      row.saleDate,
      row.totalItemsSold,
      row.totalAmount,
      row.submittedByName,
    ]);
    downloadCSV(`chain_daily_sales_${salesDate}.csv`, headers, rows);
  };

  const handleExportRankingsCSV = () => {
    const headers = ['Rank', 'Item Code', 'Item Name', 'Category', 'Units Sold', 'Unit Price (₹)', 'Revenue (₹)'];
    const rows = itemRankings.map((row) => [
      `#${row.rank}`,
      row.itemCode,
      row.itemName,
      row.category,
      row.unitsSold,
      row.unitPrice,
      row.revenue,
    ]);
    downloadCSV(`item_sales_rankings_${salesDate}.csv`, headers, rows);
  };

  const salesColumns = [
    { header: 'Store Code', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.storeCode}</span> },
    { header: 'Store Name', accessor: (row) => row.storeName },
    { header: 'Sale Date', accessor: (row) => row.saleDate },
    { header: 'Total Units Sold', accessor: (row) => row.totalItemsSold.toLocaleString(), align: 'right' },
    { header: 'Total Revenue', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--status-success)' }}>{formatCurrency(row.totalAmount)}</span>, align: 'right' },
    { header: 'Submitted By', accessor: (row) => row.submittedByName },
  ];

  const rankingColumns = [
    { header: 'Rank', accessor: (row) => `#${row.rank}`, align: 'center' },
    { header: 'Menu Item Name', accessor: (row) => row.itemName },
    { header: 'Category', accessor: (row) => <span className="badge badge-info">{row.category}</span> },
    { header: 'Units Sold', accessor: (row) => row.unitsSold.toLocaleString(), align: 'right' },
    { header: 'Unit Price', accessor: (row) => formatCurrency(row.unitPrice), align: 'right' },
    { header: 'Revenue Generated', accessor: (row) => <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{formatCurrency(row.revenue)}</span>, align: 'right' },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Sales Analysis...</div>;
  }

  const totalDailyChainRevenue = sales.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const totalDailyChainUnits = sales.reduce((acc, curr) => acc + Number(curr.totalItemsSold || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chain Sales Analysis</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Itemized daily sales reporting and product rankings across all branches
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label" style={{ margin: 0 }}>Select Date:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '180px' }}
            value={salesDate}
            onChange={(e) => setSalesDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleExportSalesCSV}>
            <Download size={16} />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chain Total Daily Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }}>
            {formatCurrency(totalDailyChainRevenue)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Units Sold Today</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '4px' }}>
            {totalDailyChainUnits.toLocaleString()} Pcs
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reporting Branches</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {sales.length} Stores
          </div>
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Store Daily Sales Submissions ({salesDate})</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleExportSalesCSV}>
            <Download size={14} />
            <span>CSV</span>
          </button>
        </div>
        <DataTable columns={salesColumns} data={sales} searchPlaceholder="Search store code, name, manager..." />
      </div>

      {/* Item Rankings */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Chain Top Selling Items Ranking (Units Sold Descending)</h3>
          <button className="btn btn-secondary btn-sm" onClick={handleExportRankingsCSV}>
            <Download size={14} />
            <span>Export Product Rankings CSV</span>
          </button>
        </div>
        <DataTable columns={rankingColumns} data={itemRankings} searchPlaceholder="Search menu items..." />
      </div>
    </div>
  );
};

export default AdminSalesPage;
