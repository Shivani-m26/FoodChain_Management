import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import {
  Store,
  TrendingUp,
  DollarSign,
  PieChart,
  FileText,
  AlertTriangle,
  Award,
  ArrowRight,
  CalendarOff,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [itemRankings, setItemRankings] = useState([]);
  const [pendingClosures, setPendingClosures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [selectedClosure, setSelectedClosure] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, revRes, rankRes, closureRes] = await Promise.all([
        axiosClient.get('/admin/analytics/dashboard-kpis'),
        axiosClient.get('/admin/analytics/revenue-by-store'),
        axiosClient.get('/admin/analytics/item-sales-ranking'),
        axiosClient.get('/admin/closure-requests/pending'),
      ]);

      setKpis(kpiRes);
      setRevenueData(revRes);
      setItemRankings(rankRes);
      setPendingClosures(closureRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReviewClosure = async (e) => {
    e.preventDefault();
    if (!selectedClosure) return;
    try {
      await axiosClient.put(`/admin/closure-requests/${selectedClosure.id}/review`, {
        status: reviewStatus,
        adminRemarks: reviewRemarks,
      });
      setIsReviewModalOpen(false);
      setSelectedClosure(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to review store closure request');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Executive Dashboard...</div>;
  }

  const rankingColumns = [
    { header: 'Rank', accessor: (row) => `#${row.rank}`, align: 'center' },
    { header: 'Item Name', accessor: (row) => row.itemName },
    { header: 'Category', accessor: (row) => row.category },
    { header: 'Units Sold', accessor: (row) => row.unitsSold.toLocaleString(), align: 'right' },
    { header: 'Unit Price', accessor: (row) => formatCurrency(row.unitPrice), align: 'right' },
    { header: 'Revenue Generated', accessor: (row) => formatCurrency(row.revenue), align: 'right' },
  ];

  const closureColumns = [
    { header: 'Store', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.storeCode} — {row.storeName}</span> },
    { header: 'Target Closure Date', accessor: (row) => <span style={{ fontWeight: 700 }}>{row.closureDate}</span> },
    { header: 'Reason given', accessor: (row) => row.reason },
    { header: 'Requested By', accessor: (row) => row.requestedByName },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedClosure(row);
            setReviewStatus('APPROVED');
            setReviewRemarks('');
            setIsReviewModalOpen(true);
          }}
        >
          <span>Review Request</span>
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chain Executive Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time financial, operational, and inventory performance across all 15 branches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/distribution" className="btn btn-secondary btn-sm">
            <FileText size={16} />
            <span>Pending Material Requests ({kpis?.pendingChangeRequests || 0})</span>
          </Link>
          <Link to="/admin/profit" className="btn btn-primary btn-sm">
            <TrendingUp size={16} />
            <span>Full Financial Report</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Active Fleet Stores Today"
          value={`${kpis?.activeStores || 0} / ${kpis?.totalStores || 0}`}
          subtitle={kpis?.closedStoresTodayCount > 0 ? `${kpis.closedStoresTodayCount} store(s) closed today (${kpis.closedStoresTodayNames?.join(', ')})` : 'All stores operational today'}
          icon={Store}
          color={kpis?.closedStoresTodayCount > 0 ? 'gold' : 'blue'}
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(kpis?.todayRevenue)}
          subtitle="Sum of all daily store sales"
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          title="Raw Material Cost (COGS)"
          value={formatCurrency(kpis?.todayMaterialCost)}
          subtitle="Derived from daily usage x material price"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Today's Net Profit"
          value={formatCurrency(kpis?.todayNetProfit)}
          subtitle="Revenue - COGS - Store Expenses"
          icon={PieChart}
          color={Number(kpis?.todayNetProfit || 0) >= 0 ? 'teal' : 'danger'}
        />
      </div>

      {/* Pending Store Closure Requests Review Banner */}
      {pendingClosures.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CalendarOff size={22} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Pending Store Day Closure Requests ({pendingClosures.length})</h3>
          </div>
          <DataTable columns={closureColumns} data={pendingClosures} emptyMessage="No pending closure requests" />
        </div>
      )}

      {/* Secondary Alerts & Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--status-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '12px' }}>
            <AlertTriangle size={24} color="var(--status-warning)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>LOW STOCK ALERTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{kpis?.lowStockAlertsCount || 0} Materials Below Threshold</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '12px', borderRadius: '12px' }}>
            <Award size={24} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TOP REVENUE BRANCH TODAY</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              {kpis?.highestRevenueStoreName || 'N/A'} ({formatCurrency(kpis?.highestRevenueAmount)})
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Distribution Chart */}
      <BarChartCard
        title="Today's Branch Revenue Breakdown"
        data={revenueData}
        dataKey="revenue"
        labelKey="storeCode"
        nameKey="storeName"
        color="#2563eb"
      />

      {/* Top Menu Item Rankings */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Chain Top Selling Menu Items</h3>
          <Link to="/admin/sales" style={{ fontSize: '0.825rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 700 }}>
            <span>View Full Sales Report</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <DataTable columns={rankingColumns} data={itemRankings.slice(0, 5)} searchPlaceholder="Search menu items..." />
      </div>

      {/* Review Closure Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Review Closure Request: ${selectedClosure?.storeCode} on ${selectedClosure?.closureDate}`}>
        <form onSubmit={handleReviewClosure}>
          <div style={{ marginBottom: '18px', background: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <div><strong>Branch Store:</strong> {selectedClosure?.storeName} ({selectedClosure?.storeCode})</div>
            <div><strong>Closure Date:</strong> {selectedClosure?.closureDate}</div>
            <div><strong>Reason for Closure:</strong> {selectedClosure?.reason}</div>
            <div><strong>Requested By:</strong> {selectedClosure?.requestedByName}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Decision</label>
            <select
              className="form-select"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
            >
              <option value="APPROVED">APPROVE CLOSURE REQUEST</option>
              <option value="REJECTED">REJECT CLOSURE REQUEST</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Admin Remarks / Instructions</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Approved for scheduled maintenance"
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Decision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
