// Servicio para manejar el envío del formulario de contacto
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const contactService = {
  // Enviar formulario de contacto
  async sendContactForm(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending contact form:', error);
      throw error;
    }
  },

  // Obtener información de contacto
  async getContactInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/info/`);
      if (!response.ok) {
        throw new Error('Error al obtener información de contacto');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Retornar datos por defecto si falla la API
      return {
        address: 'Av. Principal 123, Lima, Perú',
        phone: '+51 1 234 5678',
        email: 'info@ifap.edu.pe',
        hours: 'Lunes - Viernes: 8:00 AM - 6:00 PM'
      };
    }
  }
};

export default contactService;