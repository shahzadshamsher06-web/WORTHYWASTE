import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (phoneData) => api.post('/auth/login', phoneData),
  getUser: (userId) => api.get(`/auth/user/${userId}`),
};

// Inventory API calls
export const inventoryAPI = {
  add: (foodData) => api.post('/inventory/add', foodData),
  list: (userId) => api.get(`/inventory/list/${userId}`),
  update: (id, updateData) => api.put(`/inventory/${id}`, updateData),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Classification API calls
export const classifyAPI = {
  classify: (formData) => api.post('/classify/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getCategories: () => api.get('/classify/categories'),
  deleteImage: (filename) => api.delete(`/classify/image/${filename}`),
};

// Marketplace API calls
export const marketplaceAPI = {
  getBuyers: (params = {}) => api.get('/marketplace/buyers', { params }),
  createTransaction: (transactionData) => api.post('/marketplace/transaction', transactionData),
  getTransactions: (userId, params = {}) => api.get(`/marketplace/transactions/${userId}`, { params }),
  updateTransactionStatus: (id, statusData) => api.put(`/marketplace/transaction/${id}/status`, statusData),
};

// Analytics API calls
export const analyticsAPI = {
  getUserSummary: (userId) => api.get(`/analytics/user/${userId}`),
  getLeaderboard: (params = {}) => api.get('/analytics/leaderboard', { params }),
  getGlobalStats: () => api.get('/analytics/global'),
  getMonthlyTrends: () => api.get('/analytics/trends'),
  getAchievements: (userId) => api.get(`/analytics/achievements/${userId}`),
};

// Health check
export const healthAPI = {
  check: () => axios.get('http://localhost:5000/health'),
};

export default api;
