import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const adminLogin = async (email, password) => {
  const response = await api.post('/api/users/admin', { email, password });
  return response.data;
};

// Admin Dashboard APIs
export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/api/admin/users', { params });
  return response.data;
};

export const getAllProperties = async (params = {}) => {
  const response = await api.get('/api/admin/properties', { params });
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await api.get('/api/admin/appointments');
  return response.data;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const response = await api.put('/api/admin/appointments/status', {
    appointmentId,
    status
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/api/admin/properties/${id}`);
  return response.data;
};

export const getAllReports = async () => {
  const response = await api.get('/api/admin/reports');
  return response.data;
};

export const updateReportStatus = async (id, status, adminNotes) => {
  const response = await api.put(`/api/admin/reports/${id}/status`, {
    status,
    adminNotes
  });
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await api.get('/api/admin/health');
  return response.data;
};