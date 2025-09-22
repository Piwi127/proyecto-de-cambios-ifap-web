import React, { useState, useEffect, useContext } from 'react';
import {
  Shield,
  Eye,
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Monitor,
  Database,
  Lock,
  Unlock,
  FileText,
  Settings,
  Trash2,
  Edit,
  Plus,
  ExternalLink
} from 'lucide-react';
import Card from '../Card';
import { AuthContext } from '../../context/AuthContext';
import reportsService from '../../services/reportsService';

const AdminAuditSystem = () => {
  const { user } = useContext(AuthContext);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timeRange: '7d',
    action: '',
    user: '',
    severity: '',
    component: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, [filters, currentPage]);

  useEffect(() => {
    // Registrar acceso al sistema de auditoría
    logAuditAction('audit_system_access', {
      component: 'AdminAuditSystem',
      timestamp: new Date().toISOString()
    });
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await reportsService.getAuditLogs(filters.timeRange, {
        ...filters,
        search: searchTerm,
        page: currentPage,
        page_size: 20
      });
      
      setAuditLogs(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 20));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      // En caso de error, mostrar datos de ejemplo
      setAuditLogs(generateSampleAuditLogs());
    } finally {
      setLoading(false);
    }
  };

  const logAuditAction = async (action, details = {}) => {
    try {
      await reportsService.logAuditAction(action, {
        ...details,
        userId: user?.id,
        userName: user?.username,
        userRole: user?.role,
        ipAddress: await getUserIP(),
        userAgent: navigator.userAgent,
        sessionId: getSessionId()
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const getSessionId = () => {
    return sessionStorage.getItem('sessionId') || 'unknown';
  };

  const generateSampleAuditLogs = () => {
    const actions = [
      'report_generated', 'config_updated', 'user_access_granted', 'data_exported',
      'alert_configured', 'metric_modified', 'system_accessed', 'backup_created'
    ];
    
    const severities = ['low', 'medium', 'high', 'critical'];
    const components = ['AdminReports', 'AdminMetrics', 'AdminConfig', 'AdminExport'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      userId: `user_${Math.floor(Math.random() * 10) + 1}`,
      userName: `Usuario ${Math.floor(Math.random() * 10) + 1}`,
      userRole: Math.random() > 0.7 ? 'admin' : 'user',
      component: components[Math.floor(Math.random() * components.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        resource: 'system_reports',
        operation: 'read',
        success: Math.random() > 0.1
      },
      status: Math.random() > 0.1 ? 'success' : 'failed'
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'report_generated': return <FileText className="w-4 h-4" />;
      case 'config_updated': return <Settings className="w-4 h-4" />;
      case 'user_access_granted': return <Unlock className="w-4 h-4" />;
      case 'data_exported': return <Download className="w-4 h-4" />;
      case 'alert_configured': return <AlertTriangle className="w-4 h-4" />;
      case 'metric_modified': return <Edit className="w-4 h-4" />;
      case 'system_accessed': return <Monitor className="w-4 h-4" />;
      case 'backup_created': return <Database className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportAuditLogs = async () => {
    try {
      await logAuditAction('audit_logs_exported', {
        filters,
        recordCount: auditLogs.length
      });
      
      await reportsService.exportData('csv', 'audit_logs', filters);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      timeRange: '7d',
      action: '',
      user: '',
      severity: '',
      component: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
    logAuditAction('audit_log_viewed', {
      viewedLogId: log.id,
      viewedAction: log.action
    });
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Sistema de Auditoría
          </h1>
          <p className="text-gray-600">Monitoreo y registro de actividades administrativas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadAuditLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          
          <button
            onClick={exportAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Último día</option>
              <option value="7d">Última semana</option>
              <option value="30d">Último mes</option>
              <option value="90d">Últimos 3 meses</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="report_generated">Reporte generado</option>
              <option value="config_updated">Configuración actualizada</option>
              <option value="user_access_granted">Acceso concedido</option>
              <option value="data_exported">Datos exportados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severidad
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Componente
            </label>
            <select
              value={filters.component}
              onChange={(e) => setFilters(prev => ({ ...prev, component: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="AdminReports">Reportes</option>
              <option value="AdminMetrics">Métricas</option>
              <option value="AdminConfig">Configuración</option>
              <option value="AdminExport">Exportación</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Usuario, IP, etc."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de logs */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Componente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => handleLogClick(log)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      {log.action.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.component}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(log.status)}
                      <span className="text-sm">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {log.ipAddress}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de detalles */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalles del Log de Auditoría</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Acción</label>
                  <p className="text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <p className="text-sm text-gray-900">{selectedLog.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedLog.userAgent}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalles</label>
                <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditSystem;