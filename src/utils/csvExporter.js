/**
 * Converts an array of objects/rows into a CSV string and triggers a browser file download.
 * @param {string} filename - The name of the file to save (e.g., 'chain_sales_report_2026-08-12.csv')
 * @param {Array<string>} headers - Column header titles
 * @param {Array<Array<any>>} rows - Data rows
 */
export const downloadCSV = (filename, headers, rows) => {
  if (!headers || !rows) return;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCSV).join(',');
  const bodyRows = rows.map((row) => row.map(escapeCSV).join(',')).join('\n');

  const csvContent = `${headerRow}\n${bodyRows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
