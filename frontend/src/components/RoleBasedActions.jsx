import React from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

const RoleBasedActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = userService.getUserRole(user);

  const handleAction = (path) => {
    navigate(path);
  };

  const renderAdminActions = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">⚙️</span>
          Acciones de Administrador
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('/aula-virtual/user-management')}
          className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
        >
          <div className="p-2 bg-blue-500 text-white rounded-lg mr-3 group-hover:bg-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Gestionar Usuarios</p>
            <p className="text-sm text-gray-600">Administrar roles y permisos</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/reportes')}
          className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
        >
          <div className="p-2 bg-green-500 text-white rounded-lg mr-3 group-hover:bg-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Ver Reportes</p>
            <p className="text-sm text-gray-600">Estadísticas del sistema</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/configuracion-sistema')}
          className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
        >
          <div className="p-2 bg-purple-500 text-white rounded-lg mr-3 group-hover:bg-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Configuración</p>
            <p className="text-sm text-gray-600">Ajustes del sistema</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/gestionar-cursos')}
          className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
        >
          <div className="p-2 bg-orange-500 text-white rounded-lg mr-3 group-hover:bg-orange-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Gestionar Cursos</p>
            <p className="text-sm text-gray-600">Administrar todos los cursos</p>
          </div>
        </button>
      </div>
    </Card>
  );

  const renderInstructorActions = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">👨‍🏫</span>
          Acciones de Docente
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('/aula-virtual/gestionar-cursos')}
          className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
        >
          <div className="p-2 bg-blue-500 text-white rounded-lg mr-3 group-hover:bg-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Mis Cursos</p>
            <p className="text-sm text-gray-600">Gestionar mis cursos</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/calificaciones')}
          className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
        >
          <div className="p-2 bg-green-500 text-white rounded-lg mr-3 group-hover:bg-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Calificaciones</p>
            <p className="text-sm text-gray-600">Evaluar estudiantes</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/dashboard-profesor')}
          className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
        >
          <div className="p-2 bg-purple-500 text-white rounded-lg mr-3 group-hover:bg-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Panel Docente</p>
            <p className="text-sm text-gray-600">Vista especializada</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/crear-curso')}
          className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
        >
          <div className="p-2 bg-orange-500 text-white rounded-lg mr-3 group-hover:bg-orange-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Crear Curso</p>
            <p className="text-sm text-gray-600">Nuevo curso</p>
          </div>
        </button>
      </div>
    </Card>
  );

  const renderStudentActions = () => (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">🎓</span>
          Acciones Rápidas
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('/aula-virtual/mis-cursos')}
          className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
        >
          <div className="p-2 bg-blue-500 text-white rounded-lg mr-3 group-hover:bg-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Mis Cursos</p>
            <p className="text-sm text-gray-600">Ver cursos inscritos</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/biblioteca')}
          className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
        >
          <div className="p-2 bg-green-500 text-white rounded-lg mr-3 group-hover:bg-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Biblioteca</p>
            <p className="text-sm text-gray-600">Recursos de estudio</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/calendario')}
          className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
        >
          <div className="p-2 bg-purple-500 text-white rounded-lg mr-3 group-hover:bg-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Calendario</p>
            <p className="text-sm text-gray-600">Fechas importantes</p>
          </div>
        </button>

        <button
          onClick={() => handleAction('/aula-virtual/perfil')}
          className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
        >
          <div className="p-2 bg-orange-500 text-white rounded-lg mr-3 group-hover:bg-orange-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Mi Perfil</p>
            <p className="text-sm text-gray-600">Configurar cuenta</p>
          </div>
        </button>
      </div>
    </Card>
  );

  switch (role) {
    case 'admin':
      return renderAdminActions();
    case 'instructor':
      return renderInstructorActions();
    case 'student':
      return renderStudentActions();
    default:
      return null;
  }
};

export default RoleBasedActions;