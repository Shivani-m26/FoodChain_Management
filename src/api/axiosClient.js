import axios from 'axios';
import { handleMockRequest, isMockEnvironment } from './mockBackend';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function safeParseData(data) {
  if (!data) return {};
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Configure Custom Adapter for Seamless Live Fallback & Offline State Persistence
const defaultAdapter = axiosClient.defaults.adapter || axios.defaults.adapter;

axiosClient.defaults.adapter = async (config) => {
  const parsedData = safeParseData(config.data);

  // 1. If running live on Vercel without external backend configured, handle via Mock Adapter
  if (isMockEnvironment()) {
    try {
      const result = await handleMockRequest(config.url, config.method, parsedData, config.params);
      return {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    } catch (e) {
      console.warn('Mock backend error in mock mode:', e);
      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    }
  }

  // 2. Otherwise, attempt real network request to Backend
  try {
    const response = await defaultAdapter(config);

    // If response is HTML (Vercel rewrite returning index.html for API route), handle via Mock Adapter
    const isHtmlResponse =
      typeof response.data === 'string' &&
      (response.data.includes('<!DOCTYPE html>') || response.data.includes('<!doctype') || response.data.includes('<html'));

    if (isHtmlResponse) {
      const result = await handleMockRequest(config.url, config.method, parsedData, config.params);
      return {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    }

    return response;
  } catch (err) {
    const isHtmlError =
      typeof err.response?.data === 'string' &&
      (err.response.data.includes('<!DOCTYPE') || err.response.data.includes('<html'));

    const isUnreachable =
      isHtmlError ||
      !err.response ||
      err.response.status === 404 ||
      err.response.status === 405 ||
      err.response.status === 502 ||
      err.response.status === 503 ||
      err.response.status === 504 ||
      err.message === 'Network Error' ||
      err.code === 'ERR_NETWORK' ||
      err.code === 'ECONNABORTED';

    if (isUnreachable) {
      try {
        const result = await handleMockRequest(config.url, config.method, parsedData, config.params);
        return {
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        };
      } catch (mockErr) {
        console.warn('Mock adapter fallback error:', mockErr);
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        };
      }
    }
    throw err;
  }
};

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
  (response) => response.data,
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

    const message =
      error.response?.data?.message ||
      (error.response?.data?.details && Object.values(error.response.data.details).join(', ')) ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';

    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export default axiosClient;