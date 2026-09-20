import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { BarChart3, TrendingUp, Boxes } from 'lucide-react';

import { DEMO_MANAGER_SALES } from '../../utils/demoData';

const ManagerStoreAnalysisPage = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId || user?.storeId || 1;
  const storeCode = user?.assignedStoreCode || user?.storeCode || 'S001';
  const storeName = user?.assignedStoreName || user?.storeName || 'Annam Anna Nagar';

  const [salesHistory, setSalesHistory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const [salesRes, invHistoryRes] = await Promise.all([
          axiosClient.get(`/stores/${storeId}/sales/history`),
          axiosClient.get(`/stores/${storeId}/inventory/history`),
        ]);

        setSalesHistory(Array.isArray(salesRes) ? salesRes : DEMO_MANAGER_SALES);
        setInventoryHistory(Array.isArray(invHistoryRes) ? invHistoryRes : []);
      } catch (err) {
        console.warn('Backend API unavailable, loading demo store analysis...', err);
        setSalesHistory(DEMO_MANAGER_SALES);
        setInventoryHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [storeId]);

  const salesColumns = [
    { header: 'Sale Date', accessor: (row) => row.saleDate },
    { header: 'Total Units Sold', accessor: (row) => row.totalItemsSold.toLocaleString(), align: 'right' },
    { header: 'Total Revenue', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--status-success)' }}>{formatCurrency(row.totalAmount)}</span>, align: 'right' },
    { header: 'Submitted By', accessor: (row) => row.submittedByName },
  ];

  const inventoryColumns = [
    { header: 'Update Date', accessor: (row) => row.updateDate },
    { header: 'Material Name', accessor: (row) => row.materialName },
    { header: 'Opening Stock', accessor: (row) => formatQuantity(row.openingStock, row.unitOfMeasure), align: 'right' },
    { header: 'Received', accessor: (row) => formatQuantity(row.receivedQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Used Qty', accessor: (row) => formatQuantity(row.usedQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Remaining Stock', accessor: (row) => formatQuantity(row.remainingStock, row.unitOfMeasure), align: 'right' },
    { header: 'Remarks', accessor: (row) => row.remarks || 'N/A' },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Store Performance Analysis...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {storeCode} — {storeName} Performance History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Historical daily sales submissions and raw material usage logs for your branch
        </p>
      </div>

      {/* Sales History Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Branch Daily Sales History</h3>
        <DataTable columns={salesColumns} data={salesHistory} searchPlaceholder="Search sales history..." />
      </div>

      {/* Material Usage History Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Raw Material Daily Usage History</h3>
        <DataTable columns={inventoryColumns} data={inventoryHistory} searchPlaceholder="Search material logs..." />
      </div>
    </div>
  );
};

export default ManagerStoreAnalysisPage;
