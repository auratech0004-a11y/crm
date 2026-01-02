import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  changePassword: async (newPassword) => {
    const response = await api.post('/auth/change-password', { new_password: newPassword });
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (employee) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  update: async (id, employee) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },
  create: async (attendance) => {
    const response = await api.post('/attendance', attendance);
    return response.data;
  },
  update: async (id, attendance) => {
    const response = await api.put(`/attendance/${id}`, attendance);
    return response.data;
  },
  checkIn: async (data = {}) => {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  },
  checkOut: async (data = {}) => {
    const response = await api.post('/attendance/check-out', data);
    return response.data;
  },
};

// Leave API
export const leaveAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/leaves', { params });
    return response.data;
  },
  create: async (leave) => {
    const response = await api.post('/leaves', leave);
    return response.data;
  },
  update: async (id, leave) => {
    const response = await api.put(`/leaves/${id}`, leave);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};

// Fine API
export const fineAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/fines', { params });
    return response.data;
  },
  create: async (fine) => {
    const response = await api.post('/fines', fine);
    return response.data;
  },
  update: async (id, fine) => {
    const response = await api.put(`/fines/${id}`, fine);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/fines/${id}`);
    return response.data;
  },
};

// Appeal API
export const appealAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/appeals', { params });
    return response.data;
  },
  create: async (appeal) => {
    const response = await api.post('/appeals', appeal);
    return response.data;
  },
  update: async (id, appeal) => {
    const response = await api.put(`/appeals/${id}`, appeal);
    return response.data;
  },
};

// Payroll API
export const payrollAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },
  process: async (data = {}) => {
    const response = await api.post('/payroll/process', data);
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/payroll/status');
    return response.data;
  },
  payEmployee: async (employeeId) => {
    const response = await api.post(`/payroll/pay/${employeeId}`, {});
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  update: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};

// Lead API
export const leadAPI = {
  getAll: async () => {
    const response = await api.get('/leads');
    return response.data;
  },
  getPermissions: async (leadId) => {
    const response = await api.get(`/lead-permissions/${leadId}`);
    return response.data;
  },
  updatePermissions: async (leadId, modules) => {
    const response = await api.put(`/lead-permissions/${leadId}`, { modules });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default api;
