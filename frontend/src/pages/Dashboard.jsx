import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import Card from '../components/Card';

const Dashboard = () => {
  const { logout } = useAuth();
  const { myCourses, loading, error, fetchMyCourses } = useCourse();

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  // Use real data from CourseContext, fallback to empty array if loading
  const enrolledCourses = myCourses || [];

  const upcomingActivities = [
    {
      id: 1,
      type: 'Tarea',
      title: 'Análisis de Archivo Colonial',
      course: 'Archivos Históricos del Perú',
      dueDate: '2025-09-20',
      priority: 'high'
    },
    {
      id: 2,
      type: 'Examen',
      title: 'Evaluación Final',
      course: 'Archivística Básica',
      dueDate: '2025-09-25',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'Foro',
      title: 'Discusión: Preservación Digital',
      course: 'Gestión Digital de Archivos',
      dueDate: '2025-09-18',
      priority: 'low'
    }
  ];

  const recentResources = [
    {
      id: 1,
      title: 'Guía de Clasificación Archivística',
      type: 'PDF',
      course: 'Archivística Básica',
      uploaded: '2025-09-15'
    },
    {
      id: 2,
      title: 'Normas ISO para Archivos Digitales',
      type: 'Documento',
      course: 'Gestión Digital de Archivos',
      uploaded: '2025-09-14'
    },
    {
      id: 3,
      title: 'Presentación: Archivo General de la Nación',
      type: 'PPT',
      course: 'Archivos Históricos del Perú',
      uploaded: '2025-09-13'
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IFAP</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">Aula Virtual IFAP</h1>
                <p className="text-sm text-neutral-500">Bienvenido, Estudiante</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <span className="text-xl">🔔</span>
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido al Aula Virtual!</h2>
          <p className="text-primary-100">
            Continúa tu formación en archivística con los mejores recursos y profesores especializados.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mis Cursos */}
            <Card className="animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Mis Cursos</h3>
                <a href="#" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Ver todos →
                </a>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Cargando cursos...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-2xl mb-4">⚠️</div>
                    <p className="text-neutral-600 mb-4">Error al cargar los cursos</p>
                    <button 
                      onClick={fetchMyCourses}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-neutral-400 text-4xl mb-4">📚</div>
                    <p className="text-neutral-600">No tienes cursos inscritos aún</p>
                    <p className="text-neutral-500 text-sm">Explora nuestro catálogo para comenzar tu aprendizaje</p>
                  </div>
                ) : (
                  enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-neutral-900">{course.title}</h4>
                          <p className="text-sm text-neutral-600">Prof. {course.instructor}</p>
                        </div>
                        <span className="text-sm font-medium text-primary-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600">Próxima lección: {course.next_lesson_title}</span>
                        <button className="text-primary-600 hover:text-primary-800 font-medium">
                          Continuar →
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        {course.completed_lessons}/{course.total_lessons} lecciones • {course.completed_quizzes}/{course.total_quizzes} quizzes
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recursos Recientes */}
                        {/* Recursos Recientes */}
            <Card className="animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recursos Recientes</h3>
              <div className="space-y-3">
                {recentResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {resource.type === 'PDF' ? '📄' : resource.type === 'PPT' ? '📊' : '📝'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{resource.title}</p>
                        <p className="text-sm text-neutral-600">{resource.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">{resource.uploaded}</p>
                      <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Próximas Actividades */}
            <Card className="animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Próximas Actividades</h3>
              <div className="space-y-4">
                {upcomingActivities.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">{activity.title}</p>
                        <p className="text-sm text-neutral-600">{activity.course}</p>
                        <p className="text-xs text-neutral-500">Vence: {activity.dueDate}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                        activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Estadísticas Rápidas */}
            <Card className="animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Mi Progreso</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Cursos inscritos</span>
                  <span className="font-medium">{enrolledCourses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Lecciones completadas</span>
                  <span className="font-medium">
                    {enrolledCourses.reduce((total, course) => total + (course.completed_lessons || 0), 0)}/
                    {enrolledCourses.reduce((total, course) => total + (course.total_lessons || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Quizzes completados</span>
                  <span className="font-medium">
                    {enrolledCourses.reduce((total, course) => total + (course.completed_quizzes || 0), 0)}/
                    {enrolledCourses.reduce((total, course) => total + (course.total_quizzes || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Progreso promedio</span>
                  <span className="font-medium text-green-600">
                    {enrolledCourses.length > 0 
                      ? Math.round(enrolledCourses.reduce((total, course) => total + (course.progress || 0), 0) / enrolledCourses.length)
                      : 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Enlaces Rápidos */}
            <Card className="animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Enlaces Rápidos</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600">
                  <span>📚</span>
                  <span className="text-sm">Biblioteca Virtual</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600">
                  <span>💬</span>
                  <span className="text-sm">Foros de Discusión</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600">
                  <span>📝</span>
                  <span className="text-sm">Mis Tareas</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600">
                  <span>🎓</span>
                  <span className="text-sm">Certificaciones</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600">
                  <span>📞</span>
                  <span className="text-sm">Soporte Técnico</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
