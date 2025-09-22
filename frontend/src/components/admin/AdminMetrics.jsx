import React from 'react';

const AdminMetrics = ({ metrics, instructorStats, className = '' }) => {
  if (!metrics) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Métricas Administrativas
        </h3>
        <p className="text-sm text-gray-600">
          Resumen general del sistema de cursos
        </p>
      </div>

      <div className="p-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(metrics.total_courses)}
                </div>
                <div className="text-sm text-blue-600">
                  Total de cursos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-900">
                  {formatNumber(metrics.active_courses)}
                </div>
                <div className="text-sm text-green-600">
                  Cursos activos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-900">
                  {formatNumber(metrics.inactive_courses)}
                </div>
                <div className="text-sm text-red-600">
                  Cursos inactivos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-purple-900">
                  {formatNumber(metrics.total_students)}
                </div>
                <div className="text-sm text-purple-600">
                  Estudiantes únicos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Promedio de estudiantes por curso
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.average_students_per_course}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Tasa de actividad
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage((metrics.active_courses / metrics.total_courses) * 100)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Cursos por modalidad
            </div>
            <div className="text-sm text-gray-900">
              <div className="flex justify-between">
                <span>En línea:</span>
                <span className="font-medium">{metrics.courses_by_modality.online || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Presencial:</span>
                <span className="font-medium">{metrics.courses_by_modality.presencial || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Híbrido:</span>
                <span className="font-medium">{metrics.courses_by_modality.hibrido || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Statistics */}
        {instructorStats && instructorStats.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Estadísticas por Instructor
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cursos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cursos Activos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instructorStats.slice(0, 5).map((instructor, index) => (
                    <tr key={instructor.instructor_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {instructor.instructor_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.courses_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(instructor.total_students)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.active_courses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.average_students_per_course}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {instructorStats.length > 5 && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">
                  Mostrando 5 de {instructorStats.length} instructores
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {metrics.recent_activity && metrics.recent_activity.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Actividad Reciente
            </h4>
            <div className="space-y-3">
              {metrics.recent_activity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.action === 'activate' ? 'bg-green-400' :
                        activity.action === 'deactivate' ? 'bg-yellow-400' :
                        activity.action === 'delete' ? 'bg-red-400' :
                        activity.action === 'transfer' ? 'bg-blue-400' :
                        'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.course_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.user} • {activity.action}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMetrics;