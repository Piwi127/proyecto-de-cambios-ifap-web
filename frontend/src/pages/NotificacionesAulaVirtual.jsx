import React, { useState } from 'react';
import Card from '../components/Card';

const NotificacionesAulaVirtual = () => {
  const [filter, setFilter] = useState('todas');

  const notifications = [
    {
      id: 1,
      type: 'tarea',
      title: 'Nueva tarea asignada',
      message: 'Se ha asignado la tarea "Proyecto de Digitalización" con fecha límite: 20/09/2025',
      timestamp: '2025-09-15 09:00',
      read: false,
      priority: 'alta',
      icon: '📝'
    },
    {
      id: 2,
      type: 'curso',
      title: 'Material nuevo disponible',
      message: 'Se han subido nuevas diapositivas al módulo "Preservación de Documentos"',
      timestamp: '2025-09-14 16:30',
      read: false,
      priority: 'media',
      icon: '📚'
    },
    {
      id: 3,
      type: 'foro',
      title: 'Nueva respuesta en el foro',
      message: 'Carlos Rodríguez respondió a tu pregunta sobre organización de archivos',
      timestamp: '2025-09-14 14:20',
      read: true,
      priority: 'baja',
      icon: '💬'
    },
    {
      id: 4,
      type: 'calendario',
      title: 'Recordatorio de evento',
      message: 'Clase de Archivística Básica mañana a las 10:00 AM',
      timestamp: '2025-09-13 18:00',
      read: true,
      priority: 'media',
      icon: '📅'
    },
    {
      id: 5,
      type: 'sistema',
      title: 'Mantenimiento programado',
      message: 'El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 4:00 AM',
      timestamp: '2025-09-12 12:00',
      read: true,
      priority: 'baja',
      icon: '⚙️'
    },
    {
      id: 6,
      type: 'mensaje',
      title: 'Nuevo mensaje privado',
      message: 'Tienes un mensaje nuevo de la Prof. Ana García',
      timestamp: '2025-09-15 08:30',
      read: false,
      priority: 'alta',
      icon: '💌'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'todas') return true;
    if (filter === 'no-leidas') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    // Aquí iría la lógica para marcar como leída en el backend
    console.log('Marcando notificación como leída:', id);
  };

  const markAllAsRead = () => {
    // Aquí iría la lógica para marcar todas como leídas
    console.log('Marcando todas las notificaciones como leídas');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'border-l-red-500 bg-red-50';
      case 'media': return 'border-l-yellow-500 bg-yellow-50';
      case 'baja': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'tarea': return 'Tarea';
      case 'curso': return 'Curso';
      case 'foro': return 'Foro';
      case 'calendario': return 'Calendario';
      case 'sistema': return 'Sistema';
      case 'mensaje': return 'Mensaje';
      default: return 'General';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    if (diff < 172800000) return `Ayer ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
        <p className="text-primary-100">Mantente al día con todas tus actividades académicas</p>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', name: 'Todas', count: notifications.length },
              { id: 'no-leidas', name: 'No Leídas', count: unreadCount },
              { id: 'tarea', name: 'Tareas', count: notifications.filter(n => n.type === 'tarea').length },
              { id: 'curso', name: 'Cursos', count: notifications.filter(n => n.type === 'curso').length },
              { id: 'mensaje', name: 'Mensajes', count: notifications.filter(n => n.type === 'mensaje').length }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.name}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  filter === filterOption.id ? 'bg-primary-500' : 'bg-gray-200'
                }`}>
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Marcar Todas como Leídas
            </button>
          )}
        </div>
      </Card>

      {/* Lista de notificaciones */}
      <Card>
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
                getPriorityColor(notification.priority)
              } ${!notification.read ? 'border-l-4' : 'border-l-gray-300'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                  }`}>
                    {notification.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-lg font-semibold ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatTime(notification.timestamp)}</span>
                  </div>

                  <p className={`text-sm mb-3 ${
                    notification.read ? 'text-gray-600' : 'text-gray-800'
                  }`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      notification.type === 'tarea' ? 'bg-blue-100 text-blue-800' :
                      notification.type === 'curso' ? 'bg-green-100 text-green-800' :
                      notification.type === 'foro' ? 'bg-purple-100 text-purple-800' :
                      notification.type === 'mensaje' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getTypeLabel(notification.type)}
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${
                        notification.priority === 'alta' ? 'text-red-600' :
                        notification.priority === 'media' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        Prioridad {notification.priority}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">🔔</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">
              {filter === 'no-leidas'
                ? '¡Excelente! Has leído todas tus notificaciones'
                : 'No hay notificaciones en esta categoría'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{notifications.length}</h3>
          <p className="text-gray-600">Total Notificaciones</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">🔴</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{unreadCount}</h3>
          <p className="text-gray-600">No Leídas</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {notifications.filter(n => n.priority === 'alta').length}
          </h3>
          <p className="text-gray-600">Alta Prioridad</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {notifications.filter(n => n.type === 'calendario').length}
          </h3>
          <p className="text-gray-600">Eventos</p>
        </Card>
      </div>
    </div>
  );
};

export default NotificacionesAulaVirtual;