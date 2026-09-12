import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatQuantity } from '../../utils/formatters';
import { FileCheck2, Plus, CalendarOff, Package, UserCheck, Calendar } from 'lucide-react';

const ChangeRequestPage = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId;

  const [activeTab, setActiveTab] = useState('materials');
  const [requests, setRequests] = useState([]);
  const [closureRequests, setClosureRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Form states
  const [matFormData, setMatFormData] = useState({
    materialId: '',
    requestDate: new Date().toISOString().split('T')[0],
    requestedQuantity: '',
    reason: '',
  });

  const [closureFormData, setClosureFormData] = useState({
    closureDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [leaveFormData, setLeaveFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    leaveType: 'PERSONAL_LEAVE',
    reason: '',
    actingManagerNote: '',
  });

  const fetchData = async () => {
    if (!storeId) return;
    try {
      const [reqRes, matRes, closureRes, leaveRes] = await Promise.all([
        axiosClient.get(`/stores/${storeId}/inventory/change-requests`),
        axiosClient.get('/raw-materials'),
        axiosClient.get(`/stores/${storeId}/closure-requests`),
        axiosClient.get(`/stores/${storeId}/manager-leave`),
      ]);
      setRequests(reqRes);
      setMaterials(matRes);
      setClosureRequests(closureRes);
      setLeaveRequests(leaveRes);
    } catch (err) {
      console.error('Failed to load store requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleMatSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(`/stores/${storeId}/inventory/change-request`, {
        materialId: Number(matFormData.materialId),
        requestDate: matFormData.requestDate,
        requestedQuantity: Number(matFormData.requestedQuantity),
        reason: matFormData.reason,
      });

      setIsMatModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit material change request');
    }
  };

  const handleClosureSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(`/stores/${storeId}/closure-requests`, {
        closureDate: closureFormData.closureDate,
        reason: closureFormData.reason,
      });

      setIsClosureModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit store closure request');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(`/stores/${storeId}/manager-leave`, leaveFormData);
      setIsLeaveModalOpen(false);
      setLeaveFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        leaveType: 'PERSONAL_LEAVE',
        reason: '',
        actingManagerNote: '',
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit manager leave request');
    }
  };

  const matColumns = [
    { header: 'Request Date', accessor: (row) => row.requestDate },
    { header: 'Material Name', accessor: (row) => row.materialName },
    { header: 'Default Allocation', accessor: (row) => formatQuantity(row.defaultQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Requested Allocation', accessor: (row) => formatQuantity(row.requestedQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Reason given', accessor: (row) => row.reason },
    {
      header: 'Review Status',
      accessor: (row) => (
        <span className={`badge ${row.status === 'APPROVED' ? 'badge-success' : row.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    { header: 'Admin Remarks', accessor: (row) => row.adminRemarks || 'N/A' },
  ];

  const closureColumns = [
    { header: 'Target Closure Date', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.closureDate}</span> },
    { header: 'Reason for Closure', accessor: (row) => row.reason },
    {
      header: 'Review Status',
      accessor: (row) => (
        <span className={`badge ${row.status === 'APPROVED' ? 'badge-success' : row.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    { header: 'Admin Remarks', accessor: (row) => row.adminRemarks || 'N/A' },
  ];

  const leaveColumns = [
    {
      header: 'Leave Dates',
      accessor: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>
          {row.startDate} to {row.endDate}
        </span>
      ),
    },
    {
      header: 'Leave Type',
      accessor: (row) => <span className="badge badge-info">{row.leaveType}</span>,
    },
    { header: 'Reason', accessor: (row) => row.reason },
    { header: 'Acting Coverage', accessor: (row) => row.actingManagerNote || 'N/A' },
    {
      header: 'Admin Approval Status',
      accessor: (row) => (
        <span className={`badge ${row.status === 'APPROVED' ? 'badge-success' : row.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    { header: 'Admin Remarks', accessor: (row) => row.adminRemarks || 'N/A' },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Requests...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Store & Manager Approval Requests</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submit material allocation deviations, store day closures, or Manager leave requests for Admin approval
          </p>
        </div>

        {activeTab === 'materials' && (
          <button className="btn btn-primary" onClick={() => setIsMatModalOpen(true)}>
            <Plus size={16} />
            <span>New Material Request</span>
          </button>
        )}

        {activeTab === 'closures' && (
          <button className="btn btn-primary" onClick={() => setIsClosureModalOpen(true)}>
            <CalendarOff size={16} />
            <span>Request Store Day Closure</span>
          </button>
        )}

        {activeTab === 'leaves' && (
          <button className="btn btn-primary" onClick={() => setIsLeaveModalOpen(true)}>
            <UserCheck size={16} />
            <span>Request Manager Leave</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button className={`btn ${activeTab === 'materials' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('materials')}>
          <Package size={16} />
          <span>Material Deviation Requests ({requests.length})</span>
        </button>

        <button className={`btn ${activeTab === 'closures' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('closures')}>
          <CalendarOff size={16} />
          <span>Store Closure Requests ({closureRequests.length})</span>
        </button>

        <button className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('leaves')}>
          <UserCheck size={16} />
          <span>Manager Leave Requests ({leaveRequests.length})</span>
        </button>
      </div>

      {activeTab === 'materials' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <DataTable columns={matColumns} data={requests} searchPlaceholder="Search material requests..." />
        </div>
      )}

      {activeTab === 'closures' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <DataTable columns={closureColumns} data={closureRequests} searchPlaceholder="Search closure requests..." />
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <DataTable columns={leaveColumns} data={leaveRequests} searchPlaceholder="Search leave requests..." />
        </div>
      )}

      {/* Material Request Modal */}
      <Modal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} title="Submit Material Deviation Request">
        <form onSubmit={handleMatSubmit}>
          <div className="form-group">
            <label className="form-label">Select Raw Material</label>
            <select
              className="form-select"
              value={matFormData.materialId}
              onChange={(e) => setMatFormData({ ...matFormData, materialId: e.target.value })}
              required
            >
              <option value="">-- Choose Material --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialCode} — {m.name} ({m.unitOfMeasure})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input
              type="date"
              className="form-input"
              value={matFormData.requestDate}
              onChange={(e) => setMatFormData({ ...matFormData, requestDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Requested Quantity</label>
            <input
              type="number"
              step="0.001"
              className="form-input"
              placeholder="e.g. 15.000"
              value={matFormData.requestedQuantity}
              onChange={(e) => setMatFormData({ ...matFormData, requestedQuantity: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Business Reason</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Explain why default distribution is insufficient"
              value={matFormData.reason}
              onChange={(e) => setMatFormData({ ...matFormData, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Store Closure Modal */}
      <Modal isOpen={isClosureModalOpen} onClose={() => setIsClosureModalOpen(false)} title="Request Store Day Closure">
        <form onSubmit={handleClosureSubmit}>
          <div className="form-group">
            <label className="form-label">Target Closure Date</label>
            <input
              type="date"
              className="form-input"
              value={closureFormData.closureDate}
              onChange={(e) => setClosureFormData({ ...closureFormData, closureDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Reason for Closure</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Scheduled Deep Cleaning / Festival Holiday"
              value={closureFormData.reason}
              onChange={(e) => setClosureFormData({ ...closureFormData, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsClosureModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Closure Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Manager Leave Request Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Submit Manager Leave Request">
        <form onSubmit={handleLeaveSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Leave Start Date</label>
              <input
                type="date"
                className="form-input"
                value={leaveFormData.startDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Leave End Date</label>
              <input
                type="date"
                className="form-input"
                value={leaveFormData.endDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <select
              className="form-select"
              value={leaveFormData.leaveType}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
              required
            >
              <option value="PERSONAL_LEAVE">Personal Leave</option>
              <option value="SICK_LEAVE">Sick / Medical Leave</option>
              <option value="EMERGENCY">Family Emergency</option>
              <option value="STORE_HOLIDAY">Store Holiday Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Provide reason for leave"
              value={leaveFormData.reason}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Shift Substitute / Coverage Plan</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Biller / Assistant Manager will oversee store operations"
              value={leaveFormData.actingManagerNote}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, actingManagerNote: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request to Admin
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChangeRequestPage;
