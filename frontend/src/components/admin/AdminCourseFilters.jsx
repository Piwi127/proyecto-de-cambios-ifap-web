import React, { useState, useEffect } from 'react';

const AdminCourseFilters = ({
  filters,
  onFiltersChange,
  onReset,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    modality: '',
    status: '',
    instructor: '',
    dateFrom: '',
    dateTo: '',
    studentsMin: '',
    studentsMax: '',
    sortBy: 'title',
    sortOrder: 'asc',
    ...filters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      modality: '',
      status: '',
      instructor: '',
      dateFrom: '',
      dateTo: '',
      studentsMin: '',
      studentsMax: '',
      sortBy: 'title',
      sortOrder: 'asc'
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    const { search, sortBy, sortOrder, ...filterFields } = localFilters;
    return Object.values(filterFields).filter(value =>
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">
              Filtros Avanzados
            </h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showAdvanced ? 'Ocultar' : 'Avanzado'}
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Búsqueda básica */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda
          </label>
          <input
            type="text"
            placeholder="Buscar por título, descripción, instructor..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={localFilters.modality}
              onChange={(e) => handleFilterChange('modality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              <option value="online">En línea</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructor
            </label>
            <input
              type="text"
              placeholder="Nombre del instructor..."
              value={localFilters.instructor}
              onChange={(e) => handleFilterChange('instructor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rango de fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de fechas de creación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Rango de estudiantes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de estudiantes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    min="0"
                    value={localFilters.studentsMin}
                    onChange={(e) => handleFilterChange('studentsMin', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    min="0"
                    value={localFilters.studentsMax}
                    onChange={(e) => handleFilterChange('studentsMax', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="title">Título</option>
                  <option value="instructor_name">Instructor</option>
                  <option value="created_at">Fecha de creación</option>
                  <option value="students_count">Número de estudiantes</option>
                  <option value="lessons_count">Número de lecciones</option>
                  <option value="is_active">Estado</option>
                </select>

                <select
                  value={localFilters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa de filtros activos */}
        {activeFiltersCount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {localFilters.modality && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Modalidad: {localFilters.modality}
                  <button
                    onClick={() => handleFilterChange('modality', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.status && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Estado: {localFilters.status}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {localFilters.instructor && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Instructor: {localFilters.instructor}
                  <button
                    onClick={() => handleFilterChange('instructor', '')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(localFilters.dateFrom || localFilters.dateTo) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Fechas: {localFilters.dateFrom || '...'} - {localFilters.dateTo || '...'}
                  <button
                    onClick={() => {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    }}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(localFilters.studentsMin || localFilters.studentsMax) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Estudiantes: {localFilters.studentsMin || '0'} - {localFilters.studentsMax || '∞'}
                  <button
                    onClick={() => {
                      handleFilterChange('studentsMin', '');
                      handleFilterChange('studentsMax', '');
                    }}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseFilters;