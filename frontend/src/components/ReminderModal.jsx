import React, { useState, useEffect } from 'react';
import reminderService from '../services/reminderService';

const ReminderModal = ({ isOpen, onClose, onSave, editingReminder = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingReminder) {
      setFormData({
        title: editingReminder.title || '',
        description: editingReminder.description || '',
        reminder_date: editingReminder.reminder_date ? 
          new Date(editingReminder.reminder_date).toISOString().slice(0, 16) : '',
        priority: editingReminder.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        reminder_date: '',
        priority: 'medium'
      });
    }
    setErrors({});
  }, [editingReminder, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.reminder_date) {
      newErrors.reminder_date = 'La fecha y hora son requeridas';
    } else {
      const reminderDate = new Date(formData.reminder_date);
      const now = new Date();
      if (reminderDate <= now) {
        newErrors.reminder_date = 'La fecha debe ser en el futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let savedReminder;
      if (editingReminder) {
        savedReminder = await reminderService.updateReminder(editingReminder.id, formData);
      } else {
        savedReminder = await reminderService.createReminder(formData);
      }
      
      onSave(savedReminder);
      onClose();
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
      setErrors({ submit: 'Error al guardar el recordatorio. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Título del recordatorio"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Descripción del recordatorio (opcional)"
            />
          </div>

          {/* Fecha y hora */}
          <div>
            <label htmlFor="reminder_date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora *
            </label>
            <input
              type="datetime-local"
              id="reminder_date"
              name="reminder_date"
              value={formData.reminder_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.reminder_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reminder_date && (
              <p className="mt-1 text-sm text-red-600">{errors.reminder_date}</p>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (editingReminder ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;