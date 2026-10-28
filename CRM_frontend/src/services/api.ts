import axios from 'axios';
import keycloak from './keycloak';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: attach Keycloak Bearer token and refresh if near expiry
apiClient.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated && keycloak.token) {
      try {
        // Refresh token if it expires in less than 30 seconds
        await keycloak.updateToken(30);
      } catch (err) {
        console.warn('Token refresh failed', err);
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
      localStorage.setItem('crm_token', keycloak.token);
    } else {
      const storedToken = localStorage.getItem('crm_token');
      if (storedToken && config.headers) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        window.dispatchEvent(new CustomEvent('crm:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
