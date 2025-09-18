import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar y validar token al cargar la aplicación
  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          // Verificar token con el servidor obteniendo el usuario actual
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          // Actualizar datos del usuario en localStorage
          localStorage.setItem('user_data', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token inválido, limpiar datos
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    validateTokenAndFetchUser();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const responseData = await authService.login(credentials);

      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', responseData.tokens.access);
      localStorage.setItem('refresh_token', responseData.tokens.refresh);
      localStorage.setItem('user_data', JSON.stringify(responseData.user));

      setUser(responseData.user);
      setIsAuthenticated(true);

      return { success: true, message: 'Login exitoso' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Limpiar datos de autenticación en caso de error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      setIsAuthenticated(false);
      
      throw new Error(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const responseData = await authService.register(userData);

      return {
        success: true,
        message: 'Usuario registrado exitosamente. Ahora puede iniciar sesión.'
      };
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Intentar logout en el servidor
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continuamos con el logout local aunque falle en el servidor
    }
    
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    setUser(null);
    setIsAuthenticated(false);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Actualizar datos del usuario desde el servidor
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user_data', JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    getAuthHeaders,
    refreshUser,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;