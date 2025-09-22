import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Server,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Settings,
  FileText,
  Target,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Zap
} from 'lucide-react';
import Card from '../Card';
import AdminRealTimeMetrics from './AdminRealTimeMetrics';
import AdminCustomReports from './AdminCustomReports';
import AdminAnalytics from './AdminAnalytics';
import AdminExportTools from './AdminExportTools';
import reportsService from '../../services/reportsService';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getOverviewReports(dateRange);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: BarChart3 },
    { id: 'courses', label: 'Reportes de Cursos', icon: BookOpen },
    { id: 'users', label: 'Reportes de Usuarios', icon: Users },
    { id: 'financial', label: 'Reportes Financieros', icon: DollarSign },
    { id: 'technical', label: 'Reportes Técnicos', icon: Server },
    { id: 'realtime', label: 'Métricas en Tiempo Real', icon: Activity },
    { id: 'custom', label: 'Reportes Personalizados', icon: Settings },
    { id: 'analytics', label: 'Análisis Avanzado', icon: TrendingUp },
    { id: 'export', label: 'Exportación', icon: Download }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.overview?.totalUsers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{reportData?.overview?.userGrowth || '0'}% este mes
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cursos</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.overview?.totalCourses?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <BookOpen className="w-4 h-4 mr-1" />
                {reportData?.overview?.activeCourses || '0'} activos
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${reportData?.overview?.totalRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <DollarSign className="w-4 h-4 mr-1" />
                +{reportData?.overview?.revenueGrowth || '0'}% este mes
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificaciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.overview?.totalCertifications?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Award className="w-4 h-4 mr-1" />
                {reportData?.overview?.completionRate || '0'}% tasa de finalización
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Gráficos de Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendencias de Inscripciones
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de tendencias de inscripciones</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Distribución por Categorías
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de distribución por categorías</p>
          </div>
        </Card>
      </div>

      {/* Alertas y Notificaciones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Alertas del Sistema
        </h3>
        <div className="space-y-3">
          {reportData?.alerts?.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              alert.type === 'error' ? 'bg-red-50 border-red-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-center">
                {alert.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                ) : alert.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                )}
                <span className="text-sm font-medium">{alert.message}</span>
                <span className="text-xs text-gray-500 ml-auto">{alert.time}</span>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No hay alertas activas</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderCourseReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cursos por Estado</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activos</span>
              <span className="font-semibold text-green-600">
                {reportData?.courses?.active || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Borrador</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.courses?.draft || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Archivados</span>
              <span className="font-semibold text-gray-600">
                {reportData?.courses?.archived || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rendimiento de Cursos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Finalización</span>
              <span className="font-semibold text-blue-600">
                {reportData?.courses?.completionRate || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Calificación Promedio</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.courses?.averageRating || '0'}/5
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo Promedio</span>
              <span className="font-semibold text-purple-600">
                {reportData?.courses?.averageTime || '0'}h
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Inscripciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-green-600">
                {reportData?.courses?.enrollmentsThisMonth || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-blue-600">
                {reportData?.courses?.totalEnrollments || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crecimiento</span>
              <span className="font-semibold text-purple-600">
                +{reportData?.courses?.enrollmentGrowth || '0'}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Cursos Más Populares</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Curso</th>
                <th className="text-left py-2">Inscripciones</th>
                <th className="text-left py-2">Finalización</th>
                <th className="text-left py-2">Calificación</th>
                <th className="text-left py-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.courses?.topCourses?.map((course, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{course.name}</td>
                  <td className="py-2">{course.enrollments}</td>
                  <td className="py-2">{course.completion}%</td>
                  <td className="py-2">{course.rating}/5</td>
                  <td className="py-2">${course.revenue}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderUserReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Usuarios Activos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoy</span>
              <span className="font-semibold text-green-600">
                {reportData?.users?.activeToday || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Esta Semana</span>
              <span className="font-semibold text-blue-600">
                {reportData?.users?.activeThisWeek || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-purple-600">
                {reportData?.users?.activeThisMonth || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nuevos Registros</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoy</span>
              <span className="font-semibold text-green-600">
                {reportData?.users?.newToday || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Esta Semana</span>
              <span className="font-semibold text-blue-600">
                {reportData?.users?.newThisWeek || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-purple-600">
                {reportData?.users?.newThisMonth || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Progreso</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio</span>
              <span className="font-semibold text-blue-600">
                {reportData?.users?.averageProgress || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completados</span>
              <span className="font-semibold text-green-600">
                {reportData?.users?.completed || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Progreso</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.users?.inProgress || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Certificaciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-green-600">
                {reportData?.users?.certificationsThisMonth || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-blue-600">
                {reportData?.users?.totalCertifications || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa</span>
              <span className="font-semibold text-purple-600">
                {reportData?.users?.certificationRate || '0'}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad de Usuarios</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de actividad de usuarios</p>
        </div>
      </Card>
    </div>
  );

  const renderFinancialReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ingresos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="font-semibold text-green-600">
                ${reportData?.financial?.revenueThisMonth?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mes Anterior</span>
              <span className="font-semibold text-blue-600">
                ${reportData?.financial?.revenueLastMonth?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crecimiento</span>
              <span className="font-semibold text-purple-600">
                +{reportData?.financial?.revenueGrowth || '0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Costos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operativos</span>
              <span className="font-semibold text-red-600">
                ${reportData?.financial?.operationalCosts?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Marketing</span>
              <span className="font-semibold text-yellow-600">
                ${reportData?.financial?.marketingCosts?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Desarrollo</span>
              <span className="font-semibold text-blue-600">
                ${reportData?.financial?.developmentCosts?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rentabilidad</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Margen Bruto</span>
              <span className="font-semibold text-green-600">
                {reportData?.financial?.grossMargin || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Margen Neto</span>
              <span className="font-semibold text-blue-600">
                {reportData?.financial?.netMargin || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="font-semibold text-purple-600">
                {reportData?.financial?.roi || '0'}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencias Financieras</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de tendencias financieras</p>
        </div>
      </Card>
    </div>
  );

  const renderTechnicalReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rendimiento del Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="font-semibold text-blue-600">
                {reportData?.technical?.cpuUsage || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memoria</span>
              <span className="font-semibold text-green-600">
                {reportData?.technical?.memoryUsage || '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disco</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.technical?.diskUsage || '0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tiempo de Respuesta</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio</span>
              <span className="font-semibold text-blue-600">
                {reportData?.technical?.avgResponseTime || '0'}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P95</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.technical?.p95ResponseTime || '0'}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P99</span>
              <span className="font-semibold text-red-600">
                {reportData?.technical?.p99ResponseTime || '0'}ms
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Errores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">4xx</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.technical?.errors4xx || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">5xx</span>
              <span className="font-semibold text-red-600">
                {reportData?.technical?.errors5xx || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Error</span>
              <span className="font-semibold text-purple-600">
                {reportData?.technical?.errorRate || '0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Base de Datos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conexiones</span>
              <span className="font-semibold text-blue-600">
                {reportData?.technical?.dbConnections || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Consultas/seg</span>
              <span className="font-semibold text-green-600">
                {reportData?.technical?.queriesPerSecond || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo Consulta</span>
              <span className="font-semibold text-yellow-600">
                {reportData?.technical?.avgQueryTime || '0'}ms
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monitoreo del Sistema</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de monitoreo del sistema</p>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'courses':
        return renderCourseReports();
      case 'users':
        return renderUserReports();
      case 'financial':
        return renderFinancialReports();
      case 'technical':
        return renderTechnicalReports();
      case 'realtime':
        return <AdminRealTimeMetrics />;
      case 'custom':
        return <AdminCustomReports />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'export':
        return <AdminExportTools />;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Reportes</h1>
          <p className="text-gray-600">Panel integral de reportes y métricas administrativas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminReports;