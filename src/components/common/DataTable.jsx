import React, { useState } from 'react';
import { Search } from 'lucide-react';

function extractText(node) {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (node.props && node.props.children) return extractText(node.props.children);
  return '';
}

const DataTable = ({ columns, data = [], searchPlaceholder = 'Search records...', keyField = 'id', emptyMessage = 'No records found' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = (data || []).filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();

    // 1. Direct row properties search (e.g. storeCode, name, location, materialName, etc.)
    const matchesDirectly = Object.entries(row).some(([_, val]) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' || typeof val === 'number') {
        return String(val).toLowerCase().includes(term);
      }
      return false;
    });
    if (matchesDirectly) return true;

    // 2. Column accessor or render check
    return columns.some((col) => {
      try {
        const val = col.accessor ? col.accessor(row) : (col.key ? row[col.key] : null);
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        if (React.isValidElement(val)) {
          const text = extractText(val);
          return text.toLowerCase().includes(term);
        }
      } catch (e) {
        // ignore
      }
      return false;
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredData.length} of {data.length} entries
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={row[keyField] || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;