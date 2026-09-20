import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import { Users, UserCheck, AlertTriangle, Edit3, Calendar, CheckCircle2, UserX } from 'lucide-react';

import { DEMO_STORES } from '../../utils/demoData';

const AdminWorkforcePage = () => {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [overview, setOverview] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Target Modal
  const [selectedStore, setSelectedStore] = useState(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetForm, setTargetForm] = useState({
    targetCooks: 5,
    targetServants: 4,
    targetWaiters: 4,
    targetCleaners: 2,
    targetBillers: 1,
    targetManagers: 1,
  });

  // Review Leave Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReviewStatus, setLeaveReviewStatus] = useState('APPROVED');
  const [leaveReviewRemarks, setLeaveReviewRemarks] = useState('');

  const fetchOverview = async () => {
    const demoOverview = DEMO_STORES.map((s) => ({
      storeId: s.id,
      storeCode: s.storeCode,
      storeName: s.name,
      presentCooks: 5,
      targetCooks: 5,
      presentServants: 4,
      targetServants: 4,
      presentWaiters: 4,
      targetWaiters: 4,
      presentCleaners: 2,
      targetCleaners: 2,
      presentBillers: 1,
      targetBillers: 1,
      presentManagers: 1,
      targetManagers: 1,
      totalPresentStaff: 17,
      totalTargetStaff: 17,
      staffingStatus: 'OPTIMAL',
    }));

    try {
      const [overviewRes, leaveRes] = await Promise.all([
        axiosClient.get('/admin/workforce/overview', { params: { date: attendanceDate } }),
        axiosClient.get('/admin/manager-leave/pending'),
      ]);
      setOverview(Array.isArray(overviewRes) ? overviewRes : demoOverview);
      setPendingLeaves(Array.isArray(leaveRes) ? leaveRes : []);
    } catch (err) {
      console.warn('Backend API unavailable, loading demo workforce overview...', err);
      setOverview(demoOverview);
      setPendingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [attendanceDate]);

  const handleOpenTargetModal = (row) => {
    setSelectedStore(row);
    setTargetForm({
      targetCooks: row.targetCooks || 5,
      targetServants: row.targetServants || 4,
      targetWaiters: row.targetWaiters || 4,
      targetCleaners: row.targetCleaners || 2,
      targetBillers: row.targetBillers || 1,
      targetManagers: row.targetManagers || 1,
    });
    setIsTargetModalOpen(true);
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    const total = Number(targetForm.targetCooks) + Number(targetForm.targetServants) +
                  Number(targetForm.targetWaiters) + Number(targetForm.targetCleaners) +
                  Number(targetForm.targetBillers) + Number(targetForm.targetManagers);

    if (total < 10 || total > 20) {
      alert(`Invalid workforce allocation: Total staff must be between 10 and 20. Calculated total: ${total}`);
      return;
    }

    try {
      await axiosClient.put(`/admin/stores/${selectedStore.storeId}/workforce/target`, targetForm);
      setIsTargetModalOpen(false);
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to update store workforce target');
    }
  };

  const handleReviewLeave = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      await axiosClient.put(`/admin/manager-leave/${selectedLeave.id}/review`, {
        status: leaveReviewStatus,
        adminRemarks: leaveReviewRemarks,
      });
      setIsLeaveModalOpen(false);
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to review manager leave request');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Workforce Overview...</div>;
  }

  const totalPresentChain = overview.reduce((acc, r) => acc + (r.totalPresentStaff || 0), 0);
  const totalTargetChain = overview.reduce((acc, r) => acc + (r.totalTargetStaff || 17), 0);
  const shortageCount = overview.filter((r) => r.staffingStatus === 'SHORTAGE_ALERT').length;

  const columns = [
    {
      header: 'Store Code',
      accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.storeCode}</span>,
    },
    { header: 'Store Name', accessor: (row) => row.storeName },
    {
      header: 'Cooks (P/T)',
      accessor: (row) => (
        <span>
          <strong style={{ color: 'var(--accent-blue)' }}>{row.presentCooks || 0}</strong> / {row.targetCooks}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Servants',
      accessor: (row) => (
        <span>
          <strong>{row.presentServants || 0}</strong> / {row.targetServants}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Waiters',
      accessor: (row) => (
        <span>
          <strong>{row.presentWaiters || 0}</strong> / {row.targetWaiters}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Cleaners',
      accessor: (row) => (
        <span>
          <strong>{row.presentCleaners || 0}</strong> / {row.targetCleaners}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Billers',
      accessor: (row) => (
        <span>
          <strong>{row.presentBillers || 0}</strong> / {row.targetBillers}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Manager Status',
      accessor: (row) => (
        <span className={`badge ${row.presentManagers > 0 ? 'badge-success' : 'badge-warning'}`}>
          {row.presentManagers > 0 ? 'Present on Shift' : 'Substitute / On Leave'}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'Total Staff Present',
      accessor: (row) => (
        <span style={{ fontWeight: 900, fontSize: '0.95rem', color: row.totalPresentStaff < 10 ? 'var(--status-danger)' : 'var(--status-success)' }}>
          {row.totalPresentStaff || 0} / {row.totalTargetStaff}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Staffing Status',
      accessor: (row) => (
        <span
          className={`badge ${
            row.staffingStatus === 'SHORTAGE_ALERT'
              ? 'badge-danger'
              : row.staffingStatus === 'PENDING_LOG'
              ? 'badge-warning'
              : 'badge-success'
          }`}
        >
          {row.staffingStatus === 'SHORTAGE_ALERT'
            ? 'Shortage Alert (< 10)'
            : row.staffingStatus === 'PENDING_LOG'
            ? 'Pending Log'
            : 'Optimal (>= 10)'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenTargetModal(row)}>
          <Edit3 size={14} />
          <span>Baseline</span>
        </button>
      ),
    },
  ];

  const leaveColumns = [
    { header: 'Store', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.storeCode} — {row.storeName}</span> },
    { header: 'Manager Name', accessor: (row) => row.managerName },
    { header: 'Dates Requested', accessor: (row) => `${row.startDate} to ${row.endDate}` },
    { header: 'Leave Category', accessor: (row) => <span className="badge badge-info">{row.leaveType}</span> },
    { header: 'Reason', accessor: (row) => row.reason },
    { header: 'Coverage Plan', accessor: (row) => row.actingManagerNote || 'N/A' },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedLeave(row);
            setLeaveReviewStatus('APPROVED');
            setLeaveReviewRemarks('');
            setIsLeaveModalOpen(true);
          }}
        >
          <span>Review Request</span>
        </button>
      ),
    },
  ];

  const calculatedTargetTotal =
    Number(targetForm.targetCooks) +
    Number(targetForm.targetServants) +
    Number(targetForm.targetWaiters) +
    Number(targetForm.targetCleaners) +
    Number(targetForm.targetBillers) +
    Number(targetForm.targetManagers);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chain Workforce & Manager Leave Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Monitor daily attendance across Cooks, Servants, Waiters, Cleaners, Billers, and review Store Manager leave requests
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label" style={{ margin: 0 }}>Attendance Date:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '180px' }}
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Chain Target Staff"
          value={`${totalTargetChain} Staff`}
          subtitle="Sum of store baseline requirements"
          icon={Users}
          color="blue"
        />
        <StatCard
          title={`Present Today (${attendanceDate})`}
          value={`${totalPresentChain} Staff`}
          subtitle="Staff present on shift today"
          icon={UserCheck}
          color="teal"
        />
        <StatCard
          title="Pending Manager Leaves"
          value={`${pendingLeaves.length} Requests`}
          subtitle="Manager leave applications requiring review"
          icon={UserX}
          color={pendingLeaves.length > 0 ? 'gold' : 'purple'}
        />
      </div>

      {/* Pending Manager Leave Requests Banner */}
      {pendingLeaves.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <UserX size={22} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Pending Store Manager Leave Requests ({pendingLeaves.length})</h3>
          </div>
          <DataTable columns={leaveColumns} data={pendingLeaves} searchPlaceholder="Search leave requests..." />
        </div>
      )}

      {/* Chain Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>
          Chain Daily Staff Attendance & Baseline Allocation ({attendanceDate})
        </h3>
        <DataTable columns={columns} data={overview} searchPlaceholder="Search store code, name..." />
      </div>

      {/* Configure Target Modal */}
      <Modal isOpen={isTargetModalOpen} onClose={() => setIsTargetModalOpen(false)} title={`Configure Baseline Target Staffing: ${selectedStore?.storeCode} — ${selectedStore?.storeName}`}>
        <form onSubmit={handleSaveTarget}>
          <div style={{ marginBottom: '16px', background: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue-border)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <strong>Operational Constraint Rule:</strong> Total branch staff must be between <strong>10 (Minimum)</strong> and <strong>20 (Maximum)</strong>.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Target Cooks</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetCooks}
                onChange={(e) => setTargetForm({ ...targetForm, targetCooks: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Servants</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetServants}
                onChange={(e) => setTargetForm({ ...targetForm, targetServants: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Waiters</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetWaiters}
                onChange={(e) => setTargetForm({ ...targetForm, targetWaiters: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Cleaners</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetCleaners}
                onChange={(e) => setTargetForm({ ...targetForm, targetCleaners: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Billers</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetBillers}
                onChange={(e) => setTargetForm({ ...targetForm, targetBillers: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Store Managers</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={targetForm.targetManagers}
                onChange={(e) => setTargetForm({ ...targetForm, targetManagers: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', marginBottom: '24px', padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Calculated Total Target Staff:</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: calculatedTargetTotal < 10 || calculatedTargetTotal > 20 ? 'var(--status-danger)' : 'var(--status-success)' }}>
              {calculatedTargetTotal} Staff {calculatedTargetTotal < 10 ? '(Below 10 Min!)' : calculatedTargetTotal > 20 ? '(Exceeds 20 Max!)' : '(Valid ✓)'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTargetModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={calculatedTargetTotal < 10 || calculatedTargetTotal > 20}>
              Save Target Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title={`Review Manager Leave Request: ${selectedLeave?.managerName} (${selectedLeave?.storeCode})`}>
        <form onSubmit={handleReviewLeave}>
          <div style={{ marginBottom: '18px', background: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <div><strong>Store Branch:</strong> {selectedLeave?.storeName} ({selectedLeave?.storeCode})</div>
            <div><strong>Manager Name:</strong> {selectedLeave?.managerName}</div>
            <div><strong>Requested Dates:</strong> {selectedLeave?.startDate} to {selectedLeave?.endDate}</div>
            <div><strong>Category:</strong> {selectedLeave?.leaveType}</div>
            <div><strong>Reason:</strong> {selectedLeave?.reason}</div>
            <div><strong>Coverage Plan:</strong> {selectedLeave?.actingManagerNote || 'N/A'}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Review Decision</label>
            <select
              className="form-select"
              value={leaveReviewStatus}
              onChange={(e) => setLeaveReviewStatus(e.target.value)}
            >
              <option value="APPROVED">APPROVE LEAVE REQUEST</option>
              <option value="REJECTED">REJECT LEAVE REQUEST</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Admin Instructions / Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Approved. Assistant Manager will take charge"
              value={leaveReviewRemarks}
              onChange={(e) => setLeaveReviewRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>
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

export default AdminWorkforcePage;
