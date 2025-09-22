import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminBulkOperations = ({
  selectedCourses,
  currentCourses,
  onClose,
  onOperation,
  onSuccess
}) => {
  const [operation, setOperation] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [operationResults, setOperationResults] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [operationType, setOperationType] = useState('basic'); // 'basic' or 'advanced'
  const [advancedOptions, setAdvancedOptions] = useState({
    scheduleOperation: false,
    scheduleDate: '',
    notifyInstructors: true,
    createBackup: true,
    sendNotifications: true
  });

  const selectedCourseObjects = currentCourses.filter(course =>
    selectedCourses.includes(course.id)
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!onClose) {
      resetState();
    }
  }, [onClose]);

  const resetState = () => {
    setOperation('');
    setReason('');
    setPreviewMode(false);
    setOperationResults(null);
    setShowConfirmDialog(false);
    setProgress(0);
    setCurrentStep('');
    setOperationType('basic');
    setAdvancedOptions({
      scheduleOperation: false,
      scheduleDate: '',
      notifyInstructors: true,
      createBackup: true,
      sendNotifications: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!operation) {
      alert('Selecciona una operación');
      return;
    }

    if (operationType === 'advanced') {
      setPreviewMode(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const executeOperation = async () => {
    setLoading(true);
    setShowConfirmDialog(false);
    setProgress(0);
    setCurrentStep('Iniciando operación...');

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setCurrentStep('Procesando cursos...');
      const result = await onOperation(operation, reason, advancedOptions);

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep('Completado');
      setOperationResults(result);

      if (onSuccess) {
        onSuccess(result);
      }

      // Auto-close after successful operation
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      alert('Error al realizar la operación masiva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOperationLabel = (op) => {
    const labels = {
      activate: 'Activar',
      deactivate: 'Desactivar',
      delete: 'Eliminar',
      duplicate: 'Duplicar',
      transfer: 'Transferir',
      update_category: 'Cambiar Categoría',
      update_level: 'Cambiar Nivel',
      update_modality: 'Cambiar Modalidad',
      set_price: 'Establecer Precio',
      set_capacity: 'Establecer Capacidad'
    };
    return labels[op] || op;
  };

  const getOperationDescription = (op) => {
    const descriptions = {
      activate: 'Los cursos seleccionados serán activados y estarán disponibles para los estudiantes.',
      deactivate: 'Los cursos seleccionados serán desactivados y no estarán disponibles para nuevos estudiantes.',
      delete: 'Los cursos seleccionados serán eliminados permanentemente. Esta acción no se puede deshacer.',
      duplicate: 'Se crearán copias de los cursos seleccionados con un nuevo identificador.',
      transfer: 'Los cursos serán transferidos a un nuevo instructor.',
      update_category: 'Se actualizará la categoría de todos los cursos seleccionados.',
      update_level: 'Se actualizará el nivel de dificultad de todos los cursos seleccionados.',
      update_modality: 'Se actualizará la modalidad (online/presencial/híbrido) de todos los cursos seleccionados.',
      set_price: 'Se establecerá un precio específico para todos los cursos seleccionados.',
      set_capacity: 'Se establecerá una capacidad máxima de estudiantes para todos los cursos seleccionados.'
    };
    return descriptions[op] || '';
  };

  const getOperationIcon = (op) => {
    const icons = {
      activate: (
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      deactivate: (
        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      delete: (
        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      duplicate: (
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      transfer: (
        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      update_category: (
        <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      update_level: (
        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      update_modality: (
        <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      set_price: (
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      set_capacity: (
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    };
    return icons[op] || null;
  };

  const getAffectedCoursesSummary = () => {
    const active = selectedCourseObjects.filter(c => c.is_active).length;
    const inactive = selectedCourseObjects.filter(c => !c.is_active).length;
    const total = selectedCourseObjects.length;

    return { active, inactive, total };
  };

  const summary = getAffectedCoursesSummary();

  // Preview Dialog Component
  const PreviewDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Vista Previa de Operación Masiva
            </h3>
            <button
              onClick={() => setPreviewMode(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Operation Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              {getOperationIcon(operation)}
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-blue-800">
                  {getOperationLabel(operation)} {selectedCourses.length} cursos
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  {getOperationDescription(operation)}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-blue-600">
                  <div className="flex justify-between">
                    <span>Total de cursos:</span>
                    <span className="font-medium">{summary.total}</span>
                  </div>
                  {summary.active > 0 && (
                    <div className="flex justify-between">
                      <span>Cursos activos:</span>
                      <span className="font-medium text-green-600">{summary.active}</span>
                    </div>
                  )}
                  {summary.inactive > 0 && (
                    <div className="flex justify-between">
                      <span>Cursos inactivos:</span>
                      <span className="font-medium text-red-600">{summary.inactive}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Courses List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Cursos que se verán afectados ({selectedCourses.length})
            </h4>
            <div className="max-h-60 overflow-y-auto border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                {selectedCourseObjects.map(course => (
                  <div key={course.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <div className="flex-1 truncate">
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-xs text-gray-500">{course.instructor_name}</div>
                    </div>
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
          </div>

          {/* Advanced Options */}
          {operationType === 'advanced' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-800 mb-3">Opciones Avanzadas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {advancedOptions.scheduleOperation && (
                  <div className="flex justify-between">
                    <span>Programado para:</span>
                    <span className="font-medium">{new Date(advancedOptions.scheduleDate).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Notificar instructores:</span>
                  <span className="font-medium">{advancedOptions.notifyInstructors ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crear respaldo:</span>
                  <span className="font-medium">{advancedOptions.createBackup ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enviar notificaciones:</span>
                  <span className="font-medium">{advancedOptions.sendNotifications ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          {reason && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Motivo de la operación</h4>
              <p className="text-sm text-gray-600">{reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              Volver a editar
            </button>
            <button
              onClick={() => {
                setPreviewMode(false);
                setShowConfirmDialog(true);
              }}
              className={`px-6 py-2 rounded-md text-white ${
                operation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
              disabled={loading}
            >
              Confirmar operación
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  // Progress Dialog Component
  const ProgressDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            {getOperationIcon(operation)}
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Ejecutando operación
            </h3>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  operation === 'delete' ? 'bg-red-600' : 'bg-primary-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center">{currentStep}</p>
            <p className="text-xs text-gray-500 text-center mt-1">{progress}% completado</p>
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

  if (loading) {
    return <ProgressDialog />;
  }

  if (previewMode) {
    return <PreviewDialog />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
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

            {/* Operation Type Selection */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setOperationType('basic')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    operationType === 'basic'
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Operaciones Básicas
                </button>
                <button
                  onClick={() => setOperationType('advanced')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    operationType === 'advanced'
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Operaciones Avanzadas
                </button>
              </div>
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
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Basic Operations */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operaciones Básicas</h5>

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

                    {/* Advanced Operations */}
                    {operationType === 'advanced' && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operaciones Avanzadas</h5>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="duplicate"
                            checked={operation === 'duplicate'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('duplicate')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Duplicar cursos</div>
                              <div className="text-xs text-gray-500">Crear copias de los cursos seleccionados</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="transfer"
                            checked={operation === 'transfer'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('transfer')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Transferir cursos</div>
                              <div className="text-xs text-gray-500">Cambiar instructor de los cursos</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="update_category"
                            checked={operation === 'update_category'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('update_category')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Cambiar categoría</div>
                              <div className="text-xs text-gray-500">Actualizar categoría de todos los cursos</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="update_level"
                            checked={operation === 'update_level'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('update_level')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Cambiar nivel</div>
                              <div className="text-xs text-gray-500">Actualizar nivel de dificultad</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="update_modality"
                            checked={operation === 'update_modality'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('update_modality')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Cambiar modalidad</div>
                              <div className="text-xs text-gray-500">Actualizar tipo de curso</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="set_price"
                            checked={operation === 'set_price'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('set_price')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Establecer precio</div>
                              <div className="text-xs text-gray-500">Definir precio para todos los cursos</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="operation"
                            value="set_capacity"
                            checked={operation === 'set_capacity'}
                            onChange={(e) => setOperation(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            {getOperationIcon('set_capacity')}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">Establecer capacidad</div>
                              <div className="text-xs text-gray-500">Definir límite de estudiantes</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operation Details and Advanced Options */}
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Options */}
                  {operationType === 'advanced' && operation && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones avanzadas</h4>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={advancedOptions.scheduleOperation}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              scheduleOperation: e.target.checked
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Programar operación</span>
                        </label>

                        {advancedOptions.scheduleOperation && (
                          <div className="ml-6">
                            <input
                              type="datetime-local"
                              value={advancedOptions.scheduleDate}
                              onChange={(e) => setAdvancedOptions(prev => ({
                                ...prev,
                                scheduleDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        )}

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={advancedOptions.notifyInstructors}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              notifyInstructors: e.target.checked
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Notificar a instructores</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={advancedOptions.createBackup}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              createBackup: e.target.checked
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Crear respaldo antes de la operación</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={advancedOptions.sendNotifications}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              sendNotifications: e.target.checked
                            }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enviar notificaciones a estudiantes</span>
                        </label>
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
                    operationType === 'advanced' ? 'Vista previa' : `${getOperationLabel(operation)} ${selectedCourses.length} cursos`
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

export default AdminBulkOperations;