import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminCourseMaintenance = ({
  onClose,
  onMaintenanceComplete,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState('cleanup');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'healthy', size: '2.4 GB', lastOptimized: '2024-01-15' },
    storage: { used: '15.2 GB', available: '84.8 GB', utilization: 15 },
    performance: { responseTime: '120ms', uptime: '99.9%', activeUsers: 245 },
    maintenance: { lastCleanup: '2024-01-10', lastBackup: '2024-01-15', nextScheduled: '2024-01-22' }
  });

  const [cleanupOptions, setCleanupOptions] = useState({
    oldCourses: { enabled: true, daysOld: 365, dryRun: true },
    orphanedEnrollments: { enabled: true, daysOld: 180, dryRun: true },
    unusedFiles: { enabled: true, daysOld: 90, dryRun: true },
    oldLogs: { enabled: true, daysOld: 30, dryRun: true },
    failedJobs: { enabled: true, daysOld: 7, dryRun: true }
  });

  const [backupOptions, setBackupOptions] = useState({
    type: 'full',
    includeFiles: true,
    includeDatabase: true,
    includeLogs: false,
    compression: true,
    encryption: false,
    destination: 'local',
    schedule: false,
    frequency: 'daily'
  });

  const [optimizationOptions, setOptimizationOptions] = useState({
    databaseIndexes: true,
    cleanTempFiles: true,
    optimizeImages: true,
    rebuildSearchIndex: false,
    updateStatistics: true,
    defragmentDatabase: false
  });

  const [monitoringOptions, setMonitoringOptions] = useState({
    enableAlerts: true,
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      responseTime: 500
    },
    logLevel: 'info',
    retentionDays: 30
  });

  // Load system status on component mount
  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Simulate API call - replace with actual service call
      const mockStatus = {
        database: { status: 'healthy', size: '2.4 GB', lastOptimized: '2024-01-15' },
        storage: { used: '15.2 GB', available: '84.8 GB', utilization: 15 },
        performance: { responseTime: '120ms', uptime: '99.9%', activeUsers: 245 },
        maintenance: { lastCleanup: '2024-01-10', lastBackup: '2024-01-15', nextScheduled: '2024-01-22' }
      };

      setSystemStatus(mockStatus);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const handleCleanup = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = {
        success: true,
        message: 'Limpieza del sistema completada exitosamente',
        details: {
          coursesRemoved: 15,
          enrollmentsCleaned: 45,
          filesDeleted: 120,
          logsArchived: 30,
          jobsCleaned: 5,
          spaceFreed: '2.1 GB'
        },
        timestamp: new Date().toISOString()
      };

      if (onMaintenanceComplete) {
        onMaintenanceComplete('cleanup', result);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Reload system status
      await loadSystemStatus();

    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Error durante la limpieza: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 5000));

      const result = {
        success: true,
        message: 'Respaldo del sistema creado exitosamente',
        details: {
          backupId: 'backup_20240115_143022',
          type: backupOptions.type,
          size: '8.7 GB',
          duration: '3m 45s',
          location: backupOptions.destination === 'local' ? '/backups/' : 'cloud-storage',
          checksum: 'sha256:abc123...'
        },
        timestamp: new Date().toISOString()
      };

      if (onMaintenanceComplete) {
        onMaintenanceComplete('backup', result);
      }

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Error during backup:', error);
      alert('Error durante el respaldo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimization = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 4000));

      const result = {
        success: true,
        message: 'Optimización del sistema completada',
        details: {
          indexesOptimized: 12,
          tempFilesCleaned: 156,
          imagesOptimized: 89,
          searchIndexRebuilt: optimizationOptions.rebuildSearchIndex,
          statisticsUpdated: true,
          databaseDefragmented: optimizationOptions.defragmentDatabase,
          performanceImprovement: '23%'
        },
        timestamp: new Date().toISOString()
      };

      if (onMaintenanceComplete) {
        onMaintenanceComplete('optimization', result);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Reload system status
      await loadSystemStatus();

    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Error durante la optimización: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringUpdate = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = {
        success: true,
        message: 'Configuración de monitoreo actualizada',
        details: {
          alertsEnabled: monitoringOptions.enableAlerts,
          thresholdsSet: monitoringOptions.alertThresholds,
          logLevel: monitoringOptions.logLevel,
          retentionUpdated: true
        },
        timestamp: new Date().toISOString()
      };

      if (onMaintenanceComplete) {
        onMaintenanceComplete('monitoring', result);
      }

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('Error updating monitoring:', error);
      alert('Error al actualizar el monitoreo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'cleanup', label: 'Limpieza', icon: '🧹' },
    { id: 'backup', label: 'Respaldo', icon: '💾' },
    { id: 'optimization', label: 'Optimización', icon: '⚡' },
    { id: 'monitoring', label: 'Monitoreo', icon: '📊' },
    { id: 'status', label: 'Estado', icon: '📈' }
  ];

  // Cleanup Tab Component
  const CleanupTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Opciones de Limpieza</h4>
        <p className="text-sm text-blue-700">
          Selecciona qué elementos limpiar y si deseas hacer una prueba primero (dry run).
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(cleanupOptions).map(([key, option]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={option.enabled}
                  onChange={(e) => setCleanupOptions(prev => ({
                    ...prev,
                    [key]: { ...prev[key], enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 font-medium text-gray-900">
                  {key === 'oldCourses' && 'Cursos antiguos'}
                  {key === 'orphanedEnrollments' && 'Inscripciones huérfanas'}
                  {key === 'unusedFiles' && 'Archivos no utilizados'}
                  {key === 'oldLogs' && 'Registros antiguos'}
                  {key === 'failedJobs' && 'Trabajos fallidos'}
                </span>
              </div>
              <div className="ml-7 mt-1">
                <span className="text-sm text-gray-500">
                  {option.daysOld > 0 ? `Eliminar elementos de más de ${option.daysOld} días` : 'Eliminar todos los elementos'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={option.dryRun}
                  onChange={(e) => setCleanupOptions(prev => ({
                    ...prev,
                    [key]: { ...prev[key], dryRun: e.target.checked }
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Prueba</span>
              </label>
              <input
                type="number"
                min="0"
                value={option.daysOld}
                onChange={(e) => setCleanupOptions(prev => ({
                  ...prev,
                  [key]: { ...prev[key], daysOld: parseInt(e.target.value) }
                }))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="días"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Limpiando...
            </div>
          ) : (
            'Ejecutar Limpieza'
          )}
        </button>
      </div>
    </div>
  );

  // Backup Tab Component
  const BackupTab = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">Configuración de Respaldo</h4>
        <p className="text-sm text-green-700">
          Configura las opciones para crear un respaldo completo del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de respaldo
          </label>
          <select
            value={backupOptions.type}
            onChange={(e) => setBackupOptions(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="full">Completo</option>
            <option value="incremental">Incremental</option>
            <option value="differential">Diferencial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destino
          </label>
          <select
            value={backupOptions.destination}
            onChange={(e) => setBackupOptions(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="local">Local</option>
            <option value="cloud">Nube</option>
            <option value="external">Externo</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">Incluir en el respaldo:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={backupOptions.includeDatabase}
              onChange={(e) => setBackupOptions(prev => ({ ...prev, includeDatabase: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Base de datos</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={backupOptions.includeFiles}
              onChange={(e) => setBackupOptions(prev => ({ ...prev, includeFiles: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Archivos del sistema</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={backupOptions.includeLogs}
              onChange={(e) => setBackupOptions(prev => ({ ...prev, includeLogs: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Registros del sistema</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={backupOptions.compression}
              onChange={(e) => setBackupOptions(prev => ({ ...prev, compression: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Compresión</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleBackup}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando respaldo...
            </div>
          ) : (
            'Crear Respaldo'
          )}
        </button>
      </div>
    </div>
  );

  // Optimization Tab Component
  const OptimizationTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-purple-800 mb-2">Opciones de Optimización</h4>
        <p className="text-sm text-purple-700">
          Selecciona las tareas de optimización a realizar para mejorar el rendimiento del sistema.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.databaseIndexes}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, databaseIndexes: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Optimizar índices de base de datos</div>
            <div className="text-sm text-gray-500">Reconstruir y optimizar índices para mejorar consultas</div>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.cleanTempFiles}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, cleanTempFiles: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Limpiar archivos temporales</div>
            <div className="text-sm text-gray-500">Eliminar archivos temporales y cachés obsoletos</div>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.optimizeImages}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, optimizeImages: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Optimizar imágenes</div>
            <div className="text-sm text-gray-500">Comprimir y optimizar imágenes para reducir tamaño</div>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.rebuildSearchIndex}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, rebuildSearchIndex: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Reconstruir índice de búsqueda</div>
            <div className="text-sm text-gray-500">Reconstruir completamente el índice de búsqueda</div>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.updateStatistics}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, updateStatistics: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Actualizar estadísticas</div>
            <div className="text-sm text-gray-500">Actualizar estadísticas de uso y rendimiento</div>
          </div>
        </label>

        <label className="flex items-center p-3 border rounded-md">
          <input
            type="checkbox"
            checked={optimizationOptions.defragmentDatabase}
            onChange={(e) => setOptimizationOptions(prev => ({ ...prev, defragmentDatabase: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">Desfragmentar base de datos</div>
            <div className="text-sm text-gray-500">Desfragmentar tablas y optimizar almacenamiento</div>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleOptimization}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Optimizando...
            </div>
          ) : (
            'Ejecutar Optimización'
          )}
        </button>
      </div>
    </div>
  );

  // Monitoring Tab Component
  const MonitoringTab = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-orange-800 mb-2">Configuración de Monitoreo</h4>
        <p className="text-sm text-orange-700">
          Configura alertas y monitoreo del sistema para mantener el rendimiento óptimo.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={monitoringOptions.enableAlerts}
              onChange={(e) => setMonitoringOptions(prev => ({ ...prev, enableAlerts: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 font-medium text-gray-900">Habilitar alertas automáticas</span>
          </label>
        </div>

        {monitoringOptions.enableAlerts && (
          <div className="ml-6 space-y-4">
            <h5 className="font-medium text-gray-900">Umbrales de alerta:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uso de CPU (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monitoringOptions.alertThresholds.cpuUsage}
                  onChange={(e) => setMonitoringOptions(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, cpuUsage: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uso de memoria (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monitoringOptions.alertThresholds.memoryUsage}
                  onChange={(e) => setMonitoringOptions(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, memoryUsage: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uso de disco (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={monitoringOptions.alertThresholds.diskUsage}
                  onChange={(e) => setMonitoringOptions(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, diskUsage: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de respuesta (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={monitoringOptions.alertThresholds.responseTime}
                  onChange={(e) => setMonitoringOptions(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, responseTime: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de registro
            </label>
            <select
              value={monitoringOptions.logLevel}
              onChange={(e) => setMonitoringOptions(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retención de registros (días)
            </label>
            <input
              type="number"
              min="1"
              value={monitoringOptions.retentionDays}
              onChange={(e) => setMonitoringOptions(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleMonitoringUpdate}
          disabled={loading}
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Actualizando...
            </div>
          ) : (
            'Actualizar Configuración'
          )}
        </button>
      </div>
    </div>
  );

  // Status Tab Component
  const StatusTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-4">Estado del Sistema</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Status */}
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Base de Datos</h5>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemStatus.database.status)}`}>
                {systemStatus.database.status === 'healthy' ? 'Saludable' :
                 systemStatus.database.status === 'warning' ? 'Advertencia' : 'Crítico'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-medium">{systemStatus.database.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última optimización:</span>
                <span className="font-medium">{systemStatus.database.lastOptimized}</span>
              </div>
            </div>
          </div>

          {/* Storage Status */}
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Almacenamiento</h5>
              <span className="text-sm text-gray-600">{systemStatus.storage.utilization}% usado</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Usado:</span>
                <span className="font-medium">{systemStatus.storage.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disponible:</span>
                <span className="font-medium">{systemStatus.storage.available}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${systemStatus.storage.utilization}%` }}
              ></div>
            </div>
          </div>

          {/* Performance Status */}
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Rendimiento</h5>
              <span className="text-sm text-green-600">{systemStatus.performance.uptime} uptime</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo de respuesta:</span>
                <span className="font-medium">{systemStatus.performance.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usuarios activos:</span>
                <span className="font-medium">{systemStatus.performance.activeUsers}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Status */}
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Mantenimiento</h5>
              <span className="text-sm text-blue-600">Próximo: {systemStatus.maintenance.nextScheduled}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Última limpieza:</span>
                <span className="font-medium">{systemStatus.maintenance.lastCleanup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último respaldo:</span>
                <span className="font-medium">{systemStatus.maintenance.lastBackup}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={loadSystemStatus}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Actualizar Estado
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cleanup':
        return <CleanupTab />;
      case 'backup':
        return <BackupTab />;
      case 'optimization':
        return <OptimizationTab />;
      case 'monitoring':
        return <MonitoringTab />;
      case 'status':
        return <StatusTab />;
      default:
        return <CleanupTab />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Herramientas de Mantenimiento del Sistema
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseMaintenance;