import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  Zap,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../../components/Card';
import reportsService from '../../services/reportsService';

const AdminRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertThresholds, setAlertThresholds] = useState({
    cpu_usage: 80,
    memory_usage: 85,
    response_time: 1000,
    error_rate: 5
  });

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    loadRealTimeMetrics();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          loadRealTimeMetrics();
        }
      }, 30000); // Actualizar cada 30 segundos
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const loadRealTimeMetrics = async () => {
    try {
      setLoading(true);
      const [metricsData, alertsData] = await Promise.all([
        reportsService.getRealTimeMetrics(),
        reportsService.getAlertHistory('1h')
      ]);

      if (mountedRef.current) {
        setMetrics(metricsData);
        setAlerts(alertsData.alerts || []);
        setLastUpdate(new Date());
        checkAlerts(metricsData);
      }
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const checkAlerts = (data) => {
    const newAlerts = [];

    // Verificar uso de CPU
    if (data.system?.cpu_usage > alertThresholds.cpu_usage) {
      newAlerts.push({
        id: Date.now() + Math.random(),
        type: 'warning',
        title: 'Alto uso de CPU',
        message: `CPU al ${data.system.cpu_usage}% - Umbral: ${alertThresholds.cpu_usage}%`,
        timestamp: new Date(),
        metric: 'cpu_usage'
      });
    }

    // Verificar uso de memoria
    if (data.system?.memory_usage > alertThresholds.memory_usage) {
      newAlerts.push({
        id: Date.now() + Math.random(),
        type: 'warning',
        title: 'Alto uso de memoria',
        message: `Memoria al ${data.system.memory_usage}% - Umbral: ${alertThresholds.memory_usage}%`,
        timestamp: new Date(),
        metric: 'memory_usage'
      });
    }

    // Verificar tiempo de respuesta
    if (data.system?.response_time > alertThresholds.response_time) {
      newAlerts.push({
        id: Date.now() + Math.random(),
        type: 'error',
        title: 'Tiempo de respuesta alto',
        message: `Tiempo de respuesta: ${data.system.response_time}ms - Umbral: ${alertThresholds.response_time}ms`,
        timestamp: new Date(),
        metric: 'response_time'
      });
    }

    // Verificar tasa de errores
    if (data.system?.error_rate > alertThresholds.error_rate) {
      newAlerts.push({
        id: Date.now() + Math.random(),
        type: 'error',
        title: 'Tasa de errores alta',
        message: `Tasa de errores: ${data.system.error_rate}% - Umbral: ${alertThresholds.error_rate}%`,
        timestamp: new Date(),
        metric: 'error_rate'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Mantener solo las 10 más recientes
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.error) return 'text-red-600 bg-red-50';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.error) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  if (loading && !metrics) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando métricas en tiempo real...</p>
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
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              Métricas en Tiempo Real
            </h1>
            <p className="text-blue-100">Monitoreo del sistema con actualizaciones automáticas</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
            <button
              onClick={loadRealTimeMetrics}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualizar
            </button>
          </div>
        </div>
        {lastUpdate && (
          <div className="mt-4 text-sm text-blue-100">
            Última actualización: {formatTime(lastUpdate)}
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Activas ({alerts.length})
            </h3>
            <button
              onClick={() => setAlerts([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Descartar todas
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center">
                  {alert.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatTime(alert.timestamp)}
                  </span>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Users */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics?.users?.active || 0)}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.users?.growth || 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">En línea:</span>
                  <span className="font-medium ml-1">{metrics?.users?.online || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Inactivos:</span>
                  <span className="font-medium ml-1">{metrics?.users?.inactive || 0}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Active Courses */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics?.courses?.active || 0)}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.courses?.growth || 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Con estudiantes:</span>
                  <span className="font-medium ml-1">{metrics?.courses?.with_students || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completados:</span>
                  <span className="font-medium ml-1">{metrics?.courses?.completed_today || 0}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* System Load */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Carga del Sistema</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics?.system?.cpu_usage || 0)}
              </p>
              <div className="flex items-center">
                {getStatusIcon(metrics?.system?.cpu_usage || 0, { warning: 70, error: 90 })}
                <span className={`text-sm ml-1 ${
                  (metrics?.system?.cpu_usage || 0) >= 90 ? 'text-red-600' :
                  (metrics?.system?.cpu_usage || 0) >= 70 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  CPU
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Server className="w-6 h-6 text-white" />
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Memoria:</span>
                  <span className="font-medium">{formatPercentage(metrics?.system?.memory_usage || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disco:</span>
                  <span className="font-medium">{formatPercentage(metrics?.system?.disk_usage || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Response Time */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo de Respuesta</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.system?.response_time || 0}ms
              </p>
              <div className="flex items-center">
                {getStatusIcon(metrics?.system?.response_time || 0, { warning: 800, error: 1500 })}
                <span className={`text-sm ml-1 ${
                  (metrics?.system?.response_time || 0) >= 1500 ? 'text-red-600' :
                  (metrics?.system?.response_time || 0) >= 800 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  Promedio
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mínimo:</span>
                  <span className="font-medium">{metrics?.system?.response_time_min || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máximo:</span>
                  <span className="font-medium">{metrics?.system?.response_time_max || 0}ms</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed System Metrics */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Metrics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Base de Datos
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conexiones activas</span>
                <span className="font-medium text-gray-900">{metrics?.database?.active_connections || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultas por segundo</span>
                <span className="font-medium text-gray-900">{metrics?.database?.queries_per_second || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiempo promedio de consulta</span>
                <span className="font-medium text-gray-900">{metrics?.database?.avg_query_time || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conexiones en cola</span>
                <span className="font-medium text-gray-900">{metrics?.database?.queued_connections || 0}</span>
              </div>
            </div>
          </Card>

          {/* Network Metrics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-green-600" />
              Red y Conectividad
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ancho de banda entrante</span>
                <span className="font-medium text-gray-900">{metrics?.network?.bandwidth_in || 0} MB/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ancho de banda saliente</span>
                <span className="font-medium text-gray-900">{metrics?.network?.bandwidth_out || 0} MB/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Latencia promedio</span>
                <span className="font-medium text-gray-900">{metrics?.network?.latency || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paquetes perdidos</span>
                <span className="font-medium text-gray-900">{formatPercentage(metrics?.network?.packet_loss || 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-600" />
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          {metrics?.recent_activity?.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'user_login' ? 'bg-green-400' :
                  activity.type === 'course_enrollment' ? 'bg-blue-400' :
                  activity.type === 'course_completion' ? 'bg-purple-400' :
                  activity.type === 'error' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.user || 'Sistema'}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(new Date(activity.timestamp))}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          )}
        </div>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de éxito de API</span>
              <span className="font-medium text-green-600">{formatPercentage(metrics?.performance?.api_success_rate || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${metrics?.performance?.api_success_rate || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de errores</span>
              <span className="font-medium text-red-600">{formatPercentage(metrics?.performance?.error_rate || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${metrics?.performance?.error_rate || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disponibilidad</span>
              <span className="font-medium text-blue-600">{formatPercentage(metrics?.performance?.uptime || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${metrics?.performance?.uptime || 0}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Recursos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="font-medium">{formatPercentage(metrics?.system?.cpu_usage || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (metrics?.system?.cpu_usage || 0) >= 90 ? 'bg-red-600' :
                  (metrics?.system?.cpu_usage || 0) >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(metrics?.system?.cpu_usage || 0, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memoria</span>
              <span className="font-medium">{formatPercentage(metrics?.system?.memory_usage || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (metrics?.system?.memory_usage || 0) >= 90 ? 'bg-red-600' :
                  (metrics?.system?.memory_usage || 0) >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(metrics?.system?.memory_usage || 0, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Almacenamiento</span>
              <span className="font-medium">{formatPercentage(metrics?.system?.disk_usage || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (metrics?.system?.disk_usage || 0) >= 90 ? 'bg-red-600' :
                  (metrics?.system?.disk_usage || 0) >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(metrics?.system?.disk_usage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Alertas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU &gt;</span>
              <span className="font-medium">{alertThresholds.cpu_usage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memoria &gt;</span>
              <span className="font-medium">{alertThresholds.memory_usage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Respuesta &gt;</span>
              <span className="font-medium">{alertThresholds.response_time}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Errores &gt;</span>
              <span className="font-medium">{alertThresholds.error_rate}%</span>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="w-4 h-4 inline mr-1" />
              Configurar Alertas
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminRealTimeMetrics;