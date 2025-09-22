import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import NotificationList from '../components/NotificationList';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const NotificacionesAulaVirtual = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('todas');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch existing notifications from the backend
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/notifications/');
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (newWsNotifications.length > 0) {
      // Add new WebSocket notifications to the existing list
      setNotifications((prev) => [...newWsNotifications, ...prev]);
    }
  }, [newWsNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'todas') return true;
    if (filter === 'no-leidas') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_as_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
        <NotificationList notifications={filteredNotifications} markAsRead={markAsRead} />
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