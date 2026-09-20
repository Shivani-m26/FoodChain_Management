import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatters';
import { Receipt, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const DailySalesPage = () => {
  const { user } = useAuth();
  const storeId = user?.assignedStoreId;

  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchMenuItems = async () => {
      const demoItems = [
        { id: 1, itemCode: 'ITM001', name: 'Ghee Roast Dosa', category: 'Tiffin', unitPrice: 80.0 },
        { id: 2, itemCode: 'ITM002', name: 'Plain Idly (2 Pcs)', category: 'Tiffin', unitPrice: 30.0 },
        { id: 3, itemCode: 'ITM003', name: 'Medu Vada', category: 'Tiffin', unitPrice: 35.0 },
        { id: 4, itemCode: 'ITM004', name: 'Poori Masala', category: 'Tiffin', unitPrice: 65.0 },
        { id: 5, itemCode: 'ITM005', name: 'South Indian Full Meals', category: 'Meals', unitPrice: 150.0 },
        { id: 6, itemCode: 'ITM007', name: 'Filter Coffee', category: 'Beverages', unitPrice: 30.0 },
        { id: 7, itemCode: 'ITM010', name: 'Paneer Butter Masala', category: 'Main Course', unitPrice: 180.0 }
      ];

      try {
        const res = await axiosClient.get('/menu-items');
        const list = Array.isArray(res) ? res : demoItems;
        setMenuItems(list);

        const initialQty = {};
        list.forEach((item) => {
          initialQty[item.id] = 10;
        });
        setQuantities(initialQty);
      } catch (err) {
        console.warn('Backend API unavailable, loading demo menu items...', err);
        setMenuItems(demoItems);
        const initialQty = {};
        demoItems.forEach((item) => {
          initialQty[item.id] = 10;
        });
        setQuantities(initialQty);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleQtyChange = (itemId, val) => {
    const num = Math.max(0, parseInt(val || '0', 10));
    setQuantities((prev) => ({
      ...prev,
      [itemId]: num,
    }));
  };

  const calculateTotals = () => {
    let totalRevenue = 0;
    let totalItems = 0;

    menuItems.forEach((item) => {
      const qty = quantities[item.id] || 0;
      totalRevenue += qty * Number(item.unitPrice);
      totalItems += qty;
    });

    return { totalRevenue, totalItems };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const itemsPayload = Object.keys(quantities).map((itemId) => ({
        menuItemId: Number(itemId),
        quantity: quantities[itemId] || 0,
      })).filter((item) => item.quantity > 0);

      if (itemsPayload.length === 0) {
        throw new Error('Please enter at least one menu item quantity sold.');
      }

      await axiosClient.post(`/stores/${storeId}/sales`, {
        saleDate,
        items: itemsPayload,
      });

      setMessage({ type: 'success', text: `Daily sales entry saved successfully for ${saleDate}! Total: ${formatCurrency(calculateTotals().totalRevenue)}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit daily sales.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Sales Form...</div>;
  }

  const { totalRevenue, totalItems } = calculateTotals();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Daily Itemized Sales Entry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Enter daily units sold per menu item for {user?.assignedStoreName}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label className="form-label" style={{ margin: 0 }}>Sale Date:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '180px' }}
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
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

      {/* Real-time Calculation Summary Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent-gold)' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>REAL-TIME CALCULATED TOTAL REVENUE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-success)' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL ITEMS SOLD</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{totalItems.toLocaleString()} Pcs</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Menu Item Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Units Sold</th>
                  <th style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>Line Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => {
                  const qty = quantities[item.id] || 0;
                  const lineTotal = qty * Number(item.unitPrice);

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{item.itemCode}</td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td><span className="badge badge-info">{item.category}</span></td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right', width: '140px' }}>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          style={{ textAlign: 'right' }}
                          value={qty}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: lineTotal > 0 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                        {formatCurrency(lineTotal)}
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
            <span>{submitting ? 'Submitting Sales Entry...' : 'Submit Daily Sales Entry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailySalesPage;
