import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import Card from '../components/Card';
import UserRoleDisplay from '../components/UserRoleDisplay';
import RoleBasedStats from '../components/RoleBasedStats';
import RoleBasedActions from '../components/RoleBasedActions';
import { useNavigate } from 'react-router-dom';

const DashboardAulaVirtual = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cursosInscritos: 0,
    cursosCompletados: 0,
    horasEstudiadas: 0,
    promedioGeneral: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const upcomingActivities = [
    {
      id: 1,
      type: 'Tarea',
      title: 'Análisis de Archivo Colonial',
      course: 'Archivos Históricos del Perú',
      dueDate: '2025-09-20',
      priority: 'alta',
      icon: '📝',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      type: 'Examen',
      title: 'Evaluación de Archivística Básica',
      course: 'Archivística Básica',
      dueDate: '2025-09-18',
      priority: 'media',
      icon: '📊',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      type: 'Lectura',
      title: 'Capítulo 5: Preservación Digital',
      course: 'Gestión Digital de Archivos',
      dueDate: '2025-09-16',
      priority: 'baja',
      icon: '📖',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Primer curso completado',
      description: '¡Felicitaciones! Has completado tu primer curso',
      date: '2025-09-10',
      icon: '🎉',
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      id: 2,
      title: 'Racha de estudio',
      description: 'Has estudiado 7 días seguidos',
      date: '2025-09-08',
      icon: '🔥',
      color: 'from-orange-400 to-orange-500'
    },
    {
      id: 3,
      title: 'Participación activa',
      description: 'Has contribuido en 5 discusiones del foro',
      date: '2025-09-05',
      icon: '💬',
      color: 'from-blue-400 to-blue-500'
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [myCourses] = await Promise.all([
          courseService.getMyCourses()
        ]);

        setEnrolledCourses(myCourses || []);

        // Calcular estadísticas reales
        setStats({
          cursosInscritos: myCourses?.length || 0,
          cursosCompletados: myCourses?.filter(course => course.progress === 100).length || 0,
          horasEstudiadas: myCourses?.reduce((total, course) => total + (course.duration_hours || 0), 0) || 0,
          promedioGeneral: 8.5 // Esto vendría de la API cuando se implementen calificaciones
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con bienvenida */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                ¡Hola, {user?.first_name || user?.username}! 👋
              </h1>
              <UserRoleDisplay showFullInfo={true} className="bg-white/20 text-white border-white/30" />
            </div>
            <p className="text-primary-100 text-lg">
              {user?.is_superuser 
                ? "Panel de administración del sistema. Gestiona usuarios y configuraciones."
                : user?.is_instructor 
                ? "Panel de docente. Gestiona tus cursos y estudiantes."
                : "Bienvenido de vuelta a tu aula virtual. ¿Qué vamos a aprender hoy?"
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-primary-200 text-sm">
                {user?.is_instructor ? 'Instructor IFAP' : 'Estudiante IFAP'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales basadas en rol */}
      <RoleBasedStats />

      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda - Cursos y actividades */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mis Cursos */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                Mis Cursos
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Ver todos →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => {
                  const courseColors = [
                    'from-blue-500 to-blue-600',
                    'from-green-500 to-green-600',
                    'from-purple-500 to-purple-600',
                    'from-orange-500 to-orange-600',
                    'from-red-500 to-red-600'
                  ];
                  const courseIcons = ['📄', '💻', '🏛️', '📊', '📚'];
                  const randomColor = courseColors[course.id % courseColors.length];
                  const randomIcon = courseIcons[course.id % courseIcons.length];
                  
                  return (
                    <div key={course.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${randomColor} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                          {randomIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Instructor: {course.instructor_name || 'Por asignar'}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progreso</span>
                              <span className="font-medium text-gray-900">
                                {course.is_enrolled ? 'Inscrito' : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${randomColor} transition-all duration-500`}
                                style={{ width: course.is_enrolled ? '100%' : '0%' }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Modalidad: {course.modality || 'Virtual'}
                            </span>
                            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                              {course.is_enrolled ? 'Continuar →' : 'Inscribirse'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No estás inscrito en ningún curso
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Explora nuestro catálogo de cursos y comienza tu formación archivística
                  </p>
                  <button
                    onClick={() => navigate('/aula-virtual/cursos')}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                  >
                    Explorar Cursos
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Actividades próximas */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">📅</span>
                Actividades Próximas
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Ver calendario →
              </button>
            </div>

            <div className="space-y-4">
              {upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.course}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activity.color}`}>
                      {activity.priority.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(activity.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Columna derecha - Logros y acciones rápidas */}
        <div className="space-y-8">
          {/* Logros recientes */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-3">🏆</span>
              Logros Recientes
            </h2>

            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className={`w-10 h-10 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Acciones rápidas basadas en rol */}
          <RoleBasedActions />

          {/* Motivación del día */}
          <Card variant="primary" className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">¡Sigue adelante!</h3>
            <p className="text-gray-600 text-sm">
              "El aprendizaje es un tesoro que seguirá a su dueño a todas partes."
            </p>
            <p className="text-xs text-gray-500 mt-2">- Proverbio chino</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardAulaVirtual;