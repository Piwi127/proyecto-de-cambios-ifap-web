import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PermissionCheck - Componente para verificar permisos específicos
 *
 * @param {Object} props
 * @param {string} props.permission - Permiso requerido
 * @param {ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {ReactNode} props.fallback - Contenido a mostrar si no tiene permisos
 * @param {boolean} props.showError - Si mostrar mensaje de error (default: true)
 */
const PermissionCheck = ({
  permission,
  children,
  fallback = null,
  showError = true
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    if (showError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Permiso requerido
              </h3>
              <div className="mt-2 text-sm text-red-700">
                No tienes el permiso "{permission}" para acceder a esta funcionalidad.
              </div>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * PermissionCheck.All - Verifica múltiples permisos (requiere todos)
 */
PermissionCheck.All = ({ permissions, children, fallback = null, showError = true }) => {
  const { hasPermission } = useAuth();

  const hasAllPermissions = permissions.every(permission => hasPermission(permission));

  if (!hasAllPermissions) {
    if (showError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Permisos requeridos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                Debes tener todos estos permisos: {permissions.join(', ')}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * PermissionCheck.Any - Verifica múltiples permisos (requiere al menos uno)
 */
PermissionCheck.Any = ({ permissions, children, fallback = null, showError = true }) => {
  const { hasPermission } = useAuth();

  const hasAnyPermission = permissions.some(permission => hasPermission(permission));

  if (!hasAnyPermission) {
    if (showError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Permiso requerido
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                Debes tener al menos uno de estos permisos: {permissions.join(', ')}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionCheck;