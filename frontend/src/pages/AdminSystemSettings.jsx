import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Database,
  Shield,
  Mail,
  Server,
  Clock,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../components/Card';

const AdminSystemSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implementar carga de configuraciones desde la API

      // Configuraciones de ejemplo
      const mockSettings = {
        general: {
          site_name: 'Plataforma IFAP',
          site_description: 'Sistema de Gestión Educativa Archivística',
          contact_email: 'admin@ifap.edu.pe',
          timezone: 'America/Lima',
          language: 'es',
          maintenance_mode: false
        },
        security: {
          session_timeout: 3600,
          password_min_length: 8,
          password_require_uppercase: true,
          password_require_numbers: true,
          password_require_symbols: false,
          max_login_attempts: 5,
          lockout_duration: 900,
          two_factor_required: false
        },
        email: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_user: '',
          smtp_password: '',
          smtp_use_tls: true,
          smtp_use_ssl: false,
          from_email: 'noreply@ifap.edu.pe',
          from_name: 'Plataforma IFAP'
        },
        database: {
          backup_enabled: true,
          backup_frequency: 'daily',
          backup_retention_days: 30,
          auto_optimize: true,
          query_logging: false
        },
        system: {
          max_upload_size: 50,
          allowed_file_types: ['pdf', 'doc', 'docx', 'jpg', 'png', 'txt'],
          cache_enabled: true,
          debug_mode: false,
          log_level: 'info'
        }
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implementar guardado de configuraciones
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar las configuraciones');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `system_settings_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          alert('Configuraciones importadas exitosamente');
        } catch {
          alert('Error al importar el archivo. Verifica que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
    { id: 'email', label: 'Correo', icon: <Mail className="w-4 h-4" /> },
    { id: 'database', label: 'Base de Datos', icon: <Database className="w-4 h-4" /> },
    { id: 'system', label: 'Sistema', icon: <Server className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuraciones del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuración del Sistema</h1>
            <p className="text-gray-100">Administra la configuración general de la plataforma</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Panel Admin
            </button>
            <button
              onClick={handleExportSettings}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Exportar
            </button>
            <label className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4 inline mr-1" />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Settings Form */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </div>
              )}
            </button>
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Sitio
                  </label>
                  <input
                    type="text"
                    value={settings.general?.site_name || ''}
                    onChange={(e) => handleSettingChange('general', 'site_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo de Contacto
                  </label>
                  <input
                    type="email"
                    value={settings.general?.contact_email || ''}
                    onChange={(e) => handleSettingChange('general', 'contact_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Sitio
                </label>
                <textarea
                  value={settings.general?.site_description || ''}
                  onChange={(e) => handleSettingChange('general', 'site_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria
                  </label>
                  <select
                    value={settings.general?.timezone || ''}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/Lima">America/Lima (UTC-5)</option>
                    <option value="America/Mexico_City">America/Mexico City (UTC-6)</option>
                    <option value="America/Bogota">America/Bogota (UTC-5)</option>
                    <option value="America/Santiago">America/Santiago (UTC-4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.general?.language || ''}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  checked={settings.general?.maintenance_mode || false}
                  onChange={(e) => handleSettingChange('general', 'maintenance_mode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
                  Modo de Mantenimiento
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de Sesión (segundos)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="86400"
                    value={settings.security?.session_timeout || ''}
                    onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud Mínima de Contraseña
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security?.password_min_length || ''}
                    onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Requisitos de Contraseña</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="require_uppercase"
                      checked={settings.security?.password_require_uppercase || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_uppercase', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="require_uppercase" className="text-sm text-gray-700">
                      Requiere mayúsculas
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="require_numbers"
                      checked={settings.security?.password_require_numbers || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_numbers', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="require_numbers" className="text-sm text-gray-700">
                      Requiere números
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="require_symbols"
                      checked={settings.security?.password_require_symbols || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_symbols', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="require_symbols" className="text-sm text-gray-700">
                      Requiere símbolos
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Intentos de Login
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security?.max_login_attempts || ''}
                    onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del Bloqueo (segundos)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="3600"
                    value={settings.security?.lockout_duration || ''}
                    onChange={(e) => handleSettingChange('security', 'lockout_duration', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="two_factor_required"
                  checked={settings.security?.two_factor_required || false}
                  onChange={(e) => handleSettingChange('security', 'two_factor_required', e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="two_factor_required" className="text-sm font-medium text-gray-700">
                  Autenticación de Dos Factores Requerida
                </label>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.email?.smtp_host || ''}
                    onChange={(e) => handleSettingChange('email', 'smtp_host', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puerto SMTP
                  </label>
                  <input
                    type="number"
                    value={settings.email?.smtp_port || ''}
                    onChange={(e) => handleSettingChange('email', 'smtp_port', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.email?.smtp_user || ''}
                    onChange={(e) => handleSettingChange('email', 'smtp_user', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.email?.smtp_password || ''}
                      onChange={(e) => handleSettingChange('email', 'smtp_password', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Remitente
                  </label>
                  <input
                    type="email"
                    value={settings.email?.from_email || ''}
                    onChange={(e) => handleSettingChange('email', 'from_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Remitente
                  </label>
                  <input
                    type="text"
                    value={settings.email?.from_name || ''}
                    onChange={(e) => handleSettingChange('email', 'from_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="smtp_use_tls"
                    checked={settings.email?.smtp_use_tls || false}
                    onChange={(e) => handleSettingChange('email', 'smtp_use_tls', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smtp_use_tls" className="text-sm text-gray-700">
                    Usar TLS
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="smtp_use_ssl"
                    checked={settings.email?.smtp_use_ssl || false}
                    onChange={(e) => handleSettingChange('email', 'smtp_use_ssl', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smtp_use_ssl" className="text-sm text-gray-700">
                    Usar SSL
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-sm font-medium text-yellow-800">
                    Configuraciones Críticas
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Los cambios en esta sección pueden afectar el rendimiento y la estabilidad del sistema.
                  Se recomienda hacer una copia de seguridad antes de realizar modificaciones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Backup
                  </label>
                  <select
                    value={settings.database?.backup_frequency || ''}
                    onChange={(e) => handleSettingChange('database', 'backup_frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="hourly">Cada hora</option>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retención de Backups (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.database?.backup_retention_days || ''}
                    onChange={(e) => handleSettingChange('database', 'backup_retention_days', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="backup_enabled"
                    checked={settings.database?.backup_enabled || false}
                    onChange={(e) => handleSettingChange('database', 'backup_enabled', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="backup_enabled" className="text-sm text-gray-700">
                    Habilitar Backups Automáticos
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto_optimize"
                    checked={settings.database?.auto_optimize || false}
                    onChange={(e) => handleSettingChange('database', 'auto_optimize', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto_optimize" className="text-sm text-gray-700">
                    Optimización Automática
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="query_logging"
                    checked={settings.database?.query_logging || false}
                    onChange={(e) => handleSettingChange('database', 'query_logging', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="query_logging" className="text-sm text-gray-700">
                    Logging de Consultas (Debug)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño Máximo de Archivo (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={settings.system?.max_upload_size || ''}
                    onChange={(e) => handleSettingChange('system', 'max_upload_size', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Logging
                  </label>
                  <select
                    value={settings.system?.log_level || ''}
                    onChange={(e) => handleSettingChange('system', 'log_level', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de Archivo Permitidos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['pdf', 'doc', 'docx', 'jpg', 'png', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`file_type_${type}`}
                        checked={settings.system?.allowed_file_types?.includes(type) || false}
                        onChange={(e) => {
                          const currentTypes = settings.system?.allowed_file_types || [];
                          const newTypes = e.target.checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          handleSettingChange('system', 'allowed_file_types', newTypes);
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`file_type_${type}`} className="text-sm text-gray-700 uppercase">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="cache_enabled"
                    checked={settings.system?.cache_enabled || false}
                    onChange={(e) => handleSettingChange('system', 'cache_enabled', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="cache_enabled" className="text-sm text-gray-700">
                    Habilitar Cache
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="debug_mode"
                    checked={settings.system?.debug_mode || false}
                    onChange={(e) => handleSettingChange('system', 'debug_mode', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="debug_mode" className="text-sm text-gray-700">
                    Modo Debug
                  </label>
                  {settings.system?.debug_mode && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      ⚠️ Solo para desarrollo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* System Status */}
      <Card variant="info" className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <span className="font-medium">Última modificación:</span>
                <p>{new Date().toLocaleString('es-ES')}</p>
              </div>
              <div>
                <span className="font-medium">Versión del sistema:</span>
                <p>v2.1.0</p>
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <p className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Operativo</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSystemSettings;
