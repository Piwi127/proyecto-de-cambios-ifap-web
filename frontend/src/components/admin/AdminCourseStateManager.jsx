import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminCourseStateManager = ({
  course,
  onClose,
  onStateChange,
  onSuccess
}) => {
  const [currentState, setCurrentState] = useState(course?.status || 'draft');
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransition, setPendingTransition] = useState(null);
  const [statePolicies, setStatePolicies] = useState({
    autoTransition: true,
    notifyInstructors: true,
    notifyStudents: false,
    requireReason: true
  });

  // Course states configuration
  const courseStates = {
    draft: {
      label: 'Borrador',
      description: 'Curso en preparación, no visible para estudiantes',
      color: 'gray',
      icon: '📝',
      allowedTransitions: ['review', 'published']
    },
    review: {
      label: 'En Revisión',
      description: 'Curso pendiente de aprobación',
      color: 'yellow',
      icon: '👀',
      allowedTransitions: ['draft', 'published', 'rejected']
    },
    published: {
      label: 'Publicado',
      description: 'Curso visible pero no disponible para inscripción',
      color: 'blue',
      icon: '📋',
      allowedTransitions: ['active', 'draft', 'archived']
    },
    active: {
      label: 'Activo',
      description: 'Curso disponible para inscripción y estudio',
      color: 'green',
      icon: '✅',
      allowedTransitions: ['completed', 'inactive', 'published']
    },
    inactive: {
      label: 'Inactivo',
      description: 'Curso temporalmente no disponible',
      color: 'orange',
      icon: '⏸️',
      allowedTransitions: ['active', 'archived']
    },
    completed: {
      label: 'Completado',
      description: 'Curso terminado, estudiantes pueden ver contenido',
      color: 'purple',
      icon: '🏁',
      allowedTransitions: ['active', 'archived']
    },
    archived: {
      label: 'Archivado',
      description: 'Curso archivado, no visible para nuevos estudiantes',
      color: 'gray',
      icon: '📦',
      allowedTransitions: ['published']
    },
    rejected: {
      label: 'Rechazado',
      description: 'Curso rechazado, requiere modificaciones',
      color: 'red',
      icon: '❌',
      allowedTransitions: ['draft', 'review']
    }
  };

  // Auto-transition rules based on dates
  const autoTransitionRules = {
    published_to_active: {
      condition: (course) => {
        const now = new Date();
        const startDate = new Date(course.start_date);
        return course.status === 'published' && startDate <= now;
      },
      newState: 'active',
      description: 'Transición automática cuando llega la fecha de inicio'
    },
    active_to_completed: {
      condition: (course) => {
        const now = new Date();
        const endDate = new Date(course.end_date);
        return course.status === 'active' && endDate <= now;
      },
      newState: 'completed',
      description: 'Transición automática cuando llega la fecha de fin'
    },
    active_to_inactive: {
      condition: (course) => {
        const now = new Date();
        const enrollmentEndDate = new Date(course.enrollment_end_date);
        return course.status === 'active' && enrollmentEndDate <= now && course.enrolled_students < course.max_students * 0.5;
      },
      newState: 'inactive',
      description: 'Transición automática por baja inscripción'
    }
  };

  useEffect(() => {
    if (course) {
      setCurrentState(course.status || 'draft');
      calculateAvailableTransitions();
      checkAutoTransitions();
    }
  }, [course]);

  const calculateAvailableTransitions = () => {
    const currentStateConfig = courseStates[currentState];
    if (currentStateConfig) {
      setAvailableTransitions(currentStateConfig.allowedTransitions || []);
    }
  };

  const checkAutoTransitions = () => {
    if (!course || !statePolicies.autoTransition) return;

    const applicableRules = Object.values(autoTransitionRules).filter(rule =>
      rule.condition(course)
    );

    if (applicableRules.length > 0) {
      // Show notification about available auto-transitions
      console.log('Auto-transitions disponibles:', applicableRules);
    }
  };

  const handleStateTransition = (newState) => {
    if (!availableTransitions.includes(newState)) {
      alert('Transición no permitida desde el estado actual');
      return;
    }

    setPendingTransition(newState);
    setShowConfirmDialog(true);
  };

  const executeStateTransition = async () => {
    if (!pendingTransition) return;

    setLoading(true);
    setShowConfirmDialog(false);

    try {
      // Here you would call the API to change the course state
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = {
        success: true,
        message: `Curso "${course.title}" cambiado a estado "${courseStates[pendingTransition].label}"`,
        newState: pendingTransition,
        timestamp: new Date().toISOString()
      };

      if (onStateChange) {
        onStateChange(pendingTransition, reason);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      setCurrentState(pendingTransition);
      setReason('');
      setPendingTransition(null);

      // Recalculate available transitions
      setTimeout(() => {
        calculateAvailableTransitions();
      }, 100);

    } catch (error) {
      console.error('Error changing course state:', error);
      alert('Error al cambiar el estado del curso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeAutoTransition = async (rule) => {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        success: true,
        message: `Transición automática aplicada: ${rule.description}`,
        newState: rule.newState,
        rule: rule,
        timestamp: new Date().toISOString()
      };

      if (onStateChange) {
        onStateChange(rule.newState, `Transición automática: ${rule.description}`);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      setCurrentState(rule.newState);

      setTimeout(() => {
        calculateAvailableTransitions();
      }, 100);

    } catch (error) {
      console.error('Error executing auto transition:', error);
      alert('Error al ejecutar transición automática: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStateColorClasses = (state) => {
    const colors = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[courseStates[state]?.color] || colors.gray;
  };

  const getCurrentStateConfig = () => {
    return courseStates[currentState] || courseStates.draft;
  };

  const getApplicableAutoTransitions = () => {
    if (!course || !statePolicies.autoTransition) return [];

    return Object.values(autoTransitionRules).filter(rule =>
      rule.condition(course)
    );
  };

  const currentStateConfig = getCurrentStateConfig();
  const applicableAutoTransitions = getApplicableAutoTransitions();

  // Confirmation Dialog Component
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{currentStateConfig.icon}</span>
            <h3 className="text-lg font-medium text-gray-900">
              Confirmar cambio de estado
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas cambiar el curso <strong>"{course?.title}"</strong> de estado <strong>{currentStateConfig.label}</strong> a <strong>{courseStates[pendingTransition]?.label}</strong>?
            </p>

            {statePolicies.requireReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del cambio
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Describe el motivo del cambio de estado..."
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Estado actual:</div>
                <div className="flex items-center">
                  <span className="mr-2">{currentStateConfig.icon}</span>
                  <span>{currentStateConfig.label} - {currentStateConfig.description}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingTransition(null);
                setReason('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={executeStateTransition}
              disabled={loading || (statePolicies.requireReason && !reason.trim())}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Confirmar cambio'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Gestión de Estados del Curso
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

            {/* Current Course Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{course?.title}</h4>
                  <p className="text-sm text-gray-500">{course?.instructor_name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm border ${getStateColorClasses(currentState)}`}>
                  <span className="mr-2">{currentStateConfig.icon}</span>
                  {currentStateConfig.label}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current State */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Estado Actual</h4>
                <div className={`p-4 rounded-md border ${getStateColorClasses(currentState)}`}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{currentStateConfig.icon}</span>
                    <div>
                      <h5 className="font-medium">{currentStateConfig.label}</h5>
                      <p className="text-sm opacity-75">{currentStateConfig.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Transitions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Transiciones Disponibles</h4>
                <div className="space-y-2">
                  {availableTransitions.map(transition => {
                    const targetState = courseStates[transition];
                    return (
                      <PermissionCheck key={transition} permission="manage_course_states">
                        <button
                          onClick={() => handleStateTransition(transition)}
                          className={`w-full p-3 rounded-md border text-left transition-colors ${
                            targetState.color === 'red'
                              ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-800'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                          }`}
                          disabled={loading}
                        >
                          <div className="flex items-center">
                            <span className="mr-3">{targetState.icon}</span>
                            <div>
                              <div className="font-medium">{targetState.label}</div>
                              <div className="text-sm opacity-75">{targetState.description}</div>
                            </div>
                          </div>
                        </button>
                      </PermissionCheck>
                    );
                  })}

                  {availableTransitions.length === 0 && (
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-500 text-center">
                        No hay transiciones disponibles desde el estado actual
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auto Transitions */}
            {applicableAutoTransitions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Transiciones Automáticas Disponibles</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-yellow-800 mb-2">
                        Transiciones automáticas detectadas
                      </h5>
                      <div className="space-y-2">
                        {applicableAutoTransitions.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-yellow-200">
                            <div>
                              <div className="text-sm font-medium text-yellow-800">
                                {courseStates[rule.newState]?.label}
                              </div>
                              <div className="text-xs text-yellow-700">
                                {rule.description}
                              </div>
                            </div>
                            <button
                              onClick={() => executeAutoTransition(rule)}
                              disabled={loading}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:bg-gray-400"
                            >
                              Aplicar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State Policies */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Configuración de Políticas</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statePolicies.autoTransition}
                      onChange={(e) => setStatePolicies(prev => ({
                        ...prev,
                        autoTransition: e.target.checked
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Transiciones automáticas por fecha</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statePolicies.notifyInstructors}
                      onChange={(e) => setStatePolicies(prev => ({
                        ...prev,
                        notifyInstructors: e.target.checked
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificar cambios a instructores</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statePolicies.notifyStudents}
                      onChange={(e) => setStatePolicies(prev => ({
                        ...prev,
                        notifyStudents: e.target.checked
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notificar cambios a estudiantes</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statePolicies.requireReason}
                      onChange={(e) => setStatePolicies(prev => ({
                        ...prev,
                        requireReason: e.target.checked
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requerir motivo para cambios manuales</span>
                  </label>
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
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && <ConfirmDialog />}
    </>
  );
};

export default AdminCourseStateManager;