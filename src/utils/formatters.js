export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatQuantity = (qty, unit = '') => {
  if (qty === undefined || qty === null) return `0 ${unit}`.trim();
  const num = Number(qty);
  return `${num.toLocaleString('en-IN', { maximumFractionDigits: 3 })} ${unit}`.trim();
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
