import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const BulkOperations = ({
  selectedCourses,
  currentCourses,
  onClose,
  onOperation,
  onSuccess
}) => {
  const [operation, setOperation] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [operationResults, setOperationResults] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const selectedCourseObjects = currentCourses.filter(course =>
    selectedCourses.includes(course.id)
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!onClose) {
      setOperation('');
      setReason('');
      setOperationResults(null);
      setShowConfirmDialog(false);
    }
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!operation) {
      alert('Selecciona una operación');
      return;
    }

    setShowConfirmDialog(true);
  };

  const executeOperation = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const result = await onOperation(operation, reason);
      setOperationResults(result);

      if (onSuccess) {
        onSuccess(result);
      }

      // Auto-close after successful operation
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      alert('Error al realizar la operación masiva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOperationLabel = (op) => {
    switch (op) {
      case 'activate': return 'Activar';
      case 'deactivate': return 'Desactivar';
      case 'delete': return 'Eliminar';
      default: return op;
    }
  };

  const getOperationDescription = (op) => {
    switch (op) {
      case 'activate':
        return 'Los cursos seleccionados serán activados y estarán disponibles para los estudiantes.';
      case 'deactivate':
        return 'Los cursos seleccionados serán desactivados y no estarán disponibles para nuevos estudiantes.';
      case 'delete':
        return 'Los cursos seleccionados serán eliminados permanentemente. Esta acción no se puede deshacer.';
      default:
        return '';
    }
  };

  const getOperationIcon = (op) => {
    switch (op) {
      case 'activate':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deactivate':
        return (
          <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getAffectedCoursesSummary = () => {
    const active = selectedCourseObjects.filter(c => c.is_active).length;
    const inactive = selectedCourseObjects.filter(c => !c.is_active).length;

    return { active, inactive, total: selectedCourseObjects.length };
  };

  const summary = getAffectedCoursesSummary();

  // Confirmation Dialog Component
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            {getOperationIcon(operation)}
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Confirmar operación
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas <strong>{getOperationLabel(operation).toLowerCase()}</strong> {selectedCourses.length} cursos?
            </p>

            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between mb-1">
                  <span>Total de cursos:</span>
                  <span className="font-medium">{summary.total}</span>
                </div>
                {operation === 'activate' && summary.inactive > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>Cursos inactivos:</span>
                    <span className="font-medium text-green-600">{summary.inactive}</span>
                  </div>
                )}
                {operation === 'deactivate' && summary.active > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>Cursos activos:</span>
                    <span className="font-medium text-yellow-600">{summary.active}</span>
                  </div>
                )}
                {reason && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">Motivo:</div>
                    <div className="text-sm text-gray-700">{reason}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={executeOperation}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                operation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Results Dialog Component
  const ResultsDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Operación completada
            </h3>
          </div>

          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                {operationResults?.message || 'Operación completada exitosamente'}
              </p>
              {operationResults?.processed && (
                <div className="mt-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Cursos procesados:</span>
                    <span className="font-medium">{operationResults.processed}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (operationResults) {
    return <ResultsDialog />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Operaciones Masivas Avanzadas
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Selected Courses Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-3">
                Cursos seleccionados ({selectedCourses.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {selectedCourseObjects.map(course => (
                  <div key={course.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                    <span className="text-blue-700 truncate">{course.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operation Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Operación a realizar
                  </label>
                  <div className="space-y-3">
                    <PermissionCheck permission="activate_courses">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="operation"
                          value="activate"
                          checked={operation === 'activate'}
                          onChange={(e) => setOperation(e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          {getOperationIcon('activate')}
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">Activar cursos</div>
                            <div className="text-xs text-gray-500">Hacer cursos disponibles para estudiantes</div>
                          </div>
                        </div>
                      </label>
                    </PermissionCheck>

                    <PermissionCheck permission="deactivate_courses">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="operation"
                          value="deactivate"
                          checked={operation === 'deactivate'}
                          onChange={(e) => setOperation(e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          {getOperationIcon('deactivate')}
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">Desactivar cursos</div>
                            <div className="text-xs text-gray-500">Ocultar cursos de nuevos estudiantes</div>
                          </div>
                        </div>
                      </label>
                    </PermissionCheck>

                    <PermissionCheck permission="delete_courses">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="operation"
                          value="delete"
                          checked={operation === 'delete'}
                          onChange={(e) => setOperation(e.target.value)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          {getOperationIcon('delete')}
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">Eliminar cursos</div>
                            <div className="text-xs text-gray-500">Eliminar permanentemente (no reversible)</div>
                          </div>
                        </div>
                      </label>
                    </PermissionCheck>
                  </div>
                </div>

                {/* Operation Details */}
                <div>
                  {operation && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Detalles de la operación
                      </h4>
                      <div className={`p-4 rounded-md ${
                        operation === 'delete'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-start">
                          {getOperationIcon(operation)}
                          <div className="ml-3">
                            <h4 className={`text-sm font-medium ${
                              operation === 'delete' ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              {getOperationLabel(operation)} cursos
                            </h4>
                            <p className={`mt-1 text-sm ${
                              operation === 'delete' ? 'text-red-700' : 'text-blue-700'
                            }`}>
                              {getOperationDescription(operation)}
                            </p>
                            <div className="mt-3 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Cursos afectados:</span>
                                <span className="font-medium">{summary.total}</span>
                              </div>
                              {operation === 'activate' && summary.inactive > 0 && (
                                <div className="flex justify-between">
                                  <span>Serán activados:</span>
                                  <span className="font-medium text-green-600">{summary.inactive}</span>
                                </div>
                              )}
                              {operation === 'deactivate' && summary.active > 0 && (
                                <div className="flex justify-between">
                                  <span>Serán desactivados:</span>
                                  <span className="font-medium text-yellow-600">{summary.active}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo (opcional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Describe el motivo de esta operación masiva..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!operation || loading}
                  className={`px-6 py-2 rounded-md text-white ${
                    operation === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                      : 'bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400'
                  } disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    `${getOperationLabel(operation)} ${selectedCourses.length} cursos`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && <ConfirmDialog />}
    </>
  );
};

export default BulkOperations;
