import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import DataTable from '../../components/common/DataTable';
import { formatDateTime } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExporter';
import { ClipboardList, Shield, Download } from 'lucide-react';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await axiosClient.get('/admin/audit-logs');
        setLogs(res);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Username', 'Role', 'Action Performed', 'Target Entity', 'Entity ID', 'Previous Value', 'New Value / Details'];
    const rows = logs.map((log) => [
      formatDateTime(log.timestamp),
      log.username,
      log.role,
      log.action,
      log.entityName,
      log.entityId,
      log.previousValue,
      log.newValue,
    ]);

    downloadCSV(`system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const columns = [
    { header: 'Timestamp', accessor: (row) => formatDateTime(row.timestamp) },
    { header: 'Username', accessor: (row) => <span style={{ fontWeight: 700 }}>{row.username}</span> },
    { header: 'Role', accessor: (row) => <span className="badge badge-info">{row.role}</span> },
    { header: 'Action Performed', accessor: (row) => <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{row.action}</span> },
    { header: 'Target Entity', accessor: (row) => `${row.entityName} #${row.entityId || ''}` },
    { header: 'New Value / Details', accessor: (row) => row.newValue || 'N/A' },
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Audit Logs...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Immutable System Audit Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Complete trace of administrative overrides, inventory updates, manager assignments, and sales postings
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export Audit Logs CSV</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <DataTable columns={columns} data={logs} searchPlaceholder="Search audit logs by username, action, entity..." />
      </div>
    </div>
  );
};

export default AuditLogPage;
