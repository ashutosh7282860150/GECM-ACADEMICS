import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch { return 'N/A'; }
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');
export const formatTime = (date) => formatDate(date, 'hh:mm a');
export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
  } catch { return ''; }
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const getStatusBadgeClass = (status) => {
  const map = {
    active: 'badge-success', paid: 'badge-success', approved: 'badge-success',
    completed: 'badge-success', success: 'badge-success', present: 'badge-success',
    pending: 'badge-warning', in_progress: 'badge-info', overdue: 'badge-danger',
    rejected: 'badge-danger', failed: 'badge-danger', absent: 'badge-danger',
    expired: 'badge-muted', inactive: 'badge-muted', used: 'badge-muted',
    late: 'badge-warning', partial: 'badge-warning',
  };
  return map[status?.toLowerCase()] || 'badge-muted';
};

export const getStatusLabel = (status) => {
  const map = {
    in_progress: 'In Progress', mid_sem: 'Mid Semester', end_sem: 'End Semester',
    action_required: 'Action Required', double: 'Double Sharing', single: 'Single',
  };
  return map[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'N/A');
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getRoleColor = (role) => {
  const map = {
    admin: '#ef4444', student: '#6366f1', faculty: '#10b981',
    hod: '#8b5cf6', warden: '#f59e0b', accounts: '#0ea5e9',
  };
  return map[role] || '#64748b';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateReceiptNumber = () => {
  return 'RCPT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
};
