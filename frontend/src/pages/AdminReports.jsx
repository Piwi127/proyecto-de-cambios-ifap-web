import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  Award,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const AdminReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar carga de datos desde la API

      // Datos de ejemplo
      const mockStats = {
        users: {
          total: 1250,
          active: 890,
          new: 45,
          growth: 12.5
        },
        courses: {
          total: 67,
          active: 52,
          completed: 2340,
          enrollment: 15.8
        },
        lessons: {
          total: 450,
          views: 12500,
          avg_completion: 78.5,
          popular: 'Introducción a Archivística'
        },
        forum: {
          posts: 890,
          topics: 156,
          replies: 2340,
          active_users: 234
        },
        system: {
          uptime: 99.8,
          response_time: 245,
          storage_used: 68.5,
          bandwidth: 2.4
        }
      };

      const mockChartData = {
        userGrowth: [
          { month: 'Ene', users: 1200 },
          { month: 'Feb', users: 1180 },
          { month: 'Mar', users: 1220 },
          { month: 'Abr', users: 1250 },
          { month: 'May', users: 1280 },
          { month: 'Jun', users: 1250 }
        ],
        courseEnrollment: [
          { course: 'Archivística Básica', enrolled: 450 },
          { course: 'Gestión Documental', enrolled: 380 },
          { course: 'Preservación Digital', enrolled: 320 },
          { course: 'Normas ISO', enrolled: 280 },
          { course: 'Auditoría Archivística', enrolled: 220 }
        ],
        activityByHour: [
          { hour: '06:00', activity: 12 },
          { hour: '09:00', activity: 45 },
          { hour: '12:00', activity: 78 },
          { hour: '15:00', activity: 92 },
          { hour: '18:00', activity: 67 },
          { hour: '21:00', activity: 34 }
        ]
      };

      setStats(mockStats);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (reportType) => {
    // TODO: Implementar exportación de reportes
    const reportData = {
      type: reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: stats
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };

    return (
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm flex items-center ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  change < 0 ? 'rotate-180' : ''
                }`} />
                {Math.abs(change)}% vs período anterior
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    );
  };

  const SimpleBarChart = ({ data, xKey, yKey, title }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d[yKey]));
          const percentage = (item[yKey] / maxValue) * 100;

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item[xKey]}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-900 text-right">
                {item[yKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const SimplePieChart = ({ data, title }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
          const total = data.reduce((sum, d) => sum + d.enrolled, 0);
          const percentage = ((item.enrolled / total) * 100).toFixed(1);

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{item.course}</span>
                  <span className="text-sm text-gray-600">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`${colors[index % colors.length]} h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.enrolled}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Estadísticas y Reportes</h1>
            <p className="text-blue-100">Análisis detallado del rendimiento de la plataforma</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Panel Admin
            </button>
            <button
              onClick={() => loadDashboardData()}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleExportReport('users')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Exportar Usuarios
            </button>
            <button
              onClick={() => handleExportReport('courses')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Exportar Cursos
            </button>
            <button
              onClick={() => handleExportReport('system')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Exportar Sistema
            </button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.users?.total || 0}
          change={stats.users?.growth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Cursos Activos"
          value={stats.courses?.active || 0}
          change={stats.courses?.enrollment}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Lecciones Vistas"
          value={stats.lessons?.views || 0}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Posts en Foro"
          value={stats.forum?.posts || 0}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crecimiento de Usuarios</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <SimpleBarChart
            data={chartData.userGrowth || []}
            xKey="month"
            yKey="users"
            title=""
          />
        </Card>

        {/* Course Enrollment Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inscripciones por Curso</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <SimplePieChart
            data={chartData.courseEnrollment || []}
            title=""
          />
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Statistics */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Estadísticas de Usuarios
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Usuarios Activos</span>
              <span className="font-medium text-gray-900">{stats.users?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nuevos este mes</span>
              <span className="font-medium text-gray-900">{stats.users?.new || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de crecimiento</span>
              <span className="font-medium text-green-600">+{stats.users?.growth || 0}%</span>
            </div>
          </div>
        </Card>

        {/* Course Statistics */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-600" />
            Estadísticas de Cursos
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de cursos</span>
              <span className="font-medium text-gray-900">{stats.courses?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cursos completados</span>
              <span className="font-medium text-gray-900">{stats.courses?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de inscripción</span>
              <span className="font-medium text-green-600">+{stats.courses?.enrollment || 0}%</span>
            </div>
          </div>
        </Card>

        {/* System Statistics */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Estadísticas del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo de actividad</span>
              <span className="font-medium text-gray-900">{stats.system?.uptime || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo de respuesta</span>
              <span className="font-medium text-gray-900">{stats.system?.response_time || 0}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Almacenamiento usado</span>
              <span className="font-medium text-gray-900">{stats.system?.storage_used || 0}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad por Hora del Día</h3>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>
        <SimpleBarChart
          data={chartData.activityByHour || []}
          xKey="hour"
          yKey="activity"
          title=""
        />
      </Card>

      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Cursos Más Populares
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Introducción a Archivística', students: 450, rating: 4.8 },
              { name: 'Gestión Documental', students: 380, rating: 4.7 },
              { name: 'Preservación Digital', students: 320, rating: 4.6 },
              { name: 'Normas ISO', students: 280, rating: 4.5 },
              { name: 'Auditoría Archivística', students: 220, rating: 4.4 }
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.students} estudiantes</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-red-600" />
            Métricas de Rendimiento
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de finalización promedio</span>
              <span className="font-medium text-gray-900">{stats.lessons?.avg_completion || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.lessons?.avg_completion || 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usuarios activos en foro</span>
              <span className="font-medium text-gray-900">{stats.forum?.active_users || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(stats.forum?.active_users || 0) / 10}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime del sistema</span>
              <span className="font-medium text-gray-900">{stats.system?.uptime || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${stats.system?.uptime || 0}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card variant="info" className="bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Exportar Reportes Detallados</h3>
            <p className="text-sm text-gray-600">
              Genera reportes completos en formato PDF o Excel con datos históricos y análisis avanzados.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <Download className="w-4 h-4 inline mr-1" />
              PDF Completo
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 inline mr-1" />
              Excel Detallado
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;