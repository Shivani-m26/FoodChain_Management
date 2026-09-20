import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Detect Vercel single-page application route rewrite serving index.html for API requests
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype')) {
      return Promise.reject(new Error('HTML_RESPONSE_FROM_REWRITE'));
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userContext');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default axiosClient;
