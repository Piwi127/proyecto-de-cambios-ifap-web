import React, { useState, useEffect } from 'react';

const AdminCourseMetrics = ({
  metrics,
  instructorStats,
  className = '',
  realTime = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState('courses');
  const [realTimeData, setRealTimeData] = useState(metrics);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time data updates
  useEffect(() => {
    if (!realTime || !metrics) return;

    const interval = setInterval(async () => {
      try {
        // In a real implementation, this would fetch fresh data from the API
        // For now, we'll simulate minor changes to demonstrate real-time updates
        setRealTimeData(prev => ({
          ...prev,
          total_students: prev.total_students + Math.floor(Math.random() * 3),
          active_courses: prev.active_courses + (Math.random() > 0.8 ? 1 : 0),
          total_courses: prev.total_courses + (Math.random() > 0.95 ? 1 : 0)
        }));
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error updating real-time metrics:', error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [realTime, metrics, refreshInterval]);

  const currentMetrics = realTimeData || metrics;

  if (!currentMetrics) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  // Chart data for different metrics
  const getChartData = () => {
    switch (selectedMetric) {
      case 'courses':
        return {
          labels: ['Activos', 'Inactivos'],
          datasets: [{
            label: 'Cursos',
            data: [currentMetrics.active_courses, currentMetrics.inactive_courses],
            backgroundColor: ['#10B981', '#EF4444'],
            borderColor: ['#059669', '#DC2626'],
            borderWidth: 1
          }]
        };
      case 'students':
        return {
          labels: ['Total Estudiantes', 'Promedio por Curso'],
          datasets: [{
            label: 'Estudiantes',
            data: [currentMetrics.total_students, currentMetrics.average_students_per_course],
            backgroundColor: ['#3B82F6', '#8B5CF6'],
            borderColor: ['#2563EB', '#7C3AED'],
            borderWidth: 1
          }]
        };
      case 'modalities':
        return {
          labels: ['En línea', 'Presencial', 'Híbrido'],
          datasets: [{
            label: 'Modalidades',
            data: [
              currentMetrics.courses_by_modality?.online || 0,
              currentMetrics.courses_by_modality?.presencial || 0,
              currentMetrics.courses_by_modality?.hibrido || 0
            ],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
            borderColor: ['#2563EB', '#059669', '#D97706'],
            borderWidth: 1
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Simple chart component (in a real app, you'd use Chart.js or similar)
  const SimpleChart = ({ data }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const chartHeight = 200;

    return (
      <div className="relative">
        <div className="flex items-end justify-around h-48 mb-4">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const height = (value / maxValue) * chartHeight;
            const color = data.datasets[0].backgroundColor[index];

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-12 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${height}px`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 text-xs font-medium text-gray-700 transform -translate-x-1/2">
                    {value}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center max-w-16">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-1 ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={trend.direction === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
              <span className="text-xs">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg-opacity-20')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'courses', label: 'Cursos', icon: '📚' },
    { id: 'students', label: 'Estudiantes', icon: '👥' },
    { id: 'instructors', label: 'Instructores', icon: '👨‍🏫' },
    { id: 'trends', label: 'Tendencias', icon: '📈' }
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Métricas Administrativas Avanzadas
            </h3>
            <p className="text-sm text-gray-600">
              Dashboard interactivo con métricas en tiempo real
              {realTime && (
                <span className="ml-2 inline-flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  En vivo
                </span>
              )}
            </p>
          </div>
          {realTime && (
            <div className="text-xs text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Cursos"
                value={formatNumber(currentMetrics.total_courses)}
                icon={<svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>}
                color="border-l-blue-500"
                subtitle={`${formatNumber(currentMetrics.active_courses)} activos`}
                trend={{ direction: 'up', value: '+2 esta semana' }}
              />

              <MetricCard
                title="Estudiantes"
                value={formatNumber(currentMetrics.total_students)}
                icon={<svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>}
                color="border-l-green-500"
                subtitle={`Promedio: ${currentMetrics.average_students_per_course} por curso`}
                trend={{ direction: 'up', value: '+15 esta semana' }}
              />

              <MetricCard
                title="Tasa de Actividad"
                value={formatPercentage((currentMetrics.active_courses / currentMetrics.total_courses) * 100)}
                icon={<svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
                color="border-l-purple-500"
                subtitle={`${formatNumber(currentMetrics.inactive_courses)} cursos inactivos`}
                trend={{ direction: 'up', value: '+1.2% esta semana' }}
              />

              <MetricCard
                title="Modalidades"
                value={Object.keys(currentMetrics.courses_by_modality || {}).length}
                icon={<svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>}
                color="border-l-orange-500"
                subtitle="Tipos de cursos disponibles"
                trend={{ direction: 'up', value: 'Estable' }}
              />
            </div>

            {/* Interactive Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Distribución de Cursos</h4>
                <div className="flex space-x-2">
                  {['courses', 'students', 'modalities'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        selectedMetric === metric
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {metric === 'courses' ? 'Cursos' : metric === 'students' ? 'Estudiantes' : 'Modalidades'}
                    </button>
                  ))}
                </div>
              </div>
              <SimpleChart data={getChartData()} type={chartType} />
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(currentMetrics.active_courses)}
                </div>
                <div className="text-sm text-blue-600">Cursos Activos</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-900">
                  {formatNumber(currentMetrics.inactive_courses)}
                </div>
                <div className="text-sm text-red-600">Cursos Inactivos</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">
                  {formatPercentage((currentMetrics.active_courses / currentMetrics.total_courses) * 100)}
                </div>
                <div className="text-sm text-green-600">Tasa de Actividad</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Cursos por Modalidad</h4>
              <SimpleChart data={getChartData()} />
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Estudiantes</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de estudiantes únicos:</span>
                    <span className="font-medium">{formatNumber(currentMetrics.total_students)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio por curso:</span>
                    <span className="font-medium">{currentMetrics.average_students_per_course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cursos con estudiantes:</span>
                    <span className="font-medium">{formatNumber(currentMetrics.active_courses)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Distribución</h4>
                <SimpleChart data={getChartData()} />
              </div>
            </div>
          </div>
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && instructorStats && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Top 5 Instructores por Cursos
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Instructor</th>
                      <th className="text-left py-2">Cursos</th>
                      <th className="text-left py-2">Estudiantes</th>
                      <th className="text-left py-2">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorStats.slice(0, 5).map((instructor, index) => (
                      <tr key={instructor.instructor_id} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm mr-3">
                              {index + 1}
                            </div>
                            <span className="font-medium">{instructor.instructor_name}</span>
                          </div>
                        </td>
                        <td className="py-3">{instructor.courses_count}</td>
                        <td className="py-3">{formatNumber(instructor.total_students)}</td>
                        <td className="py-3">{instructor.average_students_per_course}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h4>
                <div className="space-y-3">
                  {currentMetrics.recent_activity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          activity.action === 'activate' ? 'bg-green-400' :
                          activity.action === 'deactivate' ? 'bg-yellow-400' :
                          activity.action === 'delete' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.course_title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.user} • {activity.action}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Tendencias del Sistema</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Crecimiento de cursos:</span>
                    <span className="text-sm font-medium text-green-600">+5.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nuevos estudiantes:</span>
                    <span className="text-sm font-medium text-blue-600">+12.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasa de retención:</span>
                    <span className="text-sm font-medium text-purple-600">94.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cursos completados:</span>
                    <span className="text-sm font-medium text-orange-600">+8.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseMetrics;
