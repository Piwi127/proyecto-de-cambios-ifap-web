import React, { useState } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminFloatingActions = ({
  onRefresh,
  onExport,
  onImport,
  onCreateCourse,
  onBulkActions,
  onViewModeChange,
  currentViewMode,
  selectedCount = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const mainActions = [
    {
      id: 'refresh',
      label: 'Actualizar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: onRefresh,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'viewMode',
      label: currentViewMode === 'table' ? 'Vista de Tarjetas' : 'Vista de Tabla',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      onClick: () => onViewModeChange(currentViewMode === 'table' ? 'cards' : 'table'),
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const secondaryActions = [
    {
      id: 'create',
      label: 'Crear Curso',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: onCreateCourse,
      color: 'bg-green-600 hover:bg-green-700',
      permission: 'create_courses'
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => setShowExportModal(true),
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      id: 'import',
      label: 'Importar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      onClick: () => setShowImportModal(true),
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      id: 'bulk',
      label: `Operaciones Masivas ${selectedCount > 0 ? `(${selectedCount})` : ''}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      onClick: onBulkActions,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: selectedCount === 0
    }
  ];

  // Export Modal Component
  const ExportModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Datos</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de exportación
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incluir campos
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm">Información básica del curso</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm">Estadísticas de estudiantes</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm">Información del instructor</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm">Historial de cambios</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onExport && onExport();
                setShowExportModal(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Import Modal Component
  const ImportModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Datos</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo a importar
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de importación
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option value="create">Crear nuevos cursos</option>
                <option value="update">Actualizar cursos existentes</option>
                <option value="upsert">Crear o actualizar</option>
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Importante</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Asegúrate de que el archivo tenga el formato correcto. Se realizará una validación antes de la importación.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onImport && onImport();
                setShowImportModal(false);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        {/* Secondary actions (shown when expanded) */}
        {isExpanded && (
          <div className="flex flex-col space-y-3 mb-4">
            {secondaryActions.map((action) => (
              <PermissionCheck key={action.id} permission={action.permission}>
                <button
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transform transition-all duration-200 hover:scale-110 ${
                    action.color
                  } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={action.label}
                >
                  {action.icon}
                  <span className="absolute right-14 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {action.label}
                  </span>
                </button>
              </PermissionCheck>
            ))}
          </div>
        )}

        {/* Main action button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg transform transition-all duration-200 hover:scale-110"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>

          {/* Selection count badge */}
          {selectedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {selectedCount > 99 ? '99+' : selectedCount}
            </span>
          )}
        </button>

        {/* Quick actions (always visible) */}
        <div className="flex flex-col space-y-3 mt-4">
          {mainActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transform transition-all duration-200 hover:scale-110 ${action.color}`}
              title={action.label}
            >
              {action.icon}
              <span className="absolute right-12 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showExportModal && <ExportModal />}
      {showImportModal && <ImportModal />}
    </>
  );
};

export default AdminFloatingActions;