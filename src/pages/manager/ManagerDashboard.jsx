import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { Store, Boxes, TrendingUp, AlertTriangle, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DEMO_MANAGER_INVENTORY, DEMO_MANAGER_SALES } from '../../utils/demoData';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId || user?.storeId || 1;
  const storeCode = user?.assignedStoreCode || user?.storeCode || 'S001';
  const storeName = user?.assignedStoreName || user?.storeName || 'Annam Anna Nagar';

  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerDashboard = async () => {
      try {
        const [invRes, salesRes] = await Promise.all([
          axiosClient.get(`/stores/${storeId}/inventory`),
          axiosClient.get(`/stores/${storeId}/sales/history`),
        ]);

        setInventory(Array.isArray(invRes) ? invRes : DEMO_MANAGER_INVENTORY);
        setSalesHistory(Array.isArray(salesRes) ? salesRes : DEMO_MANAGER_SALES);
      } catch (err) {
        console.warn('Backend API unavailable, loading demo manager dashboard data...', err);
        setInventory(DEMO_MANAGER_INVENTORY);
        setSalesHistory(DEMO_MANAGER_SALES);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerDashboard();
  }, [storeId]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Branch Manager Dashboard...</div>;
  }

  const todaySale = salesHistory.length > 0 ? salesHistory[0] : null;
  const lowStockCount = inventory.filter((i) => i.isLowStock).length;

  const stockColumns = [
    { header: 'Material Code', accessor: (row) => row.materialCode },
    { header: 'Material Name', accessor: (row) => row.materialName },
    { header: 'Current Stock', accessor: (row) => formatQuantity(row.currentStock, row.unitOfMeasure), align: 'right' },
    { header: 'Reorder Threshold', accessor: (row) => formatQuantity(row.reorderThreshold, row.unitOfMeasure), align: 'right' },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge ${row.isLowStock ? 'badge-danger' : 'badge-success'}`}>
          {row.isLowStock ? 'Low Stock Alert' : 'In Stock'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {storeCode} — {storeName} Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Store operational dashboard: Manage daily raw material usage and itemized sales entries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/manager/inventory" className="btn btn-secondary btn-sm">
            <PlusCircle size={16} />
            <span>Update Daily Inventory</span>
          </Link>
          <Link to="/manager/sales" className="btn btn-primary btn-sm">
            <TrendingUp size={16} />
            <span>Record Daily Sales</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Assigned Branch"
          value={storeCode}
          subtitle={storeName}
          icon={Store}
          color="gold"
        />

        <StatCard
          title="Today's Sales Revenue"
          value={formatCurrency(todaySale?.totalAmount || 0)}
          subtitle={`${todaySale?.totalItemsSold || 0} items sold today`}
          icon={TrendingUp}
          color="teal"
        />

        <StatCard
          title="Stock Materials Tracked"
          value={`${inventory.length} Items`}
          subtitle={`${lowStockCount} items below threshold`}
          icon={Boxes}
          color={lowStockCount > 0 ? 'danger' : 'purple'}
        />
      </div>

      {lowStockCount > 0 && (
        <div style={{ background: 'var(--status-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--status-danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={22} />
            <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
              Warning: {lowStockCount} raw material(s) are currently below the low-stock reorder threshold!
            </span>
          </div>
          <Link to="/manager/change-requests" className="btn btn-danger btn-sm">
            Request Additional Stock
          </Link>
        </div>
      )}

      {/* Current Stock Snapshot */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Current Branch Material Stock Snapshot</h3>
          <Link to="/manager/inventory" style={{ fontSize: '0.825rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 700 }}>
            <span>Submit Daily Log</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <DataTable columns={stockColumns} data={inventory} searchPlaceholder="Search materials..." />
      </div>
    </div>
  );
};

export default ManagerDashboard;
