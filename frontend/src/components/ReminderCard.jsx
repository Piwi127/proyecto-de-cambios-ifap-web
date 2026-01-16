import React from 'react';

const statusLabels = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

const priorityStyles = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ReminderCard = ({ reminder, onEdit, onDelete, onStatusChange, compact = false }) => {
  return (
    <div className={`border rounded-lg p-4 shadow-sm bg-white ${compact ? '' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{reminder.title}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyles[reminder.priority] || priorityStyles.medium}`}
            >
              {reminder.priority || 'medium'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{formatDateTime(reminder.reminder_date)}</p>
          {!compact && reminder.description && (
            <p className="text-sm text-gray-700 mt-2">{reminder.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <select
            value={reminder.status || 'pending'}
            onChange={(event) => onStatusChange?.(reminder.id, event.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="pending">{statusLabels.pending}</option>
            <option value="completed">{statusLabels.completed}</option>
            <option value="cancelled">{statusLabels.cancelled}</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(reminder)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(reminder.id)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      {compact && reminder.description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{reminder.description}</p>
      )}
    </div>
  );
};

export default ReminderCard;
