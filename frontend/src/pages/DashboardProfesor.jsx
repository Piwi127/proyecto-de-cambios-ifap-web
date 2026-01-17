import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { connectWebSocket, disconnectWebSocket } from '../services/notificationService';
import Card from '../components/Card';

const DashboardProfesor = () => {
  const { user } = useAuth();
  const [taughtCourses, setTaughtCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setMetricsError(null);
        const courses = await courseService.getTaughtCourses();

        const defaultMetrics = {
          total_students: 0,
          average_progress: 0,
          average_score: 0,
        };

        const metricsResults = await Promise.allSettled(
          courses.map(async (course) => {
            const metrics = await courseService.getCourseMetrics(course.id);
            return { ...course, metrics };
          })
        );

        const coursesWithMetrics = metricsResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          }
          console.warn('Error fetching course metrics:', result.reason);
          return { ...courses[index], metrics: defaultMetrics };
        });

        const failedMetrics = metricsResults.some((result) => result.status === 'rejected');
        if (failedMetrics) {
          setMetricsError('No se pudieron cargar algunas métricas. Mostrando valores por defecto.');
        }

        setTaughtCourses(coursesWithMetrics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_instructor || user?.is_superuser) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications((prev) => [...prev, { ...notification, id: Date.now(), read: false }]);
    };
  
    connectWebSocket(handleNotification);
  
    return () => disconnectWebSocket();
  }, []);

  // Verificar si el usuario tiene permisos para acceder (instructor o superuser/admin)
  if (!user?.is_instructor && !user?.is_superuser) {
    return <div className="text-center py-8">Acceso denegado. Solo para instructores y administradores.</div>;
  }

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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Hola, Profesor {user?.first_name || user?.username}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Bienvenido a su panel de control. Revise las métricas de sus cursos.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-primary-200 text-sm">Instructor IFAP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cursos Impartidos */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">📚</span>
            Cursos Impartidos
          </h2>
        </div>
        {metricsError && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {metricsError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taughtCourses.length > 0 ? (
            taughtCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{course.title}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estudiantes:</span>
                    <span className="font-medium">{course.metrics?.total_students ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progreso Promedio:</span>
                    <span className="font-medium">{course.metrics?.average_progress ?? 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Puntaje Promedio:</span>
                    <span className="font-medium">{course.metrics?.average_score ?? 0}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${course.metrics?.average_progress ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No tiene cursos asignados
              </h3>
              <p className="text-gray-500">Contacte al administrador para asignar cursos.</p>
            </div>
          )}
        </div>
      </Card>
      {/* Notificaciones */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            Notificaciones Recientes
          </h2>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <p className="text-gray-800">{notif.message}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(notif.id).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No hay notificaciones nuevas.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardProfesor;
