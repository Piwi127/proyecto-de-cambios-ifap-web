import { api } from './api.js';

/**
 * Servicio para gestión de reportes y métricas administrativas
 */
class ReportsService {

  /**
   * Obtiene métricas generales del sistema
   */
  async getSystemMetrics(timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/system-metrics/', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de cursos
   */
  async getCourseMetrics(timeRange = '30d', filters = {}) {
    try {
      const response = await api.get('/admin/reports/course-metrics/', {
        params: { time_range: timeRange, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de usuarios
   */
  async getUserMetrics(timeRange = '30d', filters = {}) {
    try {
      const response = await api.get('/admin/reports/user-metrics/', {
        params: { time_range: timeRange, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas financieras
   */
  async getFinancialMetrics(timeRange = '30d', filters = {}) {
    try {
      const response = await api.get('/admin/reports/financial-metrics/', {
        params: { time_range: timeRange, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de rendimiento del sistema
   */
  async getPerformanceMetrics(timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/performance-metrics/', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas en tiempo real
   */
  async getRealTimeMetrics() {
    try {
      const response = await api.get('/admin/reports/realtime-metrics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos para gráficos
   */
  async getChartData(chartType, timeRange = '30d', filters = {}) {
    try {
      const response = await api.get('/admin/reports/chart-data/', {
        params: { chart_type: chartType, time_range: timeRange, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  /**
   * Genera reporte personalizado
   */
  async generateCustomReport(config) {
    try {
      const response = await api.post('/admin/reports/custom-report/', config);
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Obtiene reportes programados
   */
  async getScheduledReports() {
    try {
      const response = await api.get('/admin/reports/scheduled-reports/');
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Programa un nuevo reporte
   */
  async scheduleReport(config) {
    try {
      const response = await api.post('/admin/reports/schedule/', config);
      return response.data;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Elimina un reporte programado
   */
  async deleteScheduledReport(reportId) {
    try {
      const response = await api.delete(`/admin/reports/schedule/${reportId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }

  /**
   * Exporta datos en formato específico
   */
  async exportData(format, dataType, filters = {}) {
    try {
      const response = await api.post('/admin/reports/export/', {
        format,
        data_type: dataType,
        filters
      }, {
        responseType: 'blob'
      });

      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const fileName = `report_${dataType}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis de tendencias
   */
  async getTrendAnalysis(timeRange = '90d', metricType = 'users') {
    try {
      const response = await api.get('/admin/reports/trend-analysis/', {
        params: { time_range: timeRange, metric_type: metricType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis de cohortes
   */
  async getCohortAnalysis(cohortType = 'monthly', timeRange = '12m') {
    try {
      const response = await api.get('/admin/reports/cohort-analysis/', {
        params: { cohort_type: cohortType, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort analysis:', error);
      throw error;
    }
  }

  /**
   * Obtiene predicciones basadas en datos históricos
   */
  async getPredictions(metricType = 'enrollments', timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/predictions/', {
        params: { metric_type: metricType, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  }

  /**
   * Obtiene configuración de alertas
   */
  async getAlertConfig() {
    try {
      const response = await api.get('/admin/reports/alert-config/');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert config:', error);
      throw error;
    }
  }

  /**
   * Actualiza configuración de alertas
   */
  async updateAlertConfig(config) {
    try {
      const response = await api.put('/admin/reports/alert-config/', config);
      return response.data;
    } catch (error) {
      console.error('Error updating alert config:', error);
      throw error;
    }
  }

  /**
   * Obtiene historial de alertas
   */
  async getAlertHistory(timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/alert-history/', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alert history:', error);
      throw error;
    }
  }

  /**
   * Registra una acción de auditoría
   */
  async logAuditAction(action, details = {}) {
    try {
      const response = await api.post('/admin/reports/audit-log/', {
        action,
        details,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error logging audit action:', error);
      throw error;
    }
  }

  /**
   * Obtiene logs de auditoría
   */
  async getAuditLogs(timeRange = '30d', filters = {}) {
    try {
      const response = await api.get('/admin/reports/audit-logs/', {
        params: { time_range: timeRange, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de uso de recursos
   */
  async getResourceUsage(timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/resource-usage/', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching resource usage:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de errores del sistema
   */
  async getErrorMetrics(timeRange = '30d') {
    try {
      const response = await api.get('/admin/reports/error-metrics/', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching error metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene configuración completa del sistema de reportes
   */
  async getReportConfiguration() {
    try {
      const response = await api.get('/admin/reports/configuration/');
      return response.data;
    } catch (error) {
      console.error('Error fetching report configuration:', error);
      // Retornar configuración por defecto en caso de error
      return {
        metrics: [
          {
            id: 'active_users',
            name: 'Usuarios Activos',
            description: 'Número de usuarios activos en el sistema',
            type: 'number',
            category: 'users',
            enabled: true,
            updateFrequency: '30s',
            alertThreshold: 1000,
            priority: 'high'
          },
          {
            id: 'course_enrollments',
            name: 'Inscripciones a Cursos',
            description: 'Total de inscripciones realizadas',
            type: 'number',
            category: 'courses',
            enabled: true,
            updateFrequency: '1m',
            alertThreshold: 500,
            priority: 'medium'
          },
          {
            id: 'system_performance',
            name: 'Rendimiento del Sistema',
            description: 'Métricas de rendimiento general',
            type: 'percentage',
            category: 'technical',
            enabled: true,
            updateFrequency: '10s',
            alertThreshold: 80,
            priority: 'critical'
          }
        ],
        alertThresholds: {
          cpu_usage: 80,
          memory_usage: 85,
          response_time: 2000,
          error_rate: 5
        },
        notifications: {
          email: true,
          slack: false,
          webhook: false
        },
        schedules: [
          {
            id: 'daily_report',
            name: 'Reporte Diario',
            description: 'Reporte automático diario',
            frequency: 'daily',
            enabled: true,
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        userAccess: [
          {
            id: 'admin_user',
            userId: 'admin',
            userName: 'Administrador',
            role: 'admin',
            permissions: ['view', 'edit', 'export', 'configure'],
            createdAt: new Date().toISOString()
          }
        ],
        dataRetention: 365,
        backupFrequency: 'daily',
        performance: {
          caching: true,
          compression: true
        }
      };
    }
  }

  /**
   * Actualiza configuración del sistema de reportes
   */
  async updateReportConfiguration(config) {
    try {
      const response = await api.put('/admin/reports/configuration/', config);
      return response.data;
    } catch (error) {
      console.error('Error updating report configuration:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de conectores externos
   */
  async getExternalConnectors() {
    try {
      const response = await api.get('/admin/reports/external-connectors/');
      return response.data;
    } catch (error) {
      console.error('Error fetching external connectors:', error);
      return {
        googleAnalytics: { connected: false, lastSync: null },
        powerBI: { connected: false, lastSync: null },
        slack: { connected: false, lastSync: null },
        webhook: { connected: false, lastSync: null }
      };
    }
  }

  /**
   * Configura conector externo
   */
  async configureExternalConnector(connectorType, config) {
    try {
      const response = await api.post(`/admin/reports/external-connectors/${connectorType}/`, config);
      return response.data;
    } catch (error) {
      console.error(`Error configuring ${connectorType} connector:`, error);
      throw error;
    }
  }

  /**
   * Obtiene datos de análisis de cohortes
   */
  async getCohortData(timeRange = '12m', cohortType = 'monthly') {
    try {
      const response = await api.get('/admin/reports/cohort-analysis/', {
        params: { time_range: timeRange, cohort_type: cohortType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cohort data:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis predictivo
   */
  async getPredictiveAnalysis(metricType = 'enrollments', timeRange = '90d') {
    try {
      const response = await api.get('/admin/reports/predictive-analysis/', {
        params: { metric_type: metricType, time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching predictive analysis:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
const reportsService = new ReportsService();

export default reportsService;