import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Image,
  Database,
  Cloud,
  Settings,
  Calendar,
  Filter,
  Users,
  BookOpen,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  Share2,
  Mail,
  Link,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/Card';
import reportsService from '../../services/reportsService';

const AdminExportTools = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportConfig, setExportConfig] = useState({
    dataType: 'courses',
    format: 'xlsx',
    dateRange: '30d',
    filters: {},
    includeCharts: true,
    includeMetadata: true,
    compression: false,
    password: '',
    schedule: null
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [integrations, setIntegrations] = useState({
    googleAnalytics: false,
    powerBI: false,
    tableau: false,
    googleSheets: false,
    dropbox: false,
    oneDrive: false
  });

  const exportFormats = [
    { id: 'xlsx', name: 'Excel (.xlsx)', icon: FileSpreadsheet, description: 'Formato Excel con múltiples hojas' },
    { id: 'csv', name: 'CSV (.csv)', icon: FileText, description: 'Valores separados por comas' },
    { id: 'pdf', name: 'PDF (.pdf)', icon: File, description: 'Documento PDF con gráficos' },
    { id: 'json', name: 'JSON (.json)', icon: Database, description: 'Formato de datos estructurados' },
    { id: 'xml', name: 'XML (.xml)', icon: FileText, description: 'Formato XML estructurado' },
    { id: 'png', name: 'Imagen (.png)', icon: Image, description: 'Solo gráficos como imagen' }
  ];

  const dataTypes = [
    { id: 'courses', name: 'Cursos', icon: BookOpen, description: 'Datos de cursos y contenido' },
    { id: 'users', name: 'Usuarios', icon: Users, description: 'Información de usuarios y perfiles' },
    { id: 'enrollments', name: 'Inscripciones', icon: Target, description: 'Datos de inscripciones y progreso' },
    { id: 'financial', name: 'Financiero', icon: DollarSign, description: 'Reportes financieros e ingresos' },
    { id: 'analytics', name: 'Analíticas', icon: Target, description: 'Métricas y análisis avanzados' },
    { id: 'system', name: 'Sistema', icon: Settings, description: 'Logs y métricas del sistema' }
  ];

  const integrationOptions = [
    { id: 'googleAnalytics', name: 'Google Analytics', description: 'Exportar métricas a GA4' },
    { id: 'powerBI', name: 'Power BI', description: 'Conectar con Microsoft Power BI' },
    { id: 'tableau', name: 'Tableau', description: 'Integración con Tableau Desktop' },
    { id: 'googleSheets', name: 'Google Sheets', description: 'Exportar directamente a Sheets' },
    { id: 'dropbox', name: 'Dropbox', description: 'Guardar archivos en Dropbox' },
    { id: 'oneDrive', name: 'OneDrive', description: 'Sincronizar con OneDrive' }
  ];

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    try {
      setLoading(true);
      // Simular carga de historial de exportaciones
      const mockExports = [
        {
          id: 1,
          name: 'Reporte Mensual de Cursos',
          type: 'courses',
          format: 'xlsx',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000),
          fileSize: '2.4 MB',
          downloadUrl: '/exports/courses_monthly.xlsx'
        },
        {
          id: 2,
          name: 'Análisis de Usuarios Q3',
          type: 'users',
          format: 'pdf',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000),
          fileSize: '1.8 MB',
          downloadUrl: '/exports/users_q3.pdf'
        },
        {
          id: 3,
          name: 'Datos de Inscripciones',
          type: 'enrollments',
          format: 'csv',
          status: 'processing',
          createdAt: new Date(Date.now() - 3600000),
          fileSize: null,
          downloadUrl: null
        }
      ];
      setExports(mockExports);
    } catch (error) {
      console.error('Error loading export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simular progreso de exportación
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await reportsService.exportData(
        exportConfig.format,
        exportConfig.dataType,
        {
          dateRange: exportConfig.dateRange,
          filters: exportConfig.filters,
          includeCharts: exportConfig.includeCharts,
          includeMetadata: exportConfig.includeMetadata,
          compression: exportConfig.compression,
          password: exportConfig.password
        }
      );

      clearInterval(progressInterval);
      setExportProgress(100);

      // Agregar a historial
      const newExport = {
        id: Date.now(),
        name: `Exportación ${exportConfig.dataType}`,
        type: exportConfig.dataType,
        format: exportConfig.format,
        status: 'completed',
        createdAt: new Date(),
        fileSize: result.fileSize || 'N/A',
        downloadUrl: result.downloadUrl
      };

      setExports(prev => [newExport, ...prev]);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleBulkExport = async () => {
    try {
      setIsExporting(true);
      // Implementar exportación masiva
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsExporting(false);
    } catch (error) {
      console.error('Error in bulk export:', error);
      setIsExporting(false);
    }
  };

  const handleDeleteExport = (exportId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta exportación?')) {
      setExports(prev => prev.filter(exp => exp.id !== exportId));
    }
  };

  const handleShareExport = (exportItem) => {
    // Implementar funcionalidad de compartir
    const shareUrl = `${window.location.origin}${exportItem.downloadUrl}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Enlace copiado al portapapeles');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format) => {
    const formatConfig = exportFormats.find(f => f.id === format);
    if (formatConfig) {
      const IconComponent = formatConfig.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getDataTypeIcon = (type) => {
    const typeConfig = dataTypes.find(t => t.id === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <Database className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando herramientas de exportación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Download className="w-8 h-8 mr-3" />
              Herramientas de Exportación
            </h1>
            <p className="text-indigo-100">Exporta datos en múltiples formatos e integra con sistemas externos</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBulkExport}
              disabled={isExporting}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4 inline mr-1" />
              Exportación Masiva
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configurar Exportación</h2>
            
            <div className="space-y-4">
              {/* Data Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Datos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dataTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setExportConfig(prev => ({ ...prev, dataType: type.id }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          exportConfig.dataType === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <IconComponent className="w-4 h-4 mr-2" />
                          <span className="font-medium text-sm">{type.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Exportación
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {exportFormats.map((format) => {
                    const IconComponent = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setExportConfig(prev => ({ ...prev, format: format.id }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          exportConfig.format === format.id
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <IconComponent className="w-4 h-4 mr-2" />
                          <span className="font-medium text-sm">{format.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{format.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Fechas
                  </label>
                  <select
                    value={exportConfig.dateRange}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="90d">Últimos 90 días</option>
                    <option value="1y">Último año</option>
                    <option value="all">Todos los datos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña (Opcional)
                  </label>
                  <input
                    type="password"
                    value={exportConfig.password}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Proteger archivo con contraseña"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opciones Adicionales
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeCharts}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir gráficos y visualizaciones</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeMetadata}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir metadatos y configuración</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.compression}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, compression: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Comprimir archivo (ZIP)</span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Exportando... {exportProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Iniciar Exportación
                    </>
                  )}
                </button>
                
                {isExporting && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Export History */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Exportaciones</h2>
            
            <div className="space-y-3">
              {exports.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(exportItem.status)}
                    {getDataTypeIcon(exportItem.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{exportItem.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          {getFormatIcon(exportItem.format)}
                          <span className="ml-1 uppercase">{exportItem.format}</span>
                        </span>
                        <span>{exportItem.fileSize}</span>
                        <span>{exportItem.createdAt.toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {exportItem.status === 'completed' && (
                      <>
                        <button
                          onClick={() => window.open(exportItem.downloadUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareExport(exportItem)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Compartir"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteExport(exportItem.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {exports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay exportaciones en el historial</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Integrations Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Integraciones
            </h2>
            
            <div className="space-y-3">
              {integrationOptions.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                  <button
                    onClick={() => setIntegrations(prev => ({
                      ...prev,
                      [integration.id]: !prev[integration.id]
                    }))}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      integrations[integration.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {integrations[integration.id] ? 'Conectado' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Exportaciones Rápidas</h2>
            
            <div className="space-y-2">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Reporte Semanal</span>
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Cursos y usuarios - Excel</p>
              </button>
              
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Análisis Mensual</span>
                  <File className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm text-gray-600">Métricas completas - PDF</p>
              </button>
              
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Datos de Inscripciones</span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Solo datos - CSV</p>
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Exportaciones este mes</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Datos exportados</span>
                <span className="font-medium">156 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Formato más usado</span>
                <span className="font-medium">Excel</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Integraciones activas</span>
                <span className="font-medium">
                  {Object.values(integrations).filter(Boolean).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminExportTools;
