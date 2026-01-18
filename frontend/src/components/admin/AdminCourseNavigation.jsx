import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminNotifications } from './AdminNotificationSystem.jsx';

const AdminCourseNavigation = ({
  currentView = 'list',
  onViewChange,
  onCreateCourse,
  onBulkActions,
  selectedCount = 0,
  onStateManagement,
  onTransferCourse,
  onPoliciesManagement,
  onMaintenanceTools,
  className = ''
}) => {
  const { showInfo } = useAdminNotifications();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const navigationItems = [
    {
      id: 'list',
      label: 'Lista de Cursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      description: 'Ver y gestionar todos los cursos'
    },
    {
      id: 'create',
      label: 'Crear Curso',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      description: 'Crear un nuevo curso',
      action: onCreateCourse
    },
    {
      id: 'bulk',
      label: 'Operaciones Masivas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      description: 'Realizar acciones en múltiples cursos',
      action: onBulkActions,
      badge: selectedCount > 0 ? selectedCount : null
    },
    {
      id: 'states',
      label: 'Gestión de Estados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Gestionar estados y transiciones de cursos',
      action: onStateManagement
    },
    {
      id: 'transfer',
      label: 'Transferencia de Cursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: 'Transferir cursos entre instructores',
      action: onTransferCourse
    },
    {
      id: 'policies',
      label: 'Políticas del Sistema',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Configurar políticas y reglas del sistema',
      action: onPoliciesManagement
    },
    {
      id: 'maintenance',
      label: 'Mantenimiento',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Herramientas de mantenimiento y optimización',
      action: onMaintenanceTools
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Ver estadísticas y métricas'
    }
  ];

  const keyboardShortcuts = useMemo(() => ([
    { key: 'Ctrl + N', action: 'Crear nuevo curso', handler: onCreateCourse },
    { key: 'Ctrl + B', action: 'Operaciones masivas', handler: onBulkActions },
    { key: 'Ctrl + S', action: 'Gestión de estados', handler: onStateManagement },
    { key: 'Ctrl + T', action: 'Transferencia de cursos', handler: onTransferCourse },
    { key: 'Ctrl + P', action: 'Políticas del sistema', handler: onPoliciesManagement },
    { key: 'Ctrl + M', action: 'Herramientas de mantenimiento', handler: onMaintenanceTools },
    { key: 'Ctrl + F', action: 'Buscar cursos' },
    { key: 'Esc', action: 'Cerrar modal actual' },
    { key: 'F1', action: 'Mostrar ayuda' }
  ]), [onBulkActions, onCreateCourse, onMaintenanceTools, onPoliciesManagement, onStateManagement, onTransferCourse]);

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else if (item.id !== currentView) {
      onViewChange && onViewChange(item.id);
    }
  };

  const handleKeyboardShortcut = useCallback((e, shortcut) => {
    if (shortcut.handler) {
      e.preventDefault();
      shortcut.handler();
      showInfo(`Acceso rápido: ${shortcut.action}`);
    }
  }, [showInfo]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            handleKeyboardShortcut(e, keyboardShortcuts[0]);
            break;
          case 'b':
            handleKeyboardShortcut(e, keyboardShortcuts[1]);
            break;
          case 's':
            handleKeyboardShortcut(e, keyboardShortcuts[2]);
            break;
          case 't':
            handleKeyboardShortcut(e, keyboardShortcuts[3]);
            break;
          case 'p':
            handleKeyboardShortcut(e, keyboardShortcuts[4]);
            break;
          case 'm':
            handleKeyboardShortcut(e, keyboardShortcuts[5]);
            break;
          case 'f':
            handleKeyboardShortcut(e, keyboardShortcuts[6]);
            break;
        }
      }

      if (e.key === 'Escape') {
        handleKeyboardShortcut(e, keyboardShortcuts[7]);
      }

      if (e.key === 'F1') {
        handleKeyboardShortcut(e, keyboardShortcuts[8]);
        setShowShortcuts(!showShortcuts);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyboardShortcut, keyboardShortcuts, showShortcuts]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Navigation Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Navegación</h3>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            title="Mostrar atajos de teclado (F1)"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            F1
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 p-2 rounded-lg ${
              currentView === item.id ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
              {item.icon}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  currentView === item.id ? 'text-primary-700' : 'text-gray-900'
                }`}>
                  {item.label}
                </p>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                currentView === item.id ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-primary-600">8</div>
            <div className="text-xs text-gray-500">Funcionalidades disponibles</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{selectedCount}</div>
            <div className="text-xs text-gray-500">Cursos seleccionados</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Funcionalidades avanzadas: Estados, Transferencias, Políticas, Mantenimiento
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Atajos de Teclado</h4>
            <div className="space-y-2">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{shortcut.action}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseNavigation;
