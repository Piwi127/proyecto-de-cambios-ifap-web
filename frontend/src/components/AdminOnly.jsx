import React from 'react';
import RoleGuard from './RoleGuard.jsx';

/**
 * AdminOnly - Wrapper para contenido exclusivo de administradores
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Contenido a mostrar para administradores
 * @param {ReactNode} props.fallback - Contenido a mostrar si no es administrador
 * @param {boolean} props.showError - Si mostrar mensaje de error (default: true)
 */
const AdminOnly = ({ children, fallback = null, showError = true }) => {
  return (
    <RoleGuard
      roles="admin"
      fallback={fallback}
      showError={showError}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * AdminOnly.Inline - Versión inline que muestra el contenido o nada
 */
AdminOnly.Inline = ({ children, fallback = null }) => {
  return (
    <RoleGuard
      roles="admin"
      fallback={fallback}
      showError={false}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * AdminOnly.Button - Botón que solo se muestra para administradores
 */
AdminOnly.Button = ({
  children,
  onClick,
  className = '',
  fallback = null,
  ...props
}) => {
  return (
    <RoleGuard
      roles="admin"
      fallback={fallback}
      showError={false}
    >
      <button
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </button>
    </RoleGuard>
  );
};

/**
 * AdminOnly.Link - Enlace que solo se muestra para administradores
 */
AdminOnly.Link = ({
  children,
  href,
  className = '',
  fallback = null,
  ...props
}) => {
  return (
    <RoleGuard
      roles="admin"
      fallback={fallback}
      showError={false}
    >
      <a
        href={href}
        className={className}
        {...props}
      >
        {children}
      </a>
    </RoleGuard>
  );
};

/**
 * AdminOnly.MenuItem - Item de menú que solo se muestra para administradores
 */
AdminOnly.MenuItem = ({
  children,
  onClick,
  className = '',
  fallback = null,
  ...props
}) => {
  return (
    <RoleGuard
      roles="admin"
      fallback={fallback}
      showError={false}
    >
      <div
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </div>
    </RoleGuard>
  );
};

export default AdminOnly;