import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService.js';
import AdminLoadingStates from './AdminLoadingStates.jsx';

const AdminCourseDetailModal = ({ course, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [courseHistory, setCourseHistory] = useState([]);

  useEffect(() => {
    if (isOpen && course) {
      loadDetailedData();
    }
  }, [isOpen, course]);

  const loadDetailedData = async () => {
    setLoading(true);
    try {
      const [stats, progress, history] = await Promise.all([
        courseService.getCourseMetrics(course.id),
        courseService.getStudentProgress(course.id),
        courseService.getCourseHistory(course.id)
      ]);

      setDetailedStats(stats);
      setStudentProgress(progress);
      setCourseHistory(history);
    } catch (error) {
      console.error('Error loading detailed course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'students', label: 'Estudiantes', icon: '👥' },
    { id: 'progress', label: 'Progreso', icon: '📈' },
    { id: 'history', label: 'Historial', icon: '📋' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800'
    };

    const labels = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'draft': 'Borrador',
      'archived': 'Archivado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        badges[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[status] || status}
      </span>
    );
  };

  const getModalityBadge = (modality) => {
    const badges = {
      'online': 'bg-blue-100 text-blue-800',
      'presencial': 'bg-purple-100 text-purple-800',
      'hibrido': 'bg-indigo-100 text-indigo-800'
    };

    const labels = {
      'online': 'En línea',
      'presencial': 'Presencial',
      'hibrido': 'Híbrido'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        badges[modality] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[modality] || 'N/A'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(course.is_active ? 'active' : 'inactive')}
                {getModalityBadge(course.modality)}
                <span className="text-sm text-gray-500">
                  ID: {course.id}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {loading ? (
            <AdminLoadingStates.ChartSkeleton height="h-96" />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Instructor:</span>
                        <p className="text-sm text-gray-900">{course.instructor_name || 'Sin asignar'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Descripción:</span>
                        <p className="text-sm text-gray-900 mt-1">{course.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Fecha de creación:</span>
                        <p className="text-sm text-gray-900">{formatDate(course.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Última actualización:</span>
                        <p className="text-sm text-gray-900">{formatDate(course.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {detailedStats?.total_students || course.students_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Estudiantes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {detailedStats?.completed_lessons || course.lessons_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Lecciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {detailedStats?.completion_rate || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Tasa de completitud</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {detailedStats?.average_rating || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">Calificación promedio</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Estudiantes Inscritos ({studentProgress.length})
                    </h3>
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estudiante
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progreso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Última actividad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentProgress.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${student.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {student.progress || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(student.last_activity)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(student.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Análisis de Progreso</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {detailedStats?.completion_rate || 0}%
                      </div>
                      <div className="text-sm text-blue-600">Tasa de completitud general</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">
                        {detailedStats?.active_students || 0}
                      </div>
                      <div className="text-sm text-green-600">Estudiantes activos</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">
                        {detailedStats?.average_time || 'N/A'}
                      </div>
                      <div className="text-sm text-purple-600">Tiempo promedio</div>
                    </div>
                  </div>

                  {/* Progress Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Distribución de Progreso</h4>
                    <div className="text-center text-gray-500">
                      Gráfico de distribución de progreso de estudiantes
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Historial de Cambios ({courseHistory.length})
                  </h3>

                  <div className="space-y-3">
                    {courseHistory.map((entry, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              entry.type === 'create' ? 'bg-green-400' :
                              entry.type === 'update' ? 'bg-blue-400' :
                              entry.type === 'activate' ? 'bg-green-400' :
                              entry.type === 'deactivate' ? 'bg-yellow-400' :
                              entry.type === 'delete' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {entry.action}
                              </div>
                              <div className="text-sm text-gray-500">
                                por {entry.user} • {formatDate(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          {entry.details && (
                            <div className="text-sm text-gray-600">
                              {entry.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Configuración del Curso</h3>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">Funcionalidad en desarrollo</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          La configuración detallada del curso estará disponible en futuras actualizaciones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cerrar
          </button>
          <button
            onClick={() => onUpdate && onUpdate(course)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Actualizar Curso
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetailModal;