import React, { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

const ConfiguracionAulaVirtual = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [settings, setSettings] = useState({
    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    forumNotifications: false,
    messageNotifications: true,

    // Privacidad
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: true,

    // Apariencia
    theme: 'light',
    language: 'es',

    // Preferencias de estudio
    studyReminders: true,
    weeklyGoals: true,
    progressTracking: true
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    institution: 'IFAP',
    career: 'Archivística'
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleProfileUpdate = () => {
    // Aquí iría la lógica para actualizar el perfil
    console.log('Actualizando perfil:', profileData);
  };

  const handlePasswordChange = () => {
    // Aquí iría la lógica para cambiar la contraseña
    console.log('Cambiando contraseña');
  };

  const tabs = [
    { id: 'perfil', name: 'Perfil', icon: '👤' },
    { id: 'notificaciones', name: 'Notificaciones', icon: '🔔' },
    { id: 'privacidad', name: 'Privacidad', icon: '🔒' },
    { id: 'apariencia', name: 'Apariencia', icon: '🎨' },
    { id: 'seguridad', name: 'Seguridad', icon: '🛡️' },
    { id: 'estudio', name: 'Estudio', icon: '📚' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-primary-100">Personaliza tu experiencia en el aula virtual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <Card className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </Card>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Perfil</h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Cambiar Foto
                    </button>
                    <p className="text-sm text-gray-600 mt-1">JPG, PNG o GIF. Máx 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                    <input
                      type="text"
                      value={profileData.institution}
                      onChange={(e) => setProfileData({...profileData, institution: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                    <input
                      type="text"
                      value={profileData.career}
                      onChange={(e) => setProfileData({...profileData, career: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Notificaciones */}
          {activeTab === 'notificaciones' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferencias de Notificaciones</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones por Email</h3>
                    <p className="text-sm text-gray-600">Recibe notificaciones importantes por correo electrónico</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones Push</h3>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real en tu navegador</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Recordatorios de Tareas</h3>
                    <p className="text-sm text-gray-600">Recibe recordatorios sobre tareas pendientes y fechas límite</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.taskReminders}
                      onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones del Foro</h3>
                    <p className="text-sm text-gray-600">Recibe notificaciones cuando hay nuevas respuestas en tus temas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.forumNotifications}
                      onChange={(e) => handleSettingChange('forumNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mensajes Privados</h3>
                    <p className="text-sm text-gray-600">Recibe notificaciones de nuevos mensajes privados</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.messageNotifications}
                      onChange={(e) => handleSettingChange('messageNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Privacidad */}
          {activeTab === 'privacidad' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Privacidad</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Visibilidad del Perfil</label>
                  <div className="space-y-2">
                    {[
                      { value: 'public', label: 'Público', desc: 'Tu perfil es visible para todos los usuarios' },
                      { value: 'students', label: 'Solo Estudiantes', desc: 'Solo otros estudiantes pueden ver tu perfil' },
                      { value: 'private', label: 'Privado', desc: 'Solo tú puedes ver tu perfil completo' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={settings.profileVisibility === option.value}
                          onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mostrar Estado Online</h3>
                    <p className="text-sm text-gray-600">Permite que otros usuarios vean cuando estás conectado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showOnlineStatus}
                      onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Permitir Mensajes</h3>
                    <p className="text-sm text-gray-600">Permite que otros usuarios te envíen mensajes privados</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowMessages}
                      onChange={(e) => handleSettingChange('allowMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Apariencia */}
          {activeTab === 'apariencia' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferencias de Apariencia</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'light', label: 'Claro', icon: '☀️' },
                      { value: 'dark', label: 'Oscuro', icon: '🌙' }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => handleSettingChange('theme', theme.value)}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          settings.theme === theme.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{theme.icon}</span>
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Idioma</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Seguridad */}
          {activeTab === 'seguridad' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Seguridad</h2>

              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sesiones Activas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sesión Actual</p>
                        <p className="text-xs text-gray-600">Chrome en Windows • Activa ahora</p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Activa</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sesión Anterior</p>
                        <p className="text-xs text-gray-600">Mobile App • Hace 2 días</p>
                      </div>
                      <button className="text-xs text-red-600 hover:text-red-800 font-medium">
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Estudio */}
          {activeTab === 'estudio' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferencias de Estudio</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Recordatorios de Estudio</h3>
                    <p className="text-sm text-gray-600">Recibe recordatorios para mantener tu rutina de estudio</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.studyReminders}
                      onChange={(e) => handleSettingChange('studyReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Metas Semanales</h3>
                    <p className="text-sm text-gray-600">Establece y sigue metas de estudio semanales</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weeklyGoals}
                      onChange={(e) => handleSettingChange('weeklyGoals', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Seguimiento de Progreso</h3>
                    <p className="text-sm text-gray-600">Monitorea tu progreso en cursos y actividades</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.progressTracking}
                      onChange={(e) => handleSettingChange('progressTracking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAulaVirtual;