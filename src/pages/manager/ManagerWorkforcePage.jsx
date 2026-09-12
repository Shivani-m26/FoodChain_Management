import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { Users, UserCheck, Save, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

const ManagerWorkforcePage = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId;

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [target, setTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    presentCooks: 5,
    presentServants: 4,
    presentWaiters: 4,
    presentCleaners: 2,
    presentBillers: 1,
    presentManagers: 1,
    notes: '',
  });

  const fetchWorkforceData = async () => {
    if (!storeId) return;
    try {
      const [targetRes, historyRes] = await Promise.all([
        axiosClient.get(`/stores/${storeId}/workforce/target`),
        axiosClient.get(`/stores/${storeId}/workforce/attendance/history`),
      ]);

      setTarget(targetRes);
      setHistory(historyRes);

      setForm((prev) => ({
        ...prev,
        presentCooks: targetRes.targetCooks || 5,
        presentServants: targetRes.targetServants || 4,
        presentWaiters: targetRes.targetWaiters || 4,
        presentCleaners: targetRes.targetCleaners || 2,
        presentBillers: targetRes.targetBillers || 1,
        presentManagers: targetRes.targetManagers || 1,
      }));
    } catch (err) {
      console.error('Failed to load workforce data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforceData();
  }, [storeId]);

  const calculatePresentTotal = () => {
    return (
      Number(form.presentCooks || 0) +
      Number(form.presentServants || 0) +
      Number(form.presentWaiters || 0) +
      Number(form.presentCleaners || 0) +
      Number(form.presentBillers || 0) +
      Number(form.presentManagers || 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const total = calculatePresentTotal();
    if (total < 10) {
      if (!window.confirm(`Warning: Total present staff (${total}) is below the required operational minimum of 10 staff. Do you want to submit with a Staff Shortage Alert?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      await axiosClient.post(`/stores/${storeId}/workforce/attendance`, {
        attendanceDate,
        ...form,
        presentCooks: Number(form.presentCooks),
        presentServants: Number(form.presentServants),
        presentWaiters: Number(form.presentWaiters),
        presentCleaners: Number(form.presentCleaners),
        presentBillers: Number(form.presentBillers),
        presentManagers: Number(form.presentManagers),
      });

      setMessage({ type: 'success', text: `Daily staff attendance log submitted successfully for ${attendanceDate}! Total Present: ${total} staff.` });
      fetchWorkforceData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit staff attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Branch Staffing Form...</div>;
  }

  const presentTotal = calculatePresentTotal();

  const historyColumns = [
    { header: 'Attendance Date', accessor: (row) => <span style={{ fontWeight: 700 }}>{row.attendanceDate}</span> },
    { header: 'Cooks', accessor: (row) => row.presentCooks, align: 'center' },
    { header: 'Servants', accessor: (row) => row.presentServants, align: 'center' },
    { header: 'Waiters', accessor: (row) => row.presentWaiters, align: 'center' },
    { header: 'Cleaners', accessor: (row) => row.presentCleaners, align: 'center' },
    { header: 'Billers', accessor: (row) => row.presentBillers, align: 'center' },
    { header: 'Manager', accessor: (row) => row.presentManagers, align: 'center' },
    {
      header: 'Total Present',
      accessor: (row) => (
        <span style={{ fontWeight: 900, color: row.totalPresentStaff < 10 ? 'var(--status-danger)' : 'var(--status-success)' }}>
          {row.totalPresentStaff} / {row.totalTargetStaff}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge ${row.staffingStatus === 'SHORTAGE_ALERT' ? 'badge-danger' : 'badge-success'}`}>
          {row.staffingStatus === 'SHORTAGE_ALERT' ? 'Shortage Alert (< 10)' : 'Optimal Staffing'}
        </span>
      ),
    },
    { header: 'Notes', accessor: (row) => row.notes || 'N/A' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {user?.assignedStoreCode} — {user?.assignedStoreName} Staff Attendance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Log daily staff attendance across Cooks, Servants, Waiters, Cleaners, Billers, and Store Managers
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

      {message.text && (
        <div
          style={{
            background: message.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
            border: `1px solid ${message.type === 'success' ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: message.type === 'success' ? 'var(--status-success)' : 'var(--status-danger)',
            fontWeight: 600,
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Target Summary Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent-blue)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STORE BASELINE WORKFORCE REQUIREMENT</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
            Total Baseline: {target?.totalTargetStaff || 17} Staff
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Cooks: {target?.targetCooks} | Servants: {target?.targetServants} | Waiters: {target?.targetWaiters} | Cleaners: {target?.targetCleaners} | Billers: {target?.targetBillers} | Manager: {target?.targetManagers}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TODAY'S CALCULATED PRESENT STAFF</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: presentTotal < 10 ? 'var(--status-danger)' : 'var(--status-success)' }}>
            {presentTotal} / {target?.totalTargetStaff || 17} Staff
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            Daily Attendance Log Entry ({attendanceDate})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Cooks Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentCooks}
                onChange={(e) => setForm({ ...form, presentCooks: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetCooks}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Servants Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentServants}
                onChange={(e) => setForm({ ...form, presentServants: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetServants}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Waiters Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentWaiters}
                onChange={(e) => setForm({ ...form, presentWaiters: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetWaiters}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Cleaners Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentCleaners}
                onChange={(e) => setForm({ ...form, presentCleaners: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetCleaners}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Billers Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentBillers}
                onChange={(e) => setForm({ ...form, presentBillers: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetBillers}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Managers Present</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.presentManagers}
                onChange={(e) => setForm({ ...form, presentManagers: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target: {target?.targetManagers}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Attendance Notes / Staffing Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1 cook on festival leave, full waiter strength present"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '12px 28px' }}>
              <Save size={18} />
              <span>{submitting ? 'Submitting Staff Attendance Log...' : 'Submit Daily Attendance Log'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Attendance History */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Branch Staff Attendance Log History</h3>
        <DataTable columns={historyColumns} data={history} searchPlaceholder="Search attendance history..." />
      </div>
    </div>
  );
};

export default ManagerWorkforcePage;
