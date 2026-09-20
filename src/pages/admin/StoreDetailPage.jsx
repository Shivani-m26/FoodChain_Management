import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { Store, ArrowLeft, User, MapPin, Phone } from 'lucide-react';

import { DEMO_STORES, DEMO_MANAGER_INVENTORY, DEMO_MANAGER_SALES } from '../../utils/demoData';

const StoreDetailPage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreDetail = async () => {
      const demoStore = DEMO_STORES.find(s => s.id === Number(id)) || DEMO_STORES[0];

      try {
        const [storeRes, invRes, salesRes] = await Promise.all([
          axiosClient.get(`/stores/${id}`),
          axiosClient.get(`/stores/${id}/inventory`),
          axiosClient.get(`/stores/${id}/sales/history`),
        ]);

        setStore(storeRes && typeof storeRes === 'object' ? storeRes : demoStore);
        setInventory(Array.isArray(invRes) ? invRes : DEMO_MANAGER_INVENTORY);
        setSales(Array.isArray(salesRes) ? salesRes : DEMO_MANAGER_SALES);
      } catch (err) {
        console.warn('Backend API unavailable, loading demo store detail...', err);
        setStore(demoStore);
        setInventory(DEMO_MANAGER_INVENTORY);
        setSales(DEMO_MANAGER_SALES);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetail();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Store Details...</div>;
  }

  const inventoryColumns = [
    { header: 'Material Code', accessor: (row) => row.materialCode },
    { header: 'Material Name', accessor: (row) => row.materialName },
    { header: 'Unit of Measure', accessor: (row) => row.unitOfMeasure },
    { header: 'Current Stock', accessor: (row) => formatQuantity(row.currentStock, row.unitOfMeasure), align: 'right' },
    { header: 'Reorder Threshold', accessor: (row) => formatQuantity(row.reorderThreshold, row.unitOfMeasure), align: 'right' },
    {
      header: 'Stock Status',
      accessor: (row) => (
        <span className={`badge ${row.isLowStock ? 'badge-danger' : 'badge-success'}`}>
          {row.isLowStock ? 'Low Stock' : 'Optimal'}
        </span>
      ),
    },
  ];

  const salesColumns = [
    { header: 'Sale Date', accessor: (row) => row.saleDate },
    { header: 'Total Units Sold', accessor: (row) => row.totalItemsSold.toLocaleString(), align: 'right' },
    { header: 'Total Revenue', accessor: (row) => formatCurrency(row.totalAmount), align: 'right' },
    { header: 'Submitted By', accessor: (row) => row.submittedByName },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/admin/stores" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Fleet</span>
        </Link>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{store?.storeCode} — {store?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Store Fleet Branch Overview & Live Inventory</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <MapPin size={16} color="var(--accent-gold)" />
            <span>{store?.location}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{store?.address || 'N/A'}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Manager</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <User size={16} color="var(--accent-teal)" />
            <span>{store?.managerName || 'Unassigned'}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Phone size={16} color="var(--accent-blue)" />
            <span>{store?.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Inventory Stock Snapshot */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Live Raw Material Stock Snapshot</h3>
        <DataTable columns={inventoryColumns} data={inventory} searchPlaceholder="Search inventory materials..." />
      </div>

      {/* Sales History */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Recent Sales History</h3>
        <DataTable columns={salesColumns} data={sales} searchPlaceholder="Search sales records..." />
      </div>
    </div>
  );
};

export default StoreDetailPage;
