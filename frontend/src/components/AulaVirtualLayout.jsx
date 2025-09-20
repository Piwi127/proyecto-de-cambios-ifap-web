import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserRoleDisplay from './UserRoleDisplay';

const AulaVirtualLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Menú base para todos los usuarios
  const baseMenuItems = [
    {
      name: 'Dashboard',
      path: '/aula-virtual',
      icon: '🏠',
      exact: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Mis Cursos',
      path: '/aula-virtual/cursos',
      icon: '🎓',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Calendario',
      path: '/aula-virtual/calendario',
      icon: '📅',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Biblioteca',
      path: '/aula-virtual/biblioteca',
      icon: '📚',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Quizzes',
      path: '/aula-virtual/quizzes',
      icon: '🧠',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Foro',
      path: '/aula-virtual/foro',
      icon: '💬',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Mensajes',
      path: '/aula-virtual/mensajes',
      icon: '💌',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Notificaciones',
      path: '/aula-virtual/notificaciones',
      icon: '🔔',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Tareas',
      path: '/aula-virtual/tareas',
      icon: '✅',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      path: "/aula-virtual/videoconferencia",
      icon: "🎥",
      name: "Videoconferencia",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      roles: ['student', 'instructor', 'admin']
    },
    {
      path: "/aula-virtual/colaboracion",
      icon: "🤝",
      name: "Colaboración",
      color: "text-green-500",
      bgColor: "bg-green-100",
      roles: ['student', 'instructor', 'admin']
    },
    // Opciones específicas para docentes
    {
      path: "/aula-virtual/dashboard-profesor",
      icon: "📊",
      name: "Dashboard Profesor",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      roles: ['instructor', 'admin']
    },
    {
      path: "/aula-virtual/gestionar-cursos",
      icon: "🎯",
      name: "Gestionar Cursos",
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      roles: ['instructor', 'admin']
    },
    {
      path: "/aula-virtual/calificaciones",
      icon: "📝",
      name: "Calificaciones",
      color: "text-amber-500",
      bgColor: "bg-amber-100",
      roles: ['instructor', 'admin']
    },
    // Opciones específicas para administradores
    {
      path: "/aula-virtual/user-management",
      icon: "👥",
      name: "Gestión de Usuarios",
      color: "text-red-500",
      bgColor: "bg-red-100",
      roles: ['admin']
    },
    {
      path: "/aula-virtual/reportes",
      icon: "📈",
      name: "Reportes",
      color: "text-violet-500",
      bgColor: "bg-violet-100",
      roles: ['admin']
    },
    {
      path: "/aula-virtual/configuracion-sistema",
      icon: "🔧",
      name: "Config. Sistema",
      color: "text-slate-500",
      bgColor: "bg-slate-100",
      roles: ['admin']
    },
    // Opciones comunes al final
    {
      name: 'Perfil',
      path: '/aula-virtual/perfil',
      icon: '👤',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Configuración',
      path: '/aula-virtual/configuracion',
      icon: '⚙️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      roles: ['student', 'instructor', 'admin']
    }
  ];

  // Filtrar menú según el rol del usuario
  const getUserRole = () => {
    if (user?.is_superuser) return 'admin';
    if (user?.is_instructor) return 'instructor';
    if (user?.is_student) return 'student';
    return 'student'; // Por defecto
  };

  const userRole = getUserRole();
  const menuItems = baseMenuItems.filter(item => item.roles.includes(userRole));

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-lg shadow-2xl border-r border-white/20 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:border-r-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo y título */}
          <div className="flex items-center justify-center h-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 shadow-lg">
            <div className="text-center">
              <div className="text-2xl mb-1">🎓</div>
              <h1 className="text-white text-lg font-bold tracking-wide">Aula Virtual</h1>
              <p className="text-primary-100 text-xs">IFAP</p>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 mt-8 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.path, item.exact)
                      ? `${item.bgColor} ${item.color} border-r-4 border-current shadow-md transform scale-105`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200 ${
                    isActive(item.path, item.exact)
                      ? `${item.bgColor} ${item.color}`
                      : 'group-hover:bg-gray-100'
                  }`}>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.path, item.exact) && (
                    <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Información del usuario */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">En línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium group"
            >
              <span className="mr-2 group-hover:animate-bounce">🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <span className="sr-only">Abrir menú</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {menuItems.find(item => isActive(item.path, item.exact))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  Bienvenido de vuelta, {user?.first_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Barra de búsqueda */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              {/* Notificaciones */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  3
                </span>
              </button>

              {/* Mensajes */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <span className="text-xl">💬</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </button>

              {/* Usuario */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name}
                  </div>
                  <UserRoleDisplay className="mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AulaVirtualLayout;