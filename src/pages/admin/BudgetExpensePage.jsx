import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Plus, Building } from 'lucide-react';

const BudgetExpensePage = () => {
  const [stores, setStores] = useState([]);
  const [monthYear, setMonthYear] = useState('2026-08');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [budgetAmountInput, setBudgetAmountInput] = useState('');

  const fetchData = async () => {
    try {
      const [storeRes, budgetRes] = await Promise.all([
        axiosClient.get('/admin/stores'),
        axiosClient.get('/admin/budgets', { params: { monthYear } }),
      ]);
      setStores(storeRes);
      setBudgets(budgetRes);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthYear]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/budgets', null, {
        params: {
          storeId: selectedStoreId,
          monthYear,
          amount: budgetAmountInput,
        },
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to set budget');
    }
  };

  const columns = [
    { header: 'Store Code', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{row.storeCode}</span> },
    { header: 'Store Name', accessor: (row) => row.storeName },
    { header: 'Month / Year', accessor: (row) => row.monthYear },
    { header: 'Allocated Budget', accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-teal)' }}>{formatCurrency(row.allocatedBudget)}</span>, align: 'right' },
    { header: 'Configured By', accessor: (row) => row.createdByName },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Budgets...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Store Monthly Budgets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Set and manage monthly operational budgets per store branch
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="month"
            className="form-input"
            style={{ width: '180px' }}
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Set Store Budget</span>
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <DataTable columns={columns} data={budgets} searchPlaceholder="Search store budgets..." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Set Monthly Budget for ${monthYear}`}>
        <form onSubmit={handleSetBudget}>
          <div className="form-group">
            <label className="form-label">Select Branch Store</label>
            <select
              className="form-select"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              required
            >
              <option value="">-- Choose Store --</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeCode} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Allocated Monthly Budget (₹)</label>
            <input
              type="number"
              step="1000"
              className="form-input"
              placeholder="e.g. 150000.00"
              value={budgetAmountInput}
              onChange={(e) => setBudgetAmountInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetExpensePage;
