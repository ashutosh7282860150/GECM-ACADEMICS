import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    const isOnLoginPage = window.location.pathname === '/login';

    // Only auto-redirect on 401 if: not the login request itself
    if (status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// =============================================
// AUTH API
// =============================================
export const authAPI = {
  login: (email, password, requestedRole) =>
    api.post('/auth/login', { email, password, ...(requestedRole && { role: requestedRole }) }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// =============================================
// DASHBOARD API
// =============================================
export const dashboardAPI = {
  student: () => api.get('/dashboard/student'),
  admin: () => api.get('/dashboard/admin'),
  warden: () => api.get('/dashboard/warden'),
  accounts: () => api.get('/dashboard/accounts'),
  faculty: () => api.get('/dashboard/faculty'),
};

// =============================================
// STUDENTS API
// =============================================
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getProfile: () => api.get('/students/profile'),
  getById: (id) => api.get(`/students/${id}`),
};

// =============================================
// FACULTY API
// =============================================
export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getProfile: () => api.get('/faculty/profile'),
  getStudents: () => api.get('/faculty/students'),
  getCourses: () => api.get('/faculty/courses'),
};

// =============================================
// FEES API
// =============================================
export const feesAPI = {
  getAll: () => api.get('/fees'),
  getById: (id) => api.get(`/fees/${id}`),
  pay: (data) => api.post('/fees/pay', data),
  getPaymentHistory: () => api.get('/fees/payments/history'),
  verifyPayment: (id, data) => api.put(`/fees/${id}/verify`, data),
};

// =============================================
// ATTENDANCE API
// =============================================
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getCourses: () => api.get('/attendance/courses'),
  markAttendance: (data) => api.post('/attendance/mark', data),
};

// =============================================
// EXAMS API
// =============================================
export const examsAPI = {
  getAll: () => api.get('/exams'),
  getResults: (params) => api.get('/exams/results', { params }),
  create: (data) => api.post('/exams', data),
  enterResults: (data) => api.post('/exams/results/enter', data),
  publishResults: (id) => api.put(`/exams/${id}/publish`),
};

// =============================================
// HOSTEL API
// =============================================
export const hostelAPI = {
  getInfo: () => api.get('/hostel'),
  getRooms: (params) => api.get('/hostel/rooms', { params }),
};

// =============================================
// NO DUES API
// =============================================
export const noDuesAPI = {
  getAll: (params) => api.get('/nodues', { params }),
  getById: (id) => api.get(`/nodues/${id}`),
  create: (data) => api.post('/nodues', data),
  verify: (id, data) => api.put(`/nodues/${id}/verify`, data),
};

// =============================================
// GATE PASS API
// =============================================
export const gatePassAPI = {
  getAll: (params) => api.get('/gatepass', { params }),
  getById: (id) => api.get(`/gatepass/${id}`),
  create: (data) => api.post('/gatepass', data),
  approve: (id, data) => api.put(`/gatepass/${id}/approve`, data),
  reject: (id, data) => api.put(`/gatepass/${id}/reject`, data),
  verifyQR: (qrData) => api.post('/gatepass/verify-qr', { qrData }),
};

// =============================================
// NOTIFICATIONS API
// =============================================
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
};

// =============================================
// ADMIN API
// =============================================
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getDepartments: () => api.get('/admin/departments'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getPendingWorkflows: () => api.get('/admin/pending-workflows'),
};

// =============================================
// WORKFLOW API
// =============================================
export const workflowAPI = {
  getSteps: (type, id) => api.get(`/workflow/${type}/${id}/steps`),
};

// =============================================
// APPLICATIONS WORKFLOW API
// =============================================
export const applicationsAPI = {
  getTypes: () => api.get('/applications/types'),
  updateRoutingConfig: (data) => api.post('/applications/types/config', data),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getInbox: (params) => api.get('/applications/inbox', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  submit: (data) => api.post('/applications', data),
  resubmit: (id, data) => api.put(`/applications/${id}/resubmit`, data),
  review: (id, data) => api.put(`/applications/${id}/review`, data),
  updateClearance: (id, data) => api.put(`/applications/${id}/clearance`, data),
  uploadDocument: (formData) => api.post('/applications/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

