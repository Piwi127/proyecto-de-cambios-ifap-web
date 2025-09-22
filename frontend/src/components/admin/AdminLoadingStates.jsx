import React from 'react';

const AdminLoadingStates = {
  // Skeleton loading for cards
  CardSkeleton: ({ className = '' }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  ),

  // Skeleton loading for table rows
  TableRowSkeleton: ({ columns = 5 }) => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-4"></div>
      </td>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  ),

  // Full page loading spinner
  PageSpinner: ({ message = 'Cargando...', size = 'large' }) => {
    const sizeClasses = {
      small: 'h-8 w-8',
      medium: 'h-16 w-16',
      large: 'h-32 w-32'
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-primary-600 mb-4`}></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    );
  },

  // Inline loading spinner
  InlineSpinner: ({ message = 'Cargando...', size = 'small' }) => {
    const sizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-6 w-6',
      large: 'h-8 w-8'
    };

    return (
      <div className="flex items-center justify-center p-4">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-primary-600 mr-3`}></div>
        <span className="text-gray-600">{message}</span>
      </div>
    );
  },

  // Button loading state
  ButtonSpinner: ({ children, loading, disabled, ...props }) => (
    <button disabled={loading || disabled} {...props}>
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>Procesando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  ),

  // Form field loading skeleton
  FormFieldSkeleton: ({ label = true, multiline = false }) => (
    <div className="animate-pulse">
      {label && <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>}
      <div className={`h-10 bg-gray-200 rounded w-full ${multiline ? 'h-20' : ''}`}></div>
    </div>
  ),

  // Metrics cards loading skeleton
  MetricsSkeleton: ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  ),

  // Chart loading skeleton
  ChartSkeleton: ({ height = 'h-64' }) => (
    <div className={`bg-white rounded-lg p-6 animate-pulse ${height}`}>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="flex items-end justify-between h-full">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="h-3 bg-gray-200 rounded w-8 mb-2"></div>
            <div className={`w-12 bg-gray-200 rounded-t transition-all duration-300`} style={{
              height: `${Math.random() * 60 + 20}%`
            }}></div>
            <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  ),

  // Modal loading overlay
  ModalLoading: ({ message = 'Procesando...' }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="text-gray-700">{message}</span>
      </div>
    </div>
  ),

  // Progress bar loading
  ProgressBar: ({ progress = 0, message = 'Procesando...', className = '' }) => (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  ),

  // Bulk operations loading
  BulkOperationLoading: ({ operation, count, progress = 0 }) => {
    const operationLabels = {
      activate: 'Activando',
      deactivate: 'Desactivando',
      delete: 'Eliminando'
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {operationLabels[operation]} {count} cursos
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor espera mientras se procesa la operación...
            </p>
            <AdminLoadingStates.ProgressBar progress={progress} />
          </div>
        </div>
      </div>
    );
  }
};

export default AdminLoadingStates;