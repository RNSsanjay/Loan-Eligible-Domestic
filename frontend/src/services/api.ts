import axios from 'axios';
import type { LoginCredentials, AuthResponse, SetPasswordData } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('/auth/login', null, {
      auth: {
        username: credentials.email,
        password: credentials.password,
      },
    }).then(res => res.data),
    
  setPassword: (data: SetPasswordData) =>
    api.post('/auth/set-password', null, { params: data }).then(res => res.data),
    
  checkFirstLogin: (email: string) =>
    api.get('/auth/check-first-login', { params: { email } }).then(res => res.data),
    
  getProfile: () =>
    api.get('/auth/me').then(res => res.data),
};

// Operator API
export const operatorAPI = {
  // Applicants
  createApplicant: (data: any) =>
    api.post('/operator/applicants', data).then(res => res.data),
    
  getApplicants: () =>
    api.get('/operator/applicants').then(res => res.data),
    
  getApplicant: (id: string) =>
    api.get(`/operator/applicants/${id}`).then(res => res.data),
    
  // Animals
  createAnimal: (data: any) =>
    api.post('/operator/animals', data).then(res => res.data),
    
  getAnimals: () =>
    api.get('/operator/animals').then(res => res.data),
    
  // Loan Applications
  createLoanApplication: (data: any) =>
    api.post('/operator/loan-applications', data).then(res => res.data),
    
  getLoanApplications: () =>
    api.get('/operator/loan-applications').then(res => res.data),
    
  verifyLoanApplication: (id: string, data: any) =>
    api.put(`/operator/loan-applications/${id}/verify`, data).then(res => res.data),
};

// Manager API
export const managerAPI = {
  // Operators
  createOperator: (data: any) =>
    api.post('/manager/operators', data).then(res => res.data),
    
  getOperators: () =>
    api.get('/manager/operators').then(res => res.data),
    
  getOperator: (id: string) =>
    api.get(`/manager/operators/${id}`).then(res => res.data),
    
  updateOperator: (id: string, data: any) =>
    api.put(`/manager/operators/${id}`, data).then(res => res.data),
    
  deleteOperator: (id: string) =>
    api.delete(`/manager/operators/${id}`).then(res => res.data),
    
  // Loan Applications
  getLoanApplications: () =>
    api.get('/manager/loan-applications').then(res => res.data),
    
  approveLoanApplication: (id: string) =>
    api.put(`/manager/loan-applications/${id}/approve`).then(res => res.data),
    
  rejectLoanApplication: (id: string, reason: string) =>
    api.put(`/manager/loan-applications/${id}/reject`, null, { params: { reason } }).then(res => res.data),
    
  // Dashboard
  getDashboardStats: () =>
    api.get('/manager/dashboard/stats').then(res => res.data),
};

// Admin API
export const adminAPI = {
  // Managers
  createManager: (data: any) =>
    api.post('/admin/managers', data).then(res => res.data),
    
  getManagers: () =>
    api.get('/admin/managers').then(res => res.data),
    
  getManager: (id: string) =>
    api.get(`/admin/managers/${id}`).then(res => res.data),
    
  updateManager: (id: string, data: any) =>
    api.put(`/admin/managers/${id}`, data).then(res => res.data),
    
  deleteManager: (id: string) =>
    api.delete(`/admin/managers/${id}`).then(res => res.data),
    
  getManagerOperators: (id: string) =>
    api.get(`/admin/managers/${id}/operators`).then(res => res.data),
    
  getManagerStats: (id: string) =>
    api.get(`/admin/managers/${id}/stats`).then(res => res.data),
    
  // Dashboard
  getDashboardOverview: () =>
    api.get('/admin/dashboard/overview').then(res => res.data),
    
  // Initial Admin
  createInitialAdmin: (data: any) =>
    api.post('/admin/create-initial-admin', data).then(res => res.data),
};