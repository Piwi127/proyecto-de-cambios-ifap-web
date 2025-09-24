import { api, handleApiError } from './api.js';

export const dashboardService = {
  // Obtener estadísticas del dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/users/dashboard_stats/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener actividad reciente (placeholder para futuro desarrollo)
  async getRecentActivity() {
    try {
      // Por ahora retornamos datos de ejemplo hasta que se implemente en el backend
      return [
        {
          id: 1,
          type: 'user_registered',
          message: 'Nuevo usuario registrado',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          icon: '👤'
        },
        {
          id: 2,
          type: 'course_created',
          message: 'Nuevo curso creado',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          icon: '📚'
        },
        {
          id: 3,
          type: 'quiz_completed',
          message: 'Quiz completado por estudiantes',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
          icon: '✅'
        },
        {
          id: 4,
          type: 'system_backup',
          message: 'Backup del sistema completado',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          icon: '💾'
        }
      ];
    } catch (error) {
      throw handleApiError(error);
    }
  }
};