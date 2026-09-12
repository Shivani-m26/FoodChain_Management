import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { formatQuantity } from '../../utils/formatters';
import { Boxes, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const DailyInventoryPage = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId;

  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!storeId) return;

    const fetchMaterialsAndInventory = async () => {
      try {
        const [matRes, invRes] = await Promise.all([
          axiosClient.get(`/stores/${storeId}/inventory/distribution`, { params: { date: updateDate } }),
          axiosClient.get(`/stores/${storeId}/inventory`),
        ]);

        setMaterials(matRes);

        // Pre-fill initial form state
        const initialItems = {};
        matRes.forEach((m) => {
          const invItem = invRes.find((i) => i.materialId === m.materialId);
          const currentStock = invItem ? invItem.currentStock : 0;
          const effectiveDist = m.effectiveQuantity || 0;

          initialItems[m.materialId] = {
            openingStock: currentStock,
            receivedQuantity: effectiveDist,
            usedQuantity: 0,
            remarks: 'Normal daily usage',
          };
        });

        setItems(initialItems);
      } catch (err) {
        console.error('Failed to load inventory update form', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialsAndInventory();
  }, [storeId, updateDate]);

  const handleInputChange = (materialId, field, value) => {
    setItems((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const itemsList = Object.keys(items).map((matId) => ({
        materialId: Number(matId),
        openingStock: Number(items[matId].openingStock || 0),
        receivedQuantity: Number(items[matId].receivedQuantity || 0),
        usedQuantity: Number(items[matId].usedQuantity || 0),
        remarks: items[matId].remarks,
      }));

      await axiosClient.post(`/stores/${storeId}/inventory/daily-update`, {
        updateDate,
        items: itemsList,
      });

      setMessage({ type: 'success', text: `Daily inventory update submitted successfully for ${updateDate}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit inventory update.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Material Update Form...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manager Daily Material Usage Update</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Record opening stock, received distributions, material consumption, and remaining stock for {user?.assignedStoreName}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label" style={{ margin: 0 }}>Update Date:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '180px' }}
            value={updateDate}
            onChange={(e) => setUpdateDate(e.target.value)}
          />
        </div>
      </div>

      {message.text && (
        <div
          style={{
            background: message.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
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

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th style={{ textAlign: 'right' }}>Opening Stock</th>
                  <th style={{ textAlign: 'right' }}>Received</th>
                  <th style={{ textAlign: 'right' }}>Used Qty</th>
                  <th style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>Remaining Stock</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const item = items[m.materialId] || {};
                  const opening = Number(item.openingStock || 0);
                  const received = Number(item.receivedQuantity || 0);
                  const used = Number(item.usedQuantity || 0);
                  const remaining = opening + received - used;
                  const isNegative = remaining < 0;

                  return (
                    <tr key={m.materialId}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{m.materialName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.materialCode} ({m.unitOfMeasure})</div>
                      </td>

                      <td style={{ textAlign: 'right', width: '130px' }}>
                        <input
                          type="number"
                          step="0.001"
                          className="form-input"
                          style={{ textAlign: 'right' }}
                          value={item.openingStock || 0}
                          onChange={(e) => handleInputChange(m.materialId, 'openingStock', e.target.value)}
                          required
                        />
                      </td>

                      <td style={{ textAlign: 'right', width: '130px' }}>
                        <input
                          type="number"
                          step="0.001"
                          className="form-input"
                          style={{ textAlign: 'right' }}
                          value={item.receivedQuantity || 0}
                          onChange={(e) => handleInputChange(m.materialId, 'receivedQuantity', e.target.value)}
                          required
                        />
                      </td>

                      <td style={{ textAlign: 'right', width: '130px' }}>
                        <input
                          type="number"
                          step="0.001"
                          className="form-input"
                          style={{ textAlign: 'right' }}
                          value={item.usedQuantity || 0}
                          onChange={(e) => handleInputChange(m.materialId, 'usedQuantity', e.target.value)}
                          required
                        />
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 800, color: isNegative ? 'var(--status-danger)' : 'var(--accent-gold)' }}>
                        {formatQuantity(remaining, m.unitOfMeasure)}
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Normal sales"
                          value={item.remarks || ''}
                          onChange={(e) => handleInputChange(m.materialId, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '12px 28px' }}>
            <Save size={18} />
            <span>{submitting ? 'Submitting Inventory Log...' : 'Submit Daily Inventory Update'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyInventoryPage;
