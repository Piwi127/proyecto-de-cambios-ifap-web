import { api, handleApiError } from './api';

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/users/login/', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/users/register/', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout user
  async logout(refreshToken) {
    try {
      const response = await api.post('/users/logout/', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      // Even if logout fails on server, we clear local storage
      throw handleApiError(error);
    }
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/users/refresh/', { refresh: refreshToken });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.patch('/users/me/', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post('/users/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/users/password-reset/', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Confirm password reset
  async confirmPasswordReset(uid, token, newPassword) {
    try {
      const response = await api.post('/users/password-reset-confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};