import { api } from './api';

const reminderService = {
  // Obtener todos los recordatorios del usuario autenticado
  async getReminders() {
    try {
      const response = await api.get('/reminders/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recordatorios:', error);
      throw error;
    }
  },

  // Crear un nuevo recordatorio
  async createReminder(reminderData) {
    try {
      const response = await api.post('/reminders/', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      throw error;
    }
  },

  // Actualizar un recordatorio existente
  async updateReminder(id, reminderData) {
    try {
      const response = await api.put(`/reminders/${id}/`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
      throw error;
    }
  },

  // Eliminar un recordatorio
  async deleteReminder(id) {
    try {
      const response = await api.delete(`/reminders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
      throw error;
    }
  },

  // Obtener recordatorios próximos (próximos 7 días)
  async getUpcomingReminders() {
    try {
      const response = await api.get('/reminders/upcoming/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recordatorios próximos:', error);
      throw error;
    }
  },

  // Obtener recordatorios vencidos
  async getOverdueReminders() {
    try {
      const response = await api.get('/reminders/overdue/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener recordatorios vencidos:', error);
      throw error;
    }
  },

  // Marcar recordatorio como completado
  async markAsCompleted(id) {
    try {
      const response = await api.post(`/reminders/${id}/mark_completed/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar recordatorio como completado:', error);
      throw error;
    }
  },

  // Obtener un recordatorio específico
  async getReminder(id) {
    try {
      const response = await api.get(`/reminders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener recordatorio:', error);
      throw error;
    }
  }
};

export default reminderService;