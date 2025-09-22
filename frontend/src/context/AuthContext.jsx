import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService.js';

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
        setLoading(true);
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
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
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
      await authService.register(userData);

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

  // ========== ROLE AND PERMISSION HELPERS ==========

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;

    switch (role) {
      case 'admin':
      case 'superuser':
        return user.is_superuser === true;
      case 'instructor':
        return user.is_instructor === true;
      case 'student':
        return user.is_student === true;
      default:
        return false;
    }
  };

  // Check if user can manage courses (admin or instructor)
  const canManageCourses = () => {
    return hasRole('admin') || hasRole('instructor');
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user can perform admin operations
  const canPerformAdminOperations = () => {
    return hasRole('admin');
  };

  // Check if user can access course management features
  const canAccessCourseManagement = () => {
    return hasRole('admin') || hasRole('instructor');
  };

  // Check if user can access admin panel
  const canAccessAdminPanel = () => {
    return hasRole('admin');
  };

  // Get user roles as array
  const getUserRoles = () => {
    if (!user) return [];

    const roles = [];
    if (user.is_superuser) roles.push('admin', 'superuser');
    if (user.is_instructor) roles.push('instructor');
    if (user.is_student) roles.push('student');

    return roles;
  };

  // Check multiple roles at once
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  // Check if user has all specified roles
  const hasAllRoles = (roles) => {
    return roles.every(role => hasRole(role));
  };

  // Get user permissions based on roles
  const getUserPermissions = () => {
    const permissions = [];

    if (hasRole('admin')) {
      permissions.push(
        'manage_courses',
        'manage_users',
        'view_admin_panel',
        'manage_system_settings',
        'view_reports',
        'activate_courses',
        'deactivate_courses',
        'delete_courses',
        'transfer_courses',
        'bulk_operations'
      );
    }

    if (hasRole('instructor')) {
      permissions.push(
        'create_courses',
        'edit_own_courses',
        'view_course_metrics',
        'manage_course_students'
      );
    }

    if (hasRole('student')) {
      permissions.push(
        'enroll_courses',
        'view_courses',
        'take_quizzes',
        'view_grades'
      );
    }

    return permissions;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  // Validate permissions for specific operations
  const validatePermission = (permission, operation = '') => {
    if (!hasPermission(permission)) {
      throw new Error(`No tienes permisos para realizar esta operación: ${operation || permission}`);
    }
  };

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!user) return null;

    return {
      name: user.get_full_name || user.username || 'Usuario',
      email: user.email || '',
      roles: getUserRoles(),
      permissions: getUserPermissions(),
      isAdmin: hasRole('admin'),
      isInstructor: hasRole('instructor'),
      isStudent: hasRole('student')
    };
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
    // Role and permission helpers
    hasRole,
    canManageCourses,
    isAdmin,
    canPerformAdminOperations,
    canAccessCourseManagement,
    canAccessAdminPanel,
    getUserRoles,
    hasAnyRole,
    hasAllRoles,
    getUserPermissions,
    hasPermission,
    validatePermission,
    getUserDisplayInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;