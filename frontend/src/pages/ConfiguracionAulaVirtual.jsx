import React, { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

const ConfiguracionAulaVirtual = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [_activeTab, _setActiveTab] = useState('perfil');

  // Debug information
  console.log('ConfiguracionAulaVirtual Debug:', {
    user,
    loading,
    isAuthenticated,
    userKeys: user ? Object.keys(user) : null
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Configuración del Sistema</h1>
        <p className="text-primary-100 text-lg">
          Configuración y personalización del aula virtual
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Configuración en Desarrollo
          </h3>
          <p className="text-gray-500 mb-4">
            Esta sección está siendo desarrollada. Pronto tendrás acceso a configuraciones avanzadas del sistema.
          </p>

          {/* Debug Information */}
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <h4 className="font-semibold mb-2">Información de Debug:</h4>
            <p><strong>Usuario autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
            <p><strong>Usuario:</strong> {user ? `${user.first_name} ${user.last_name} (${user.username})` : 'No disponible'}</p>
            <p><strong>Rol:</strong> {user?.is_superuser ? 'Administrador' : user?.is_instructor ? 'Instructor' : 'Estudiante'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfiguracionAulaVirtual;