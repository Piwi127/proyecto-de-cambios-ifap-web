import React, { useState } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const CourseAdminCard = ({
  course,
  isSelected,
  onSelect,
  onActivate,
  onDeactivate,
  onDelete,
  onTransfer
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const handleAction = (action, reason = '') => {
    setShowConfirmDialog(null);
    switch (action) {
      case 'activate':
        onActivate(course.id, reason);
        break;
      case 'deactivate':
        onDeactivate(course.id, reason);
        break;
      case 'delete':
        onDelete(course.id, reason);
        break;
      default:
        break;
    }
  };

  const ConfirmDialog = ({ action, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');

    const actionLabels = {
      activate: 'activar',
      deactivate: 'desactivar',
      delete: 'eliminar'
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onConfirm(reason);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar {actionLabels[action]} curso
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas {actionLabels[action]} el curso "{course.title}"?
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Describe el motivo de esta acción..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-white ${
                    action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-200 ${
          isSelected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-primary-300'
        }`}
      >
        {/* Selection Checkbox */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(course.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">
                Seleccionar
              </span>
            </label>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {course.is_active ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Instructor: {course.instructor_name || 'No asignado'}
              </p>
            </div>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-600">
                {course.students_count || 0}
              </div>
              <div className="text-xs text-gray-500">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-600">
                {course.lessons_count || 0}
              </div>
              <div className="text-xs text-gray-500">Lecciones</div>
            </div>
          </div>

          {/* Modality Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {course.modality === 'online' ? 'En línea' :
               course.modality === 'presencial' ? 'Presencial' :
               course.modality === 'hibrido' ? 'Híbrido' : 'No especificado'}
            </span>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <PermissionCheck permission="activate_courses">
                  <button
                    onClick={() => setShowConfirmDialog('activate')}
                    disabled={!course.is_active}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Activar
                  </button>
                </PermissionCheck>

                <PermissionCheck permission="deactivate_courses">
                  <button
                    onClick={() => setShowConfirmDialog('deactivate')}
                    disabled={course.is_active}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Desactivar
                  </button>
                </PermissionCheck>

                <PermissionCheck permission="transfer_courses">
                  <button
                    onClick={() => onTransfer(course)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Transferir
                  </button>
                </PermissionCheck>

                <PermissionCheck permission="delete_courses">
                  <button
                    onClick={() => setShowConfirmDialog('delete')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </PermissionCheck>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          action={showConfirmDialog}
          onConfirm={handleAction}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
    </>
  );
};

export default CourseAdminCard;
