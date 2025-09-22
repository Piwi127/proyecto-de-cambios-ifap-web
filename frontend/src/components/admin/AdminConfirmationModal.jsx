import React, { useState, useEffect } from 'react';
import { validateAdminPermissions } from '../../utils/validation.js';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'danger', 'info'
  showReasonField = false,
  reasonLabel = 'Razón del cambio',
  reasonPlaceholder = 'Explique el motivo de esta acción...',
  affectedItems = [],
  loading = false,
  children
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      const { hasPermission: permission, error } = validateAdminPermissions(user);
      setHasPermission(permission);
      if (!permission) {
        console.error('Permisos insuficientes:', error);
      }
    }
  }, [isOpen, user]);

  const handleConfirm = async () => {
    if (!hasPermission) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    // Validar razón si es requerida
    if (showReasonField && !reason.trim()) {
      setErrors({ reason: 'Debe proporcionar una razón para esta acción' });
      return;
    }

    try {
      await onConfirm(reason.trim());
      setReason('');
      setErrors({});
    } catch (error) {
      console.error('Error en confirmación:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setErrors({});
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700',
          headerBg: 'bg-red-50 border-red-200'
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          headerBg: 'bg-yellow-50 border-yellow-200'
        };
      case 'info':
        return {
          icon: (
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700',
          headerBg: 'bg-blue-50 border-blue-200'
        };
      default:
        return {
          icon: (
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-gray-100',
          button: 'bg-gray-600 hover:bg-gray-700',
          headerBg: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className={`flex items-center p-4 rounded-t-md ${styles.headerBg}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            {styles.icon}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {!hasPermission && (
              <p className="text-sm text-red-600 mt-1">No tienes permisos para esta acción</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="ml-auto text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          {/* Affected Items */}
          {affectedItems.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Elementos afectados ({affectedItems.length}):
              </p>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-2">
                <ul className="text-sm text-gray-600 space-y-1">
                  {affectedItems.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {item.title || item.name || `Elemento ${index + 1}`}
                    </li>
                  ))}
                  {affectedItems.length > 5 && (
                    <li className="text-gray-500 italic">
                      ... y {affectedItems.length - 5} más
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Reason Field */}
          {showReasonField && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reasonLabel}
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors(prev => ({ ...prev, reason: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder={reasonPlaceholder}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {reason.length}/500 caracteres
              </p>
            </div>
          )}

          {/* Custom Content */}
          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}

          {/* Warning for destructive actions */}
          {type === 'danger' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Acción irreversible</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Esta acción no se puede deshacer. Asegúrate de que realmente quieres proceder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !hasPermission}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmationModal;