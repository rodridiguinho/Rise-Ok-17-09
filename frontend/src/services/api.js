import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Configurar interceptor para adicionar token automaticamente
const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Transactions API
export const transactionsAPI = {
  getSummary: async () => {
    const response = await api.get('/transactions/summary');
    return response.data;
  },
  
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },
  
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/transactions/categories');
    return response.data;
  },
  
  getPaymentMethods: async () => {
    const response = await api.get('/transactions/payment-methods');
    return response.data;
  }
};

// Reports API
export const reportsAPI = {
  getSummary: async (params = {}) => {
    const response = await api.get('/reports/summary', { params });
    return response.data;
  },
  
  getCategoryAnalysis: async (params = {}) => {
    const response = await api.get('/reports/category', { params });
    return response.data;
  },
  
  exportPDF: async (params = {}) => {
    const response = await api.post('/reports/export/pdf', params);
    return response.data;
  },
  
  exportExcel: async (params = {}) => {
    const response = await api.post('/reports/export/excel', params);
    return response.data;
  }
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
  
  resetSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
  
  exportData: async () => {
    const response = await api.get('/settings/export-data');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

export default api;