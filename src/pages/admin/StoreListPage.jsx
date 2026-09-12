import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Store as StoreIcon, Plus, UserPlus, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Forms
  const [newStore, setNewStore] = useState({
    storeCode: '',
    name: '',
    location: '',
    address: '',
    phone: '',
  });

  const [selectedManagerId, setSelectedManagerId] = useState('');

  const fetchStores = async () => {
    try {
      const [storeRes, userRes] = await Promise.all([
        axiosClient.get('/admin/stores'),
        axiosClient.get('/admin/users'),
      ]);
      setStores(storeRes);
      setUsers(userRes.filter((u) => u.role === 'ROLE_MANAGER'));
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/stores', newStore);
      setIsAddModalOpen(false);
      setNewStore({ storeCode: '', name: '', location: '', address: '', phone: '' });
      fetchStores();
    } catch (err) {
      alert(err.message || 'Failed to create store');
    }
  };

  const handleToggleStatus = async (storeId) => {
    try {
      await axiosClient.patch(`/admin/stores/${storeId}/status`);
      fetchStores();
    } catch (err) {
      alert(err.message || 'Failed to update store status');
    }
  };

  const handleAssignManager = async (e) => {
    e.preventDefault();
    if (!selectedStore || !selectedManagerId) return;

    try {
      await axiosClient.post(`/admin/stores/${selectedStore.id}/assign-manager`, {
        managerUserId: Number(selectedManagerId),
      });
      setIsAssignModalOpen(false);
      setSelectedStore(null);
      setSelectedManagerId('');
      fetchStores();
    } catch (err) {
      alert(err.message || 'Failed to assign manager');
    }
  };

  const columns = [
    {
      header: 'Store Code',
      accessor: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{row.storeCode}</span>
      ),
    },
    { header: 'Store Name', accessor: (row) => row.name },
    { header: 'Location', accessor: (row) => row.location },
    {
      header: 'Manager',
      accessor: (row) => (
        row.managerName ? (
          <div>
            <div style={{ fontWeight: 600 }}>{row.managerName}</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{row.managerEmail}</div>
          </div>
        ) : (
          <span style={{ color: 'var(--status-danger)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned</span>
        )
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/admin/stores/${row.id}`} className="btn btn-secondary btn-sm" title="View Store Detail">
            <Eye size={14} />
          </Link>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedStore(row);
              setSelectedManagerId(row.managerUserId || '');
              setIsAssignModalOpen(true);
            }}
            title="Assign Manager"
          >
            <UserPlus size={14} />
          </button>
          <button
            className={`btn btn-sm ${row.isActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => handleToggleStatus(row.id)}
            title={row.isActive ? 'Deactivate Store' : 'Activate Store'}
          >
            {row.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Stores...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Stores Fleet Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage all 15 restaurant branch locations and store manager assignments
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Branch</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <DataTable columns={columns} data={stores} searchPlaceholder="Search store code, name, location..." />
      </div>

      {/* Add Store Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Restaurant Branch">
        <form onSubmit={handleCreateStore}>
          <div className="form-group">
            <label className="form-label">Store Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. S016"
              value={newStore.storeCode}
              onChange={(e) => setNewStore({ ...newStore, storeCode: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Geetham Velachery Phase 2"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Chennai"
              value={newStore.location}
              onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full street address"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 044-22430004"
              value={newStore.phone}
              onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Manager Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Manager to ${selectedStore?.storeCode} — ${selectedStore?.name}`}>
        <form onSubmit={handleAssignManager}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Select Store Manager</label>
            <select
              className="form-select"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              required
            >
              <option value="">-- Choose Manager User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.username}) - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Manager Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoreListPage;
