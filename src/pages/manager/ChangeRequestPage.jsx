import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatQuantity } from '../../utils/formatters';
import { FileCheck2, Plus, CalendarOff, Package, UserCheck, Calendar } from 'lucide-react';
import { DEMO_CHANGE_REQUESTS, DEMO_RAW_MATERIALS, DEMO_STORES } from '../../utils/demoData';

const ChangeRequestPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(user?.assignedStoreId || user?.storeId || 1);

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

  // Fetch store fleet
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axiosClient.get('/admin/stores');
        if (Array.isArray(res) && res.length > 0) {
          setStores(res);
        } else {
          setStores(DEMO_STORES);
        }
      } catch (err) {
        setStores(DEMO_STORES);
      }
    };
    fetchStores();
  }, []);

  // When user context updates (e.g. after login), synchronize activeStoreId
  useEffect(() => {
    if (user?.assignedStoreId || user?.storeId) {
      setActiveStoreId(Number(user.assignedStoreId || user.storeId));
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [reqRes, matRes, closureRes, leaveRes] = await Promise.all([
        axiosClient.get(`/stores/${activeStoreId}/inventory/change-requests`),
        axiosClient.get('/raw-materials'),
        axiosClient.get(`/stores/${activeStoreId}/closure-requests`),
        axiosClient.get(`/stores/${activeStoreId}/manager-leave`),
      ]);

      const filteredDemoReqs = DEMO_CHANGE_REQUESTS.filter((r) => Number(r.storeId) === Number(activeStoreId));
      setRequests(Array.isArray(reqRes) ? reqRes : filteredDemoReqs);
      setMaterials(Array.isArray(matRes) ? matRes : DEMO_RAW_MATERIALS);
      setClosureRequests(Array.isArray(closureRes) ? closureRes : []);
      setLeaveRequests(Array.isArray(leaveRes) ? leaveRes : []);
    } catch (err) {
      console.warn('Backend API unavailable, loading demo requests...', err);
      const filteredDemoReqs = DEMO_CHANGE_REQUESTS.filter((r) => Number(r.storeId) === Number(activeStoreId));
      setRequests(filteredDemoReqs);
      setMaterials(DEMO_RAW_MATERIALS);
      setClosureRequests([]);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStoreId]);

  const handleMatSubmit = async (e) => {
    e.preventDefault();
    try {
      const storeIdToUse = Number(activeStoreId || user?.assignedStoreId || user?.storeId || 1);
      await axiosClient.post(`/stores/${storeIdToUse}/inventory/change-request`, {
        storeId: storeIdToUse,
        materialId: Number(matFormData.materialId),
        requestDate: matFormData.requestDate,
        requestedQuantity: Number(matFormData.requestedQuantity),
        reason: matFormData.reason,
      });

      setIsMatModalOpen(false);
      setMatFormData({
        materialId: '',
        requestDate: new Date().toISOString().split('T')[0],
        requestedQuantity: '',
        reason: '',
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit material change request');
    }
  };

  const handleClosureSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(`/stores/${activeStoreId}/closure-requests`, {
        storeId: Number(activeStoreId),
        closureDate: closureFormData.closureDate,
        reason: closureFormData.reason,
      });

      setIsClosureModalOpen(false);
      setClosureFormData({
        closureDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit store closure request');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(`/stores/${activeStoreId}/manager-leave`, {
        storeId: Number(activeStoreId),
        ...leaveFormData,
      });
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

  const currentStore = stores.find((s) => Number(s.id) === Number(activeStoreId));

  const matColumns = [
    { header: 'Store Branch', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{row.storeCode || `S00${row.storeId}`} — {row.storeName || 'Branch'}</span> },
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
    { header: 'Store Branch', accessor: (row) => `${row.storeCode || `S00${row.storeId}`} — ${row.storeName || 'Branch'}` },
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
    { header: 'Store Branch', accessor: (row) => `${row.storeCode || `S00${row.storeId}`} — ${row.storeName || 'Branch'}` },
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {currentStore ? `${currentStore.storeCode} — ${currentStore.name}` : 'Branch Store'} Approval Requests
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submit material allocation deviations, store day closures, or Manager leave requests for Admin approval
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Active Branch:</label>
            <select
              className="form-select"
              style={{ width: '240px' }}
              value={activeStoreId}
              onChange={(e) => setActiveStoreId(Number(e.target.value))}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeCode} — {s.name}
                </option>
              ))}
            </select>
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
          <DataTable
            columns={matColumns}
            data={requests}
            searchPlaceholder="Search material requests..."
            emptyMessage={`No material deviation requests recorded for ${currentStore ? currentStore.name : 'this store'}`}
          />
        </div>
      )}

      {activeTab === 'closures' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <DataTable
            columns={closureColumns}
            data={closureRequests}
            searchPlaceholder="Search closure requests..."
            emptyMessage={`No store closure requests recorded for ${currentStore ? currentStore.name : 'this store'}`}
          />
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <DataTable
            columns={leaveColumns}
            data={leaveRequests}
            searchPlaceholder="Search leave requests..."
            emptyMessage={`No manager leave requests recorded for ${currentStore ? currentStore.name : 'this store'}`}
          />
        </div>
      )}

      {/* Material Request Modal */}
      <Modal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} title={`Submit Material Request for ${currentStore?.storeCode} — ${currentStore?.name}`}>
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
      <Modal isOpen={isClosureModalOpen} onClose={() => setIsClosureModalOpen(false)} title={`Request Store Day Closure: ${currentStore?.storeCode} — ${currentStore?.name}`}>
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
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title={`Submit Leave Request: Manager (${currentStore?.storeCode})`}>
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
