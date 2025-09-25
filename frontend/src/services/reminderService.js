import api from './api';

const reminderService = {
  // Obtener todos los recordatorios
  getReminders: async () => {
    try {
      const response = await api.get('/reminders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Crear un nuevo recordatorio
  createReminder: async (reminderData) => {
    try {
      const response = await api.post('/reminders/', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Actualizar un recordatorio
  updateReminder: async (id, reminderData) => {
    try {
      const response = await api.put(`/reminders/${id}/`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // Eliminar un recordatorio
  deleteReminder: async (id) => {
    try {
      await api.delete(`/reminders/${id}/`);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  // Obtener recordatorios por fecha
  getRemindersByDate: async (date) => {
    try {
      const response = await api.get(`/reminders/?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders by date:', error);
      throw error;
    }
  }
};

export default reminderService;