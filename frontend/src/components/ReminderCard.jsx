import React from 'react';

const ReminderCard = ({ reminder, onEdit, onDelete, onComplete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  };

  const isOverdue = () => {
    const now = new Date();
    const reminderDate = new Date(reminder.reminder_date);
    return reminderDate < now && !reminder.is_completed;
  };

  const isUpcoming = () => {
    const now = new Date();
    const reminderDate = new Date(reminder.reminder_date);
    const timeDiff = reminderDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24 && hoursDiff > 0 && !reminder.is_completed;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 mb-3 transition-all hover:shadow-lg ${
      reminder.is_completed 
        ? 'border-l-green-500 opacity-75' 
        : isOverdue() 
          ? 'border-l-red-500' 
          : isUpcoming() 
            ? 'border-l-yellow-500' 
            : 'border-l-blue-500'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${
            reminder.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {reminder.title}
          </h3>
          
          {reminder.description && (
            <p className={`text-sm mt-1 ${
              reminder.is_completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {reminder.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Badge de prioridad */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(reminder.priority)}`}>
            {getPriorityText(reminder.priority)}
          </span>

          {/* Estado */}
          {reminder.is_completed && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
              Completado
            </span>
          )}
          
          {isOverdue() && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
              Vencido
            </span>
          )}
          
          {isUpcoming() && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              Próximo
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(reminder.reminder_date)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {!reminder.is_completed && (
            <>
              <button
                onClick={() => onComplete(reminder.id)}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                title="Marcar como completado"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <button
                onClick={() => onEdit(reminder)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Editar recordatorio"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(reminder.id)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Eliminar recordatorio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;