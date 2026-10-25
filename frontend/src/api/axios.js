import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config._skipAuth) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PUBLIC_API = ['/competitions', '/matches', '/cafes', '/businesses', '/payments/config', '/auth'];

function isPublicApi(url = '') {
  return PUBLIC_API.some((prefix) => url.includes(prefix));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config || {};

    if ((status === 401 || status === 403) && isPublicApi(config.url) && !config._retryPublic) {
      config._retryPublic = true;
      config._skipAuth = true;
      if (config.headers) {
        delete config.headers.Authorization;
      }
      if (status === 401) {
        authStorage.clear();
      }
      return api.request(config);
    }

    if (status === 401) {
      authStorage.clear();
      const path = window.location.pathname;
      const isPublicPage = path === '/'
        || path === '/login'
        || path === '/register'
        || path.startsWith('/matches')
        || path.startsWith('/cafes');

      if (!isPublicPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;