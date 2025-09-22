import React, { useState, useEffect, createContext, useContext } from 'react';

// Context for notification system
const AdminNotificationContext = createContext();

// Hook to use notifications
export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
  }
  return context;
};

// Sound utility for notifications
const playNotificationSound = (type) => {
  // Only play sound if user hasn't disabled it and browser supports it
  if (typeof window !== 'undefined' && window.localStorage.getItem('notification-sounds') !== 'false') {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500,
        confirm: 700,
        bulk: 650
      };

      oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug('Audio notification not available');
    }
  }
};

// Notification Provider Component
export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(1);

  const addNotification = (notification) => {
    const id = nextId;
    setNextId(prev => prev + 1);

    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      autoClose: true,
      timestamp: new Date(),
      progress: 100,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Play sound effect
    playNotificationSound(newNotification.type);

    // Auto remove notification with progress animation
    if (newNotification.autoClose && newNotification.duration > 0) {
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, newNotification.duration - elapsed);
        const progress = (remaining / newNotification.duration) * 100;

        setNotifications(prev => prev.map(n =>
          n.id === id ? { ...n, progress } : n
        ));

        if (remaining > 0) {
          requestAnimationFrame(updateProgress);
        } else {
          removeNotification(id);
        }
      };

      requestAnimationFrame(updateProgress);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      icon: '✅',
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      icon: '❌',
      duration: 8000,
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      icon: '⚠️',
      duration: 6000,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      icon: 'ℹ️',
      ...options
    });
  };

  const showConfirm = (message, onConfirm, onCancel, options = {}) => {
    return addNotification({
      type: 'confirm',
      message,
      icon: '❓',
      duration: 0,
      autoClose: false,
      onConfirm,
      onCancel,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      ...options
    });
  };

  const showBulkOperation = (operation, count, onConfirm, onCancel, options = {}) => {
    const operationLabels = {
      activate: 'activar',
      deactivate: 'desactivar',
      delete: 'eliminar'
    };

    return addNotification({
      type: 'bulk',
      message: `¿Estás seguro de que deseas ${operationLabels[operation]} ${count} cursos?`,
      icon: '📦',
      duration: 0,
      autoClose: false,
      onConfirm,
      onCancel,
      confirmText: `${operationLabels[operation].charAt(0).toUpperCase() + operationLabels[operation].slice(1)} ${count} cursos`,
      cancelText: 'Cancelar',
      operation,
      count,
      ...options
    });
  };

  const showProgress = (message, options = {}) => {
    return addNotification({
      type: 'progress',
      message,
      icon: '⏳',
      duration: 0,
      autoClose: false,
      progress: 0,
      ...options
    });
  };

  const updateProgress = (id, progress, message = null) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, progress, message: message || n.message } : n
    ));
  };

  const showLoading = (message, options = {}) => {
    return addNotification({
      type: 'loading',
      message,
      icon: '🔄',
      duration: 0,
      autoClose: false,
      ...options
    });
  };

  const showSystem = (message, options = {}) => {
    return addNotification({
      type: 'system',
      message,
      icon: '⚙️',
      duration: 3000,
      ...options
    });
  };

  const showAchievement = (title, message, options = {}) => {
    return addNotification({
      type: 'achievement',
      message: title,
      details: message,
      icon: '🏆',
      duration: 6000,
      ...options
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showBulkOperation,
    showProgress,
    updateProgress,
    showLoading,
    showSystem,
    showAchievement
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
      <AdminNotificationContainer />
    </AdminNotificationContext.Provider>
  );
};

// Notification Container Component
const AdminNotificationContainer = () => {
  const { notifications, removeNotification } = useAdminNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <AdminNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Notification Component
const AdminNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getNotificationStyles = () => {
    const baseStyles = "p-4 rounded-lg shadow-lg border-l-4 max-w-sm transform transition-all duration-300 relative overflow-hidden";

    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'confirm':
      case 'bulk':
        return `${baseStyles} bg-white border-orange-400 shadow-xl`;
      case 'progress':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'loading':
        return `${baseStyles} bg-indigo-50 border-indigo-400 text-indigo-800`;
      case 'system':
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
      case 'achievement':
        return `${baseStyles} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  const getProgressBarColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-400';
      case 'info': return 'bg-blue-400';
      case 'progress': return 'bg-blue-500';
      case 'loading': return 'bg-indigo-500';
      default: return 'bg-gray-400';
    }
  };

  const renderContent = () => {
    // Progress notification
    if (notification.type === 'progress') {
      return (
        <div>
          <div className="flex items-start">
            <span className="text-xl mr-3">{notification.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.details && (
                <p className="text-xs text-gray-600 mt-1">{notification.details}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                style={{ width: `${notification.progress || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(notification.progress || 0)}% completado
            </div>
          </div>
        </div>
      );
    }

    // Loading notification
    if (notification.type === 'loading') {
      return (
        <div>
          <div className="flex items-start">
            <span className="text-xl mr-3 animate-spin">{notification.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.details && (
                <p className="text-xs text-gray-600 mt-1">{notification.details}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // Achievement notification
    if (notification.type === 'achievement') {
      return (
        <div>
          <div className="flex items-start">
            <span className="text-2xl mr-3 animate-bounce">{notification.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold">{notification.message}</p>
              {notification.details && (
                <p className="text-xs text-gray-600 mt-1">{notification.details}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // Confirm/Bulk notifications
    if (notification.type === 'confirm' || notification.type === 'bulk') {
      return (
        <div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">{notification.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.type === 'bulk' && notification.count && (
                <p className="text-xs text-gray-600 mt-1">
                  Esta operación afectará a {notification.count} cursos
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                notification.onCancel?.();
                handleClose();
              }}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {notification.cancelText}
            </button>
            <button
              onClick={() => {
                notification.onConfirm?.();
                handleClose();
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                notification.type === 'bulk' && notification.operation === 'delete'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {notification.confirmText}
            </button>
          </div>
        </div>
      );
    }

    // Default notification
    return (
      <div className="flex items-start">
        <span className="text-xl mr-3">{notification.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
          {notification.details && (
            <p className="text-xs text-gray-600 mt-1">{notification.details}</p>
          )}
          {notification.timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              {notification.timestamp.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div
      className={`${getNotificationStyles()} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {renderContent()}
    </div>
  );
};

// HOC for components that need notifications
export const withAdminNotifications = (Component) => {
  return (props) => {
    const notificationContext = useAdminNotifications();

    return (
      <Component
        {...props}
        notifications={notificationContext}
      />
    );
  };
};

export default AdminNotificationProvider;