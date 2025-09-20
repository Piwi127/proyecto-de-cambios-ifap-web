import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles específicos
  if (requiredRole) {
    switch (requiredRole) {
      case 'admin':
        if (!user || !user.is_superuser) {
          return <Navigate to="/aula-virtual/dashboard" replace />;
        }
        break;
      case 'instructor':
        if (!user || (!user.is_instructor && !user.is_superuser)) {
          return <Navigate to="/aula-virtual/dashboard" replace />;
        }
        break;
      case 'student':
        if (!user || (!user.is_student && !user.is_instructor && !user.is_superuser)) {
          return <Navigate to="/aula-virtual/dashboard" replace />;
        }
        break;
      case 'superuser':
        if (!user || !user.is_superuser) {
          return <Navigate to="/aula-virtual/dashboard" replace />;
        }
        break;
      default:
        break;
    }
  }

  return children;
};

export default ProtectedRoute;