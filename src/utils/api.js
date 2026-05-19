import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ppk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ppk_token');
      localStorage.removeItem('ppk_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // Instant suspension detected — redirect to checkpoint
    if (error.response?.status === 403 && error.response?.data?.status === 'suspended') {
      if (!window.location.pathname.includes('/checkpoint')) {
        window.location.href = '/checkpoint';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
