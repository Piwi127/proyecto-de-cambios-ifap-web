import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Calendar,
  Download,
  Save,
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  Target,
  Database,
  Search,
  X
} from 'lucide-react';
import Card from '../../components/Card';
import reportsService from '../../services/reportsService';

const AdminCustomReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    type: 'table',
    dataSource: 'courses',
    filters: [],
    groupBy: [],
    sortBy: [],
    columns: [],
    schedule: null,
    format: 'json'
  });

  const [availableFields] = useState({
    courses: [
      { id: 'id', name: 'ID', type: 'number' },
      { id: 'title', name: 'Título', type: 'string' },
      { id: 'instructor', name: 'Instructor', type: 'string' },
      { id: 'category', name: 'Categoría', type: 'string' },
      { id: 'status', name: 'Estado', type: 'string' },
      { id: 'created_at', name: 'Fecha de Creación', type: 'date' },
      { id: 'enrollment_count', name: 'Inscripciones', type: 'number' },
      { id: 'completion_rate', name: 'Tasa de Finalización', type: 'percentage' },
      { id: 'rating', name: 'Calificación', type: 'number' }
    ],
    users: [
      { id: 'id', name: 'ID', type: 'number' },
      { id: 'username', name: 'Usuario', type: 'string' },
      { id: 'email', name: 'Email', type: 'string' },
      { id: 'role', name: 'Rol', type: 'string' },
      { id: 'status', name: 'Estado', type: 'string' },
      { id: 'created_at', name: 'Fecha de Registro', type: 'date' },
      { id: 'last_login', name: 'Último Acceso', type: 'date' },
      { id: 'courses_enrolled', name: 'Cursos Inscritos', type: 'number' },
      { id: 'courses_completed', name: 'Cursos Completados', type: 'number' }
    ],
    enrollments: [
      { id: 'id', name: 'ID', type: 'number' },
      { id: 'user_id', name: 'ID Usuario', type: 'number' },
      { id: 'course_id', name: 'ID Curso', type: 'number' },
      { id: 'enrolled_at', name: 'Fecha de Inscripción', type: 'date' },
      { id: 'completed_at', name: 'Fecha de Finalización', type: 'date' },
      { id: 'progress', name: 'Progreso', type: 'percentage' },
      { id: 'grade', name: 'Calificación', type: 'number' },
      { id: 'status', name: 'Estado', type: 'string' }
    ]
  });

  const [filterOperators] = useState({
    string: ['equals', 'contains', 'starts_with', 'ends_with', 'not_equals'],
    number: ['equals', 'greater_than', 'less_than', 'between', 'not_equals'],
    date: ['equals', 'after', 'before', 'between'],
    percentage: ['equals', 'greater_than', 'less_than', 'between']
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getScheduledReports();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setReportConfig({
      name: '',
      description: '',
      type: 'table',
      dataSource: 'courses',
      filters: [],
      groupBy: [],
      sortBy: [],
      columns: [],
      schedule: null,
      format: 'json'
    });
    setShowBuilder(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setReportConfig(report.config || reportConfig);
    setShowBuilder(true);
  };

  const handleSaveReport = async () => {
    try {
      const reportData = {
        name: reportConfig.name,
        description: reportConfig.description,
        config: reportConfig,
        is_active: true
      };

      if (selectedReport) {
        // Update existing report
        await reportsService.updateScheduledReport(selectedReport.id, reportData);
      } else {
        // Create new report
        await reportsService.scheduleReport(reportData);
      }

      setShowBuilder(false);
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handleRunReport = async (report) => {
    try {
      const result = await reportsService.generateCustomReport(report.config);
      console.log('Report result:', result);
      // Aquí podrías mostrar los resultados en un modal o descargar el archivo
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        await reportsService.deleteScheduledReport(reportId);
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleDuplicateReport = (report) => {
    setSelectedReport(null);
    setReportConfig({
      ...report.config,
      name: `${report.config.name} (Copia)`,
      description: `Copia de ${report.config.description}`
    });
    setShowBuilder(true);
  };

  const addFilter = () => {
    const newFilter = {
      id: Date.now(),
      field: availableFields[reportConfig.dataSource][0]?.id || '',
      operator: 'equals',
      value: '',
      type: availableFields[reportConfig.dataSource][0]?.type || 'string'
    };
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const updateFilter = (filterId, updates) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map(filter =>
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    }));
  };

  const removeFilter = (filterId) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== filterId)
    }));
  };

  const addColumn = (fieldId) => {
    if (!reportConfig.columns.includes(fieldId)) {
      setReportConfig(prev => ({
        ...prev,
        columns: [...prev.columns, fieldId]
      }));
    }
  };

  const removeColumn = (fieldId) => {
    setReportConfig(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col !== fieldId)
    }));
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'chart': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDataSourceIcon = (source) => {
    switch (source) {
      case 'users': return <Users className="w-4 h-4" />;
      case 'courses': return <BookOpen className="w-4 h-4" />;
      case 'enrollments': return <Target className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reportes personalizados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Generador de Reportes Personalizados
            </h1>
            <p className="text-green-100">Crea reportes personalizados con filtros avanzados y programación automática</p>
          </div>
          <button
            onClick={handleCreateReport}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Reports List */}
      {!showBuilder && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getReportTypeIcon(report.config?.type)}
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getDataSourceIcon(report.config?.dataSource)}
                  <span className="text-xs text-gray-500 capitalize">
                    {report.config?.dataSource}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Filtros:</span>
                  <span className="font-medium">{report.config?.filters?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Columnas:</span>
                  <span className="font-medium">{report.config?.columns?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Formato:</span>
                  <span className="font-medium uppercase">{report.config?.format || 'JSON'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRunReport(report)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Ejecutar reporte"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditReport(report)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar reporte"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateReport(report)}
                    className="text-purple-600 hover:text-purple-800 p-1"
                    title="Duplicar reporte"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar reporte"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {reports.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes personalizados</h3>
              <p className="text-gray-600 mb-4">Crea tu primer reporte personalizado para comenzar</p>
              <button
                onClick={handleCreateReport}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Crear Reporte
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Builder */}
      {showBuilder && (
        <Card className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedReport ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
            </h2>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Reporte
                </label>
                <input
                  type="text"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Reporte de Inscripciones Mensuales"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente de Datos
                </label>
                <select
                  value={reportConfig.dataSource}
                  onChange={(e) => setReportConfig(prev => ({ 
                    ...prev, 
                    dataSource: e.target.value,
                    columns: [],
                    filters: []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="courses">Cursos</option>
                  <option value="users">Usuarios</option>
                  <option value="enrollments">Inscripciones</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={reportConfig.description}
                onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el propósito de este reporte..."
              />
            </div>

            {/* Report Type and Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="table">Tabla</option>
                  <option value="chart">Gráfico de Barras</option>
                  <option value="pie">Gráfico Circular</option>
                  <option value="trend">Gráfico de Tendencias</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Exportación
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            {/* Columns Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columnas a Incluir
              </label>
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {availableFields[reportConfig.dataSource]?.map((field) => (
                    <label key={field.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportConfig.columns.includes(field.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addColumn(field.id);
                          } else {
                            removeColumn(field.id);
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{field.name}</span>
                    </label>
                  ))}
                </div>
                {reportConfig.columns.length === 0 && (
                  <p className="text-sm text-gray-500">Selecciona al menos una columna</p>
                )}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Filtros
                </label>
                <button
                  onClick={addFilter}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Agregar Filtro
                </button>
              </div>
              <div className="space-y-3">
                {reportConfig.filters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                    <select
                      value={filter.field}
                      onChange={(e) => {
                        const field = availableFields[reportConfig.dataSource].find(f => f.id === e.target.value);
                        updateFilter(filter.id, { 
                          field: e.target.value, 
                          type: field?.type || 'string',
                          operator: filterOperators[field?.type || 'string'][0]
                        });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {availableFields[reportConfig.dataSource]?.map((field) => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {filterOperators[filter.type]?.map((op) => (
                        <option key={op} value={op}>
                          {op.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <input
                      type={filter.type === 'date' ? 'date' : filter.type === 'number' ? 'number' : 'text'}
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Valor..."
                    />
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {reportConfig.filters.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay filtros configurados. Los filtros te permiten limitar los datos del reporte.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRunReport({ config: reportConfig })}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Probar Reporte
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={!reportConfig.name || reportConfig.columns.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Reporte
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminCustomReports;
