import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatQuantity } from '../../utils/formatters';
import { Truck, Calendar, Edit3, ShieldAlert, CheckCircle, XCircle, History } from 'lucide-react';

import { DEMO_STORES, DEMO_DISTRIBUTIONS, DEMO_CHANGE_REQUESTS } from '../../utils/demoData';

const DistributionPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split('T')[0]);
  const [distributions, setDistributions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('distributions');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states
  const [defaultQtyInput, setDefaultQtyInput] = useState('');
  const [overrideQtyInput, setOverrideQtyInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [reviewStatusInput, setReviewStatusInput] = useState('APPROVED');
  const [reviewRemarksInput, setReviewRemarksInput] = useState('');

  const fetchStores = async () => {
    try {
      const res = await axiosClient.get('/admin/stores');
      const storeList = Array.isArray(res) ? res : DEMO_STORES;
      setStores(storeList);
      if (storeList.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storeList[0].id);
      }
    } catch (err) {
      console.warn('Backend API unavailable, loading demo stores...', err);
      setStores(DEMO_STORES);
      if (!selectedStoreId) setSelectedStoreId(DEMO_STORES[0].id);
    }
  };

  const fetchDistributions = async () => {
    if (!selectedStoreId) return;
    try {
      const res = await axiosClient.get('/admin/distributions', {
        params: { storeId: selectedStoreId, date: queryDate },
      });
      setDistributions(Array.isArray(res) ? res : DEMO_DISTRIBUTIONS[0].items);
    } catch (err) {
      console.warn('Backend API unavailable, loading demo distributions...', err);
      setDistributions(DEMO_DISTRIBUTIONS[0].items);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axiosClient.get('/admin/distributions/change-requests');
      setPendingRequests(Array.isArray(res) ? res : DEMO_CHANGE_REQUESTS);
    } catch (err) {
      console.warn('Backend API unavailable, loading demo requests...', err);
      setPendingRequests(DEMO_CHANGE_REQUESTS);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axiosClient.get('/admin/distributions/history', {
        params: { storeId: selectedStoreId },
      });
      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Failed to load history', err);
      setHistory([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStores();
      await fetchPendingRequests();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchDistributions();
      fetchHistory();
    }
  }, [selectedStoreId, queryDate]);

  const handleUpdateDefault = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put('/admin/distributions/defaults', {
        storeId: Number(selectedStoreId),
        materialId: selectedItem.materialId,
        defaultQuantity: Number(defaultQtyInput),
        reason: 'Central Admin baseline adjustment',
      });
      setIsDefaultModalOpen(false);
      fetchDistributions();
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to update default distribution');
    }
  };

  const handleCreateOverride = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/distributions/overrides', {
        storeId: Number(selectedStoreId),
        materialId: selectedItem.materialId,
        overrideDate: queryDate,
        overrideQuantity: Number(overrideQtyInput),
        reason: overrideReasonInput,
      });
      setIsOverrideModalOpen(false);
      fetchDistributions();
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to create override');
    }
  };

  const handleReviewRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await axiosClient.put(`/admin/distributions/change-requests/${selectedRequest.id}/review`, {
        status: reviewStatusInput,
        adminRemarks: reviewRemarksInput,
      });
      setIsReviewModalOpen(false);
      fetchPendingRequests();
      fetchDistributions();
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to review request');
    }
  };

  const distColumns = [
    { header: 'Material Code', accessor: (row) => row.materialCode },
    { header: 'Material Name', accessor: (row) => row.materialName },
    { header: 'Unit', accessor: (row) => row.unitOfMeasure },
    { header: 'Default Distribution', accessor: (row) => formatQuantity(row.defaultQuantity, row.unitOfMeasure), align: 'right' },
    {
      header: `Effective Distribution (${queryDate})`,
      accessor: (row) => (
        <span style={{ fontWeight: 800, color: row.isOverridden ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
          {formatQuantity(row.effectiveQuantity, row.unitOfMeasure)}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Override Status',
      accessor: (row) => (
        <span className={`badge ${row.isOverridden ? 'badge-warning' : 'badge-info'}`}>
          {row.isOverridden ? 'Date Override' : 'Standard Baseline'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedItem(row);
              setDefaultQtyInput(row.defaultQuantity);
              setIsDefaultModalOpen(true);
            }}
          >
            <Edit3 size={14} />
            <span>Default</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSelectedItem(row);
              setOverrideQtyInput(row.effectiveQuantity);
              setOverrideReasonInput('');
              setIsOverrideModalOpen(true);
            }}
          >
            <Calendar size={14} />
            <span>Single Day Override</span>
          </button>
        </div>
      ),
    },
  ];

  const pendingColumns = [
    { header: 'Store', accessor: (row) => `${row.storeCode} — ${row.storeName}` },
    { header: 'Material', accessor: (row) => row.materialName },
    { header: 'Default Qty', accessor: (row) => formatQuantity(row.defaultQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Requested Qty', accessor: (row) => formatQuantity(row.requestedQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'Reason', accessor: (row) => row.reason },
    { header: 'Requested Date', accessor: (row) => row.requestDate },
    {
      header: 'Action',
      render: (row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedRequest(row);
            setReviewStatusInput('APPROVED');
            setReviewRemarksInput('');
            setIsReviewModalOpen(true);
          }}
        >
          <span>Review Request</span>
        </button>
      ),
    },
  ];

  const historyColumns = [
    { header: 'Effective Date', accessor: (row) => row.effectiveDate },
    { header: 'Store', accessor: (row) => row.storeCode },
    { header: 'Material', accessor: (row) => row.materialName },
    { header: 'Previous Qty', accessor: (row) => formatQuantity(row.previousQuantity, row.unitOfMeasure), align: 'right' },
    { header: 'New Qty', accessor: (row) => formatQuantity(row.newQuantity, row.unitOfMeasure), align: 'right' },
    {
      header: 'Change Type',
      accessor: (row) => <span className="badge badge-info">{row.changeType}</span>,
    },
    { header: 'Reason', accessor: (row) => row.reason },
    { header: 'Changed By', accessor: (row) => row.changedByName },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Distribution System...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Material Distribution Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Configure default allocations, single-day overrides, review manager deviation requests, and inspect audit logs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'distributions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('distributions')}
        >
          <Truck size={16} />
          <span>Distribution Matrix</span>
        </button>

        <button
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('requests')}
        >
          <ShieldAlert size={16} />
          <span>Manager Requests ({pendingRequests.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          <span>Distribution History Audit</span>
        </button>
      </div>

      {activeTab === 'distributions' && (
        <>
          {/* Controls Bar */}
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Select Store:</label>
              <select
                className="form-select"
                style={{ width: '280px' }}
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.storeCode} — {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Target Date:</label>
              <input
                type="date"
                className="form-input"
                style={{ width: '180px' }}
                value={queryDate}
                onChange={(e) => setQueryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <DataTable columns={distColumns} data={distributions} searchPlaceholder="Search materials..." />
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Pending Manager Material Deviation Requests</h3>
          <DataTable columns={pendingColumns} data={pendingRequests} emptyMessage="No pending manager change requests" />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px' }}>Immutable Distribution Audit Log</h3>
          <DataTable columns={historyColumns} data={history} searchPlaceholder="Search history logs..." />
        </div>
      )}

      {/* Edit Default Modal */}
      <Modal isOpen={isDefaultModalOpen} onClose={() => setIsDefaultModalOpen(false)} title={`Edit Baseline Default: ${selectedItem?.materialName}`}>
        <form onSubmit={handleUpdateDefault}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Default Baseline Quantity ({selectedItem?.unitOfMeasure})</label>
            <input
              type="number"
              step="0.001"
              className="form-input"
              value={defaultQtyInput}
              onChange={(e) => setDefaultQtyInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDefaultModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Default Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* Single Day Override Modal */}
      <Modal isOpen={isOverrideModalOpen} onClose={() => setIsOverrideModalOpen(false)} title={`Single Day Override: ${selectedItem?.materialName} on ${queryDate}`}>
        <form onSubmit={handleCreateOverride}>
          <div className="form-group">
            <label className="form-label">Override Quantity ({selectedItem?.unitOfMeasure})</label>
            <input
              type="number"
              step="0.001"
              className="form-input"
              value={overrideQtyInput}
              onChange={(e) => setOverrideQtyInput(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Reason for Override</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Expected high weekend demand / Festival rush"
              value={overrideReasonInput}
              onChange={(e) => setOverrideReasonInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsOverrideModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Apply Override
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Request Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Review Request #${selectedRequest?.id} — ${selectedRequest?.storeCode}`}>
        <form onSubmit={handleReviewRequest}>
          <div style={{ marginBottom: '18px', background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <div><strong>Material:</strong> {selectedRequest?.materialName}</div>
            <div><strong>Default:</strong> {formatQuantity(selectedRequest?.defaultQuantity, selectedRequest?.unitOfMeasure)}</div>
            <div><strong>Requested:</strong> {formatQuantity(selectedRequest?.requestedQuantity, selectedRequest?.unitOfMeasure)}</div>
            <div><strong>Reason:</strong> {selectedRequest?.reason}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Decision</label>
            <select
              className="form-select"
              value={reviewStatusInput}
              onChange={(e) => setReviewStatusInput(e.target.value)}
            >
              <option value="APPROVED">APPROVE REQUEST</option>
              <option value="REJECTED">REJECT REQUEST</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Admin Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="Comments / instructions for store manager"
              value={reviewRemarksInput}
              onChange={(e) => setReviewRemarksInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Review Decision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DistributionPage;
