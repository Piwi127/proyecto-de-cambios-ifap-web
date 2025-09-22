import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * RoleGuard - Componente para proteger secciones UI basadas en roles
 *
 * @param {Object} props
 * @param {string|string[]} props.roles - Rol(es) requerido(s)
 * @param {string} props.requiredPermission - Permiso específico requerido
 * @param {ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {ReactNode} props.fallback - Contenido a mostrar si no tiene permisos
 * @param {boolean} props.requireAll - Si true, requiere todos los roles (default: false)
 */
const RoleGuard = ({
  roles,
  requiredPermission,
  children,
  fallback = null,
  requireAll = false,
  showError = true
}) => {
  const { user, hasRole, hasAnyRole, hasAllRoles, hasPermission } = useAuth();

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) {
    return fallback;
  }

  // Verificar permisos específicos
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Acceso denegado
              </h3>
              <div className="mt-2 text-sm text-red-700">
                No tienes permisos para acceder a esta sección.
              </div>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  // Verificar roles
  if (roles) {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRoles = requireAll
      ? hasAllRoles(rolesArray)
      : hasAnyRole(rolesArray);

    if (!hasRequiredRoles) {
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
                  Rol requerido
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {requireAll
                    ? `Debes tener todos estos roles: ${rolesArray.join(', ')}`
                    : `Debes tener al menos uno de estos roles: ${rolesArray.join(', ')}`
                  }
                </div>
              </div>
            </div>
          </div>
        );
      }
      return fallback;
    }
  }

  // Si todas las validaciones pasan, mostrar el contenido
  return <>{children}</>;
};

export default RoleGuard;