import axios from 'axios';
import errorHandler from './errorHandler';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL_ALT = import.meta.env.VITE_API_URL_ALT || 'http://localhost:8001/api';
const API_BASE_URL_ALT2 = import.meta.env.VITE_API_URL_ALT2 || 'http://localhost:8003/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejar error con nuestro sistema centralizado
    errorHandler.handleAPIError(error, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      endpoint: 'api_interceptor'
    });

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/users/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        
        // Store new tokens
        localStorage.setItem('access_token', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Función para obtener información del error (mantenida por compatibilidad)
const handleApiError = (error) => {
  return errorHandler.handleAPIError(error);
};

export { api, handleApiError };