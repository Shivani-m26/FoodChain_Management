import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Users, UserPlus } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'ROLE_MANAGER',
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/admin/users');
      setUsers(res);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/users', newUser);
      setIsModalOpen(false);
      setNewUser({ username: '', email: '', password: '', fullName: '', phoneNumber: '', role: 'ROLE_MANAGER' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user account');
    }
  };

  const columns = [
    { header: 'Username', accessor: (row) => <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{row.username}</span> },
    { header: 'Full Name', accessor: (row) => row.fullName },
    { header: 'Email', accessor: (row) => row.email },
    { header: 'Phone', accessor: (row) => row.phoneNumber || 'N/A' },
    {
      header: 'Role',
      accessor: (row) => (
        <span className={`badge ${row.role === 'ROLE_ADMIN' ? 'badge-warning' : 'badge-info'}`}>
          {row.role}
        </span>
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
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Users...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User Accounts Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage central administrator and store manager access credentials
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} />
          <span>Create New User</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <DataTable columns={columns} data={users} searchPlaceholder="Search users..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create System User Account">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. manager_s016"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. manager@geetham.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Password (min 6 chars)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ramesh Kumar"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={newUser.phoneNumber}
              onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="ROLE_MANAGER">ROLE_MANAGER (Branch Manager)</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN (Central Administrator)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
