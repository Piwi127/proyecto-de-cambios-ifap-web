import { api, handleApiError } from './api.js';

export const userService = {
  // Obtener lista de usuarios (solo para administradores)
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener usuarios por rol
  async getUsersByRole(role) {
    try {
      const response = await api.get(`/users/list_by_role/?role=${role}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener resumen de roles
  async getRoleSummary() {
    try {
      const response = await api.get('/users/role_summary/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar rol de usuario
  async updateUserRole(userId, role) {
    try {
      const response = await api.patch(`/users/${userId}/update_role/`, { role });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener detalles de un usuario específico
  async getUserDetails(userId) {
    try {
      const response = await api.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener multiples usuarios por IDs
  async getUsersByIds(userIds = []) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];
    const uniqueIds = [...new Set(userIds)].filter(Boolean);

    const results = await Promise.allSettled(
      uniqueIds.map((id) => api.get(`/users/${id}/`))
    );

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value.data);
  },

  // Crear nuevo usuario (solo para administradores)
  async createUser(userData) {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar usuario
  async updateUser(userId, userData) {
    try {
      const response = await api.patch(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Eliminar usuario (solo para administradores)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verificar permisos del usuario actual
  hasPermission(user, permission) {
    if (!user) return false;
    
    switch (permission) {
      case 'manage_users':
        return user.is_superuser === true;
      case 'manage_courses':
        return user.is_instructor === true || user.is_superuser === true;
      case 'view_reports':
        return user.is_instructor === true || user.is_superuser === true;
      case 'system_config':
        return user.is_superuser === true;
      default:
        return false;
    }
  },

  // Obtener rol del usuario
  getUserRole(user) {
    if (!user) return 'guest';
    if (user.is_superuser) return 'admin';
    if (user.is_instructor) return 'instructor';
    if (user.is_student) return 'student';
    return 'user';
  },

  // Verificar si el usuario puede acceder a una ruta
  canAccessRoute(user, route) {
    const role = this.getUserRole(user);
    
    const routePermissions = {
      '/aula-virtual/user-management': ['admin'],
      '/aula-virtual/dashboard-profesor': ['instructor', 'admin'],
      '/aula-virtual/gestionar-cursos': ['instructor', 'admin'],
      '/aula-virtual/calificaciones': ['instructor', 'admin'],
      '/aula-virtual/reportes': ['admin'],
      '/aula-virtual/configuracion-sistema': ['admin'],
    };

    const requiredRoles = routePermissions[route];
    return !requiredRoles || requiredRoles.includes(role);
  }
};
