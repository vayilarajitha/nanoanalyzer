import axios from 'axios';
import { getUserId } from './authService';

const DEFAULT_API_URL = 'https://nanoanalyzer.onrender.com';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach user authentication headers automatically
apiClient.interceptors.request.use(async (config) => {
  try {
    const userId = await getUserId();
    if (userId) {
      config.headers['X-User-ID'] = userId;
      config.headers['Authorization'] = `Bearer ${userId}`;
    }
  } catch (e) {
    // Ignore error retrieving user id
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const { clearSession } = await import('./authService');
        await clearSession();
      } catch (e) {
        // Ignore
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/api/auth.php', { action: 'login', email, password });
    return res.data;
  },

  register: async (name, email, password) => {
    const res = await apiClient.post('/api/auth.php', { action: 'register', name, email, password });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('/api/auth.php', { action: 'forgot_password', email });
    return res.data;
  },

  verifyOTP: async (email, otpCode) => {
    const res = await apiClient.post('/api/auth.php', { action: 'verify_otp', email, otp_code: otpCode });
    return res.data;
  },

  confirmResetPassword: async (email, otpCode, newPassword) => {
    const res = await apiClient.post('/api/auth.php', {
      action: 'confirm_reset_password',
      email,
      otp_code: otpCode,
      new_password: newPassword,
    });
    return res.data;
  },

  logout: async () => {
    try {
      const res = await apiClient.post('/api/auth.php', { action: 'logout' });
      return res.data;
    } catch (e) {
      return { status: 'success' };
    }
  },

  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get('/api/dashboard.php');
    return res.data;
  },

  // Prediction / Analysis
  runAnalysis: async (params) => {
    const res = await apiClient.post('/api/predict.php', params);
    return res.data;
  },

  // Results
  getResults: async (id = null) => {
    const url = id ? `/api/results.php?id=${encodeURIComponent(id)}` : '/api/results.php';
    const res = await apiClient.get(url);
    return res.data;
  },

  // History
  getHistory: async () => {
    const res = await apiClient.get('/api/history.php');
    return res.data;
  },

  deleteHistory: async (id) => {
    const res = await apiClient.delete(`/api/history.php?id=${encodeURIComponent(id)}`, {
      data: { id },
    });
    return res.data;
  },

  deleteResult: async (id) => {
    const res = await apiClient.delete(`/api/results.php?id=${encodeURIComponent(id)}`, {
      data: { id },
    });
    return res.data;
  },

  // Datasets
  getDatasets: async () => {
    const res = await apiClient.get('/api/datasets.php');
    return res.data;
  },

  uploadDataset: async (formData) => {
    const res = await apiClient.post('/api/datasets.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteDataset: async (id) => {
    const res = await apiClient.delete(`/api/datasets.php?id=${encodeURIComponent(id)}`, {
      data: { id },
    });
    return res.data;
  },

  // Experiments
  getExperiments: async () => {
    const res = await apiClient.get('/api/experiments.php');
    return res.data;
  },

  createExperiment: async (expData) => {
    const res = await apiClient.post('/api/experiments.php', expData);
    return res.data;
  },

  deleteExperiment: async (id) => {
    const res = await apiClient.delete(`/api/experiments.php?id=${encodeURIComponent(id)}`, {
      data: { id },
    });
    return res.data;
  },

  // Reports
  getReports: async () => {
    const res = await apiClient.get('/api/results.php');
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get('/api/notifications.php');
    return res.data;
  },

  // User Profile
  getUserProfile: async () => {
    const res = await apiClient.get('/api/user.php');
    return res.data;
  },

  updateUserProfile: async (formData) => {
    const res = await apiClient.post('/api/user.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // AI Chatbot
  getAIChatHistory: async () => {
    const res = await apiClient.get('/api/chatbot.php');
    return res.data;
  },

  sendAIChatMessage: async (message) => {
    const res = await apiClient.post('/api/chatbot.php', { message });
    return res.data;
  },
};

export default api;
