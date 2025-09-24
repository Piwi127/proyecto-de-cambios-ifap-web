import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Database,
  Server,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalTasks: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamadas a la API para obtener estadísticas reales
      // Por ahora usamos datos de ejemplo
      setStats({
        totalUsers: 245,
        activeUsers: 189,
        totalCourses: 12,
        totalQuizzes: 67,
        totalTasks: 34,
        systemHealth: 'good'
      });

      setRecentActivity([
        {
          id: 1,
          type: 'user_registered',
          message: 'Nuevo usuario registrado: María González',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          icon: '👤'
        },
        {
          id: 2,
          type: 'course_created',
          message: 'Nuevo curso creado: Archivística Avanzada',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          icon: '📚'
        },
        {
          id: 3,
          type: 'quiz_completed',
          message: 'Quiz completado por 15 estudiantes',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
          icon: '✅'
        },
        {
          id: 4,
          type: 'system_backup',
          message: 'Backup del sistema completado exitosamente',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          icon: '💾'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios, roles y permisos',
      icon: <Users className="w-8 h-8" />,
      path: '/aula-virtual/user-management',
      color: 'bg-blue-500',
      stats: `${stats.activeUsers}/${stats.totalUsers} activos`
    },
    {
      id: 'courses',
      title: 'Gestión de Cursos',
      description: 'Crear y gestionar cursos y lecciones',
      icon: <BookOpen className="w-8 h-8" />,
      path: '/admin/courses',
      color: 'bg-green-500',
      stats: `${stats.totalCourses} cursos`
    },
    {
      id: 'permissions',
      title: 'Permisos y Roles',
      description: 'Configurar roles y permisos del sistema',
      icon: <Shield className="w-8 h-8" />,
      path: '/admin/permissions',
      color: 'bg-red-500',
      stats: '5 roles activos'
    },
    {
      id: 'reports',
      title: 'Estadísticas y Reportes',
      description: 'Ver métricas y generar reportes',
      icon: <BarChart3 className="w-8 h-8" />,
      path: '/admin/reports',
      color: 'bg-purple-500',
      stats: 'Reportes disponibles'
    },
    {
      id: 'system',
      title: 'Configuración del Sistema',
      description: 'Ajustes generales y mantenimiento',
      icon: <Settings className="w-8 h-8" />,
      path: '/admin/settings',
      color: 'bg-gray-500',
      stats: 'Sistema operativo'
    }
  ];

  const quickStats = [
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      total: stats.totalUsers,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Cursos Activos',
      value: stats.totalCourses,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Posts en Foro',
      value: stats.totalQuizzes,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Archivos en Biblioteca',
      value: stats.totalTasks,
      icon: <Database className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthText = (health) => {
    switch (health) {
      case 'good': return 'Excelente';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Hace ${minutes} minutos`;
    } else if (hours < 24) {
      return `Hace ${hours} horas`;
    } else {
      return `Hace ${days} días`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-indigo-100">Bienvenido de vuelta, {user?.first_name || 'Administrador'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemHealthColor(stats.systemHealth)}`}>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>{getSystemHealthText(stats.systemHealth)}</span>
              </div>
            </div>
            <button
              onClick={loadDashboardData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className="text-gray-600 text-sm">{stat.title}</p>
            {stat.total && (
              <p className="text-gray-500 text-xs">de {stat.total} total</p>
            )}
          </Card>
        ))}
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Card
            key={module.id}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(module.path)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {module.stats}
                  </span>
                  <span className="text-primary-600 group-hover:text-primary-800 font-medium text-sm">
                    Gestionar →
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Ver toda la actividad →
            </button>
          </div>
        </Card>

        {/* System Status */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
            <Server className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Base de Datos</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                Operativo
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Servidor Web</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                En línea
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Seguridad</span>
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                Revisar
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Rendimiento</span>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Bueno
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Ver detalles del sistema →
            </button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="gradient" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Acciones Rápidas</h3>
          <p className="text-gray-600 mb-6">
            Accede rápidamente a las funciones más utilizadas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              👥 Gestionar Usuarios
            </button>
            <button
              onClick={() => navigate('/admin/courses')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              📚 Gestionar Cursos
            </button>
            <button
              onClick={() => navigate('/admin/system')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;