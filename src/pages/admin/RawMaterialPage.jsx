import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExporter';
import { Package, Plus, Edit2, Download } from 'lucide-react';

const RawMaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [formData, setFormData] = useState({
    materialCode: '',
    name: '',
    unitOfMeasure: 'KG',
    costPerUnit: '',
    reorderThreshold: '',
  });

  const fetchMaterials = async () => {
    try {
      const res = await axiosClient.get('/raw-materials');
      setMaterials(res);
    } catch (err) {
      console.error('Failed to load raw materials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Material Code', 'Material Name', 'Unit of Measure', 'Cost per Unit (₹)', 'Reorder Threshold'];
    const rows = materials.map((m) => [
      m.materialCode,
      m.name,
      m.unitOfMeasure,
      m.costPerUnit,
      m.reorderThreshold,
    ]);
    downloadCSV(`raw_materials_catalog_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({ materialCode: '', name: '', unitOfMeasure: 'KG', costPerUnit: '', reorderThreshold: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      materialCode: material.materialCode,
      name: material.name,
      unitOfMeasure: material.unitOfMeasure,
      costPerUnit: material.costPerUnit,
      reorderThreshold: material.reorderThreshold,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        costPerUnit: Number(formData.costPerUnit),
        reorderThreshold: Number(formData.reorderThreshold || 0),
      };

      if (editingMaterial) {
        await axiosClient.put(`/admin/raw-materials/${editingMaterial.id}`, payload);
      } else {
        await axiosClient.post('/admin/raw-materials', payload);
      }

      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      alert(err.message || 'Failed to save raw material');
    }
  };

  const columns = [
    {
      header: 'Material Code',
      accessor: (row) => <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.materialCode}</span>,
    },
    { header: 'Material Name', accessor: (row) => row.name },
    {
      header: 'Unit of Measure',
      accessor: (row) => <span className="badge badge-info">{row.unitOfMeasure}</span>,
    },
    { header: 'Cost per Unit', accessor: (row) => formatCurrency(row.costPerUnit), align: 'right' },
    { header: 'Reorder Threshold', accessor: (row) => formatQuantity(row.reorderThreshold, row.unitOfMeasure), align: 'right' },
    {
      header: 'Actions',
      render: (row) => (
        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(row)}>
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
      ),
    },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Raw Materials...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Raw Material Master Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage central raw materials, units of measure, baseline unit costs, and reorder thresholds
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export Catalog CSV</span>
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add New Material</span>
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <DataTable columns={columns} data={materials} searchPlaceholder="Search materials, units..." />
      </div>

      {/* Material Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMaterial ? `Edit Material: ${editingMaterial.name}` : 'Add New Raw Material'}>
        <form onSubmit={handleSubmit}>
          {!editingMaterial && (
            <div className="form-group">
              <label className="form-label">Material Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MAT026"
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Material Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cardamom / Ghee / Paneer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit of Measure</label>
            <select
              className="form-select"
              value={formData.unitOfMeasure}
              onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              required
            >
              <option value="KG">Kilogram (KG)</option>
              <option value="GRAM">Gram (GRAM)</option>
              <option value="LITRE">Litre (LITRE)</option>
              <option value="ML">Millilitre (ML)</option>
              <option value="UNIT">Unit (UNIT)</option>
              <option value="PACKET">Packet (PACKET)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cost per Unit (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              placeholder="e.g. 150.00"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Reorder Low-Stock Threshold</label>
            <input
              type="number"
              step="0.001"
              className="form-input"
              placeholder="e.g. 10.000"
              value={formData.reorderThreshold}
              onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMaterial ? 'Update Material' : 'Create Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RawMaterialPage;
