import React from 'react';
import Card from './Card';

const ReminderCard = ({ reminder, onEdit, onDelete, onStatusChange, compact = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card variant="default" className={`${compact ? 'p-4' : 'p-6'} cursor-pointer hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{reminder.title}</h3>
          {reminder.description && (
            <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(reminder);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(reminder.id);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
          {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Media' : 'Baja'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
          {reminder.status === 'completed' ? 'Completado' : reminder.status === 'pending' ? 'Pendiente' : 'Vencido'}
        </span>
      </div>

      <div className="text-sm text-gray-500">
        <div className="flex items-center gap-1 mb-1">
          📅 {formatDate(reminder.due_date)}
        </div>
        {reminder.due_time && (
          <div className="flex items-center gap-1">
            🕐 {formatTime(`${reminder.due_date}T${reminder.due_time}`)}
          </div>
        )}
      </div>

      {reminder.status !== 'completed' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(reminder.id, 'completed');
          }}
          className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Marcar como completado
        </button>
      )}
    </Card>
  );
};

export default ReminderCard;