import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Users,
  Shield,
  Bell,
  BarChart3,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Filter,
  Database,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Sliders
} from 'lucide-react';
import Card from '../Card';
import reportsService from '../../services/reportsService';

const AdminReportConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');
  const [showAddMetric, setShowAddMetric] = useState(false);

  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    type: 'number',
    source: 'database',
    query: '',
    threshold: '',
    unit: '',
    category: 'general'
  });


  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const configData = await reportsService.getReportConfiguration();
      setConfig(configData);
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      await reportsService.updateReportConfiguration(config);
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error saving configuration:', error);
      // Mostrar notificación de error
    } finally {
      setSaving(false);
    }
  };

  const updateMetricConfig = (metricId, updates) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.map(metric =>
        metric.id === metricId ? { ...metric, ...updates } : metric
      )
    }));
  };

  const addCustomMetric = () => {
    const metric = {
      id: Date.now().toString(),
      ...newMetric,
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    setConfig(prev => ({
      ...prev,
      metrics: [...prev.metrics, metric]
    }));

    setNewMetric({
      name: '',
      description: '',
      type: 'number',
      source: 'database',
      query: '',
      threshold: '',
      unit: '',
      category: 'general'
    });
    setShowAddMetric(false);
  };

  const removeMetric = (metricId) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.filter(metric => metric.id !== metricId)
    }));
  };

  const updateAlertThreshold = (alertId, threshold) => {
    setConfig(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [alertId]: threshold
      }
    }));
  };

  const updateUserAccess = (userId, updates) => {
    setConfig(prev => ({
      ...prev,
      userAccess: prev.userAccess.map(user =>
        user.userId === userId ? { ...user, ...updates } : user
      )
    }));
  };


  const removeUserAccess = (userId) => {
    setConfig(prev => ({
      ...prev,
      userAccess: prev.userAccess.filter(user => user.id !== userId)
    }));
  };

  const tabs = [
    { id: 'metrics', label: 'Métricas y KPIs', icon: BarChart3 },
    { id: 'alerts', label: 'Umbrales de Alertas', icon: Bell },
    { id: 'schedules', label: 'Programación', icon: Calendar },
    { id: 'access', label: 'Control de Acceso', icon: Shield },
    { id: 'general', label: 'Configuración General', icon: Settings }
  ];

  const renderMetricsConfig = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuración de Métricas</h3>
        <button
          onClick={() => setShowAddMetric(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Agregar Métrica
        </button>
      </div>

      <div className="grid gap-4">
        {config?.metrics?.map((metric) => (
          <Card key={metric.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{metric.name}</h4>
                  {metric.isCustom && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Personalizada
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Tipo: {metric.type}</span>
                  <span>Categoría: {metric.category}</span>
                  {metric.unit && <span>Unidad: {metric.unit}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={metric.enabled}
                    onChange={(e) => updateMetricConfig(metric.id, { enabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Activa</span>
                </label>
                
                {metric.isCustom && (
                  <button
                    onClick={() => removeMetric(metric.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {metric.enabled && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frecuencia de Actualización
                    </label>
                    <select
                      value={metric.updateFrequency || '30s'}
                      onChange={(e) => updateMetricConfig(metric.id, { updateFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="10s">10 segundos</option>
                      <option value="30s">30 segundos</option>
                      <option value="1m">1 minuto</option>
                      <option value="5m">5 minutos</option>
                      <option value="15m">15 minutos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Umbral de Alerta
                    </label>
                    <input
                      type="number"
                      value={metric.alertThreshold || ''}
                      onChange={(e) => updateMetricConfig(metric.id, { alertThreshold: e.target.value })}
                      placeholder="Valor umbral"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={metric.priority || 'medium'}
                      onChange={(e) => updateMetricConfig(metric.id, { priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal para agregar métrica */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Métrica</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newMetric.description}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newMetric.type}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="number">Número</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="currency">Moneda</option>
                    <option value="time">Tiempo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newMetric.category}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="users">Usuarios</option>
                    <option value="courses">Cursos</option>
                    <option value="financial">Financiero</option>
                    <option value="technical">Técnico</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddMetric(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={addCustomMetric}
                disabled={!newMetric.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlertsConfig = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Configuración de Alertas</h3>
      
      <div className="grid gap-4">
        {Object.entries(config?.alertThresholds || {}).map(([alertId, threshold]) => (
          <Card key={alertId} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium capitalize">{alertId.replace('_', ' ')}</h4>
                <p className="text-sm text-gray-600">
                  Umbral actual: {threshold}
                  {alertId.includes('usage') ? '%' : 
                   alertId.includes('time') ? 'ms' : 
                   alertId.includes('rate') ? '%' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => updateAlertThreshold(alertId, e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-1">
                  {threshold > 80 ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : threshold > 60 ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-4">
        <h4 className="font-medium mb-3">Configuración de Notificaciones</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config?.notifications?.email || false}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                notifications: { ...prev.notifications, email: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Notificaciones por email</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config?.notifications?.slack || false}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                notifications: { ...prev.notifications, slack: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Notificaciones por Slack</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config?.notifications?.webhook || false}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                notifications: { ...prev.notifications, webhook: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Webhooks</span>
          </label>
        </div>
      </Card>
    </div>
  );

  const renderSchedulesConfig = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Programación de Reportes</h3>
      
      <div className="grid gap-4">
        {config?.schedules?.map((schedule) => (
          <Card key={schedule.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{schedule.name}</h4>
                <p className="text-sm text-gray-600">{schedule.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Frecuencia: {schedule.frequency}</span>
                  <span>Próxima ejecución: {schedule.nextRun}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        schedules: prev.schedules.map(s =>
                          s.id === schedule.id ? { ...s, enabled: e.target.checked } : s
                        )
                      }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Activo</span>
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAccessConfig = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Control de Acceso</h3>
      </div>
      
      <div className="grid gap-4">
        {config?.userAccess?.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{user.userName || user.userId}</h4>
                <p className="text-sm text-gray-600">Rol: {user.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUserAccess(user.userId, { role: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="analyst">Analista</option>
                  <option value="admin">Administrador</option>
                </select>
                
                <button
                  onClick={() => removeUserAccess(user.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGeneralConfig = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Configuración General</h3>
      
      <Card className="p-4">
        <h4 className="font-medium mb-3">Configuración de Datos</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retención de Datos (días)
            </label>
            <input
              type="number"
              value={config?.dataRetention || 365}
              onChange={(e) => setConfig(prev => ({ ...prev, dataRetention: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de Backup
            </label>
            <select
              value={config?.backupFrequency || 'daily'}
              onChange={(e) => setConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <h4 className="font-medium mb-3">Configuración de Rendimiento</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config?.performance?.caching || false}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                performance: { ...prev.performance, caching: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Habilitar caché de reportes</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config?.performance?.compression || false}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                performance: { ...prev.performance, compression: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Comprimir exportaciones</span>
          </label>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'metrics':
        return renderMetricsConfig();
      case 'alerts':
        return renderAlertsConfig();
      case 'schedules':
        return renderSchedulesConfig();
      case 'access':
        return renderAccessConfig();
      case 'general':
        return renderGeneralConfig();
      default:
        return renderMetricsConfig();
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
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Reportes</h1>
          <p className="text-gray-600">Personaliza métricas, alertas y control de acceso</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadConfiguration}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
          
          <button
            onClick={saveConfiguration}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            Guardar Cambios
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

export default AdminReportConfig;
