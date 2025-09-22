import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { courseService } from '../services/courseService.js';
import AdminOnly from '../components/AdminOnly.jsx';
import RoleGuard from '../components/RoleGuard.jsx';
import CourseAdminCard from '../components/admin/CourseAdminCard.jsx';
import AdminBulkOperations from '../components/admin/AdminBulkOperations.jsx';
import CourseTransferModal from '../components/admin/CourseTransferModal.jsx';
import AdminMetrics from '../components/admin/AdminMetrics.jsx';
import AdminCourseFilters from '../components/admin/AdminCourseFilters.jsx';
import AdminCourseTable from '../components/admin/AdminCourseTable.jsx';
import AdminPagination from '../components/admin/AdminPagination.jsx';
import AdminFloatingActions from '../components/admin/AdminFloatingActions.jsx';
import AdminCourseDetailModal from '../components/admin/AdminCourseDetailModal.jsx';
import AdminInteractiveCharts from '../components/admin/AdminInteractiveCharts.jsx';
import AdminLoadingStates from '../components/admin/AdminLoadingStates.jsx';
import AdminConfirmationModal from '../components/admin/AdminConfirmationModal.jsx';
import AdminCourseCreate from '../components/admin/AdminCourseCreate.jsx';
import AdminCourseEdit from '../components/admin/AdminCourseEdit.jsx';
import AdminCourseDuplicate from '../components/admin/AdminCourseDuplicate.jsx';
import AdminCourseNavigation from '../components/admin/AdminCourseNavigation.jsx';
import AdminCourseStateManager from '../components/admin/AdminCourseStateManager.jsx';
import AdminCourseTransfer from '../components/admin/AdminCourseTransfer.jsx';
import AdminCoursePolicies from '../components/admin/AdminCoursePolicies.jsx';
import AdminCourseMaintenance from '../components/admin/AdminCourseMaintenance.jsx';
import { AdminNotificationProvider, useAdminNotifications } from '../components/admin/AdminNotificationSystem.jsx';

// Internal component that uses notifications
const GestionCursosAdminContent = () => {
  const { isAdmin, canManageCourses } = useAuth();
  const { showSuccess, showError, showWarning, showConfirm, showBulkOperation } = useAdminNotifications();
  const [courses, setCourses] = useState([]);
  const [inactiveCourses, setInactiveCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCourse, setTransferCourse] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [instructorStats, setInstructorStats] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);
  const [selectedCourseForDuplicate, setSelectedCourseForDuplicate] = useState(null);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [showStateManager, setShowStateManager] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedCourseForState, setSelectedCourseForState] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all courses and inactive courses
      const [allCoursesData, inactiveCoursesData, metricsData, statsData] = await Promise.all([
        courseService.getAllCoursesAdmin(),
        courseService.getInactiveCoursesAdmin(),
        courseService.getAdminMetrics(),
        courseService.getInstructorStats()
      ]);

      setCourses(allCoursesData);
      setInactiveCourses(inactiveCoursesData);
      setMetrics(metricsData);
      setInstructorStats(statsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message);
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAction = async (action, courseId, reason = '') => {
    const course = courses.find(c => c.id === courseId) || inactiveCourses.find(c => c.id === courseId);

    // Configurar modal de confirmación para operaciones destructivas
    if (action === 'delete' || action === 'deactivate') {
      const isDelete = action === 'delete';
      setConfirmationConfig({
        title: isDelete ? 'Eliminar Curso' : 'Desactivar Curso',
        message: isDelete
          ? `¿Estás seguro de que deseas eliminar permanentemente el curso "${course?.title}"? Esta acción no se puede deshacer.`
          : `¿Estás seguro de que deseas desactivar el curso "${course?.title}"? Los estudiantes inscritos perderán acceso al curso.`,
        confirmText: isDelete ? 'Eliminar Permanentemente' : 'Desactivar Curso',
        cancelText: 'Cancelar',
        type: isDelete ? 'danger' : 'warning',
        showReasonField: true,
        reasonLabel: isDelete ? 'Razón de eliminación' : 'Razón de desactivación',
        reasonPlaceholder: isDelete
          ? 'Explica por qué se elimina este curso...'
          : 'Explica por qué se desactiva este curso...',
        affectedItems: course ? [course] : []
      });
      setShowConfirmationModal(true);
      return;
    }

    try {
      let result;
      switch (action) {
        case 'activate':
          result = await courseService.activateCourse(courseId, reason);
          break;
        case 'deactivate':
          result = await courseService.deactivateCourse(courseId, reason);
          break;
        case 'delete':
          result = await courseService.deleteCourseAdmin(courseId, reason);
          break;
        default:
          throw new Error('Acción no válida');
      }

      // Reload data after successful operation
      await loadData();

      // Show success notification
      showSuccess(result.message || 'Operación completada exitosamente');
    } catch (err) {
      const errorMessage = courseService.handleAdminError(err, action);
      showError('Error: ' + errorMessage);
      console.error('Error performing course action:', err);
    }
  };

  const handleConfirmedAction = async (reason) => {
    const { action, courseId } = confirmationConfig;
    setShowConfirmationModal(false);

    try {
      let result;
      switch (action) {
        case 'activate':
          result = await courseService.activateCourse(courseId, reason);
          break;
        case 'deactivate':
          result = await courseService.deactivateCourse(courseId, reason);
          break;
        case 'delete':
          result = await courseService.deleteCourseAdmin(courseId, reason);
          break;
        default:
          throw new Error('Acción no válida');
      }

      // Reload data after successful operation
      await loadData();

      // Show success notification
      showSuccess(result.message || 'Operación completada exitosamente');
    } catch (err) {
      const errorMessage = courseService.handleAdminError(err, action);
      showError('Error: ' + errorMessage);
      console.error('Error performing course action:', err);
    }
  };

  const handleTransferCourse = (course) => {
    setTransferCourse(course);
    setShowTransferModal(true);
  };

  const handleViewCourseDetail = (course) => {
    setSelectedCourseForDetail(course);
    setShowDetailModal(true);
  };

  const handleRefresh = async () => {
    await loadData();
    showSuccess('Datos actualizados correctamente');
  };

  const handleExport = () => {
    showSuccess('Exportando datos...');
    // Implement export functionality
  };

  const handleImport = () => {
    showSuccess('Importando datos...');
    // Implement import functionality
  };

  const handleCreateCourse = () => {
    setShowCreateModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourseForEdit(course);
    setShowEditModal(true);
  };

  const handleDuplicateCourse = (course) => {
    setSelectedCourseForDuplicate(course);
    setShowDuplicateModal(true);
  };

  const handleCreateSuccess = (newCourse) => {
    showSuccess(`Curso "${newCourse.title}" creado exitosamente`);
    loadData();
    setShowCreateModal(false);
  };

  const handleEditSuccess = (updatedCourse) => {
    showSuccess(`Curso "${updatedCourse.title}" actualizado exitosamente`);
    loadData();
    setShowEditModal(false);
    setSelectedCourseForEdit(null);
  };

  const handleDuplicateSuccess = (duplicatedCourse) => {
    showSuccess(`Curso "${duplicatedCourse.title}" duplicado exitosamente`);
    loadData();
    setShowDuplicateModal(false);
    setSelectedCourseForDuplicate(null);
  };

  const handleStateManagement = (course) => {
    setSelectedCourseForState(course);
    setShowStateManager(true);
  };

  const handlePoliciesManagement = () => {
    setShowPoliciesModal(true);
  };

  const handleMaintenanceTools = () => {
    setShowMaintenanceModal(true);
  };

  const handleStateChange = (newState, reason) => {
    showSuccess(`Estado del curso actualizado a: ${newState}`);
    loadData();
    setShowStateManager(false);
    setSelectedCourseForState(null);
  };

  const handleTransferSuccess = (result) => {
    showSuccess(result.message);
    loadData();
    setShowTransferModal(false);
    setSelectedCourseForTransfer(null);
  };

  const handlePoliciesSave = (policies) => {
    showSuccess('Políticas del sistema actualizadas exitosamente');
    setShowPoliciesModal(false);
  };

  const handleMaintenanceComplete = (type, result) => {
    showSuccess(result.message);
    if (type === 'cleanup' || type === 'optimization') {
      loadData();
    }
  };

  const handleBulkActions = () => {
    setShowBulkOperations(true);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    showInfo(`Vista cambiada a: ${mode === 'cards' ? 'Tarjetas' : 'Tabla'}`);
  };

  const handleFiltersChange = (newFilters) => {
    // Apply filters to data
    console.log('Filters changed:', newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFiltersReset = () => {
    setCurrentPage(1);
    showInfo('Filtros restablecidos');
  };

  const handleBulkOperation = async (operation, reason = '', advancedOptions = {}) => {
    if (selectedCourses.length === 0) {
      showWarning('Selecciona al menos un curso para realizar la operación');
      return;
    }

    try {
      let result;
      switch (operation) {
        case 'activate':
          result = await courseService.bulkActivateCourses(selectedCourses, reason);
          break;
        case 'deactivate':
          result = await courseService.bulkDeactivateCourses(selectedCourses, reason);
          break;
        case 'delete':
          result = await courseService.bulkDeleteCourses(selectedCourses, reason);
          break;
        case 'duplicate':
          result = await courseService.bulkDuplicateCourses(selectedCourses, reason);
          break;
        case 'transfer':
          // For transfer operations, we need instructor ID from advanced options
          if (!advancedOptions.newInstructorId) {
            showError('Debes seleccionar un instructor para la transferencia');
            return;
          }
          result = await courseService.bulkTransferCourses(selectedCourses, advancedOptions.newInstructorId, reason);
          break;
        case 'update_category':
          if (!advancedOptions.newCategory) {
            showError('Debes seleccionar una categoría');
            return;
          }
          result = await courseService.bulkUpdateCategory(selectedCourses, advancedOptions.newCategory, reason);
          break;
        case 'update_level':
          if (!advancedOptions.newLevel) {
            showError('Debes seleccionar un nivel');
            return;
          }
          result = await courseService.bulkUpdateLevel(selectedCourses, advancedOptions.newLevel, reason);
          break;
        case 'update_modality':
          if (!advancedOptions.newModality) {
            showError('Debes seleccionar una modalidad');
            return;
          }
          result = await courseService.bulkUpdateModality(selectedCourses, advancedOptions.newModality, reason);
          break;
        case 'set_price':
          if (advancedOptions.newPrice === undefined || advancedOptions.newPrice === null) {
            showError('Debes especificar un precio');
            return;
          }
          result = await courseService.bulkSetPrice(selectedCourses, advancedOptions.newPrice, reason);
          break;
        case 'set_capacity':
          if (advancedOptions.newCapacity === undefined || advancedOptions.newCapacity === null) {
            showError('Debes especificar una capacidad');
            return;
          }
          result = await courseService.bulkSetCapacity(selectedCourses, advancedOptions.newCapacity, reason);
          break;
        default:
          throw new Error('Operación no válida');
      }

      // Clear selection and reload data
      setSelectedCourses([]);
      await loadData();

      // Show success notification
      showSuccess(result.message || 'Operación masiva completada exitosamente');
    } catch (err) {
      const errorMessage = courseService.handleAdminError(err, operation);
      showError('Error en operación masiva: ' + errorMessage);
      console.error('Error performing bulk operation:', err);
    }
  };

  const filteredCourses = (activeTab === 'all' ? courses : inactiveCourses).filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCourses = activeTab === 'all' ? courses : inactiveCourses;

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos de administrador para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Cursos Administrativos
        </h1>
        <p className="text-gray-600">
          Administra todos los cursos de la plataforma
        </p>
      </div>

      {/* Navigation Panel */}
      <div className="mb-8">
        <AdminCourseNavigation
          currentView="list"
          onCreateCourse={handleCreateCourse}
          onBulkActions={handleBulkActions}
          selectedCount={selectedCourses.length}
          onStateManagement={handleStateManagement}
          onTransferCourse={handleTransferCourse}
          onPoliciesManagement={handlePoliciesManagement}
          onMaintenanceTools={handleMaintenanceTools}
          className="max-w-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar datos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Admin Metrics with Interactive Charts */}
      {metrics && (
        <div className="mb-8">
          <AdminCourseMetrics
            metrics={metrics}
            instructorStats={instructorStats}
            realTime={true}
            refreshInterval={30000}
            className="mb-6"
          />

          {/* Interactive Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminInteractiveCharts
              title="Tendencias de Cursos"
              type="line"
              data={{
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Cursos Activos',
                    data: [65, 78, 90, 81, 95, 102],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                  },
                  {
                    label: 'Nuevos Estudiantes',
                    data: [45, 52, 58, 65, 72, 78],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                  }
                ]
              }}
            />

            <AdminInteractiveCharts
              title="Distribución por Modalidad"
              type="pie"
              data={{
                labels: ['En línea', 'Presencial', 'Híbrido'],
                datasets: [{
                  label: 'Modalidades',
                  data: [
                    metrics.courses_by_modality?.online || 0,
                    metrics.courses_by_modality?.presencial || 0,
                    metrics.courses_by_modality?.hibrido || 0
                  ],
                  borderColor: ['#3B82F6', '#10B981', '#F59E0B'],
                  backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)']
                }]
              }}
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <AdminCourseFilters
        filters={{
          search: searchTerm,
          status: activeTab === 'inactive' ? 'inactive' : 'active'
        }}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
        className="mb-6"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-primary-600">{courses.length}</div>
          <div className="text-sm text-gray-500">Cursos Totales</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {courses.filter(c => c.is_active).length}
          </div>
          <div className="text-sm text-gray-500">Cursos Activos</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {courses.filter(c => !c.is_active).length}
          </div>
          <div className="text-sm text-gray-500">Cursos Inactivos</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{selectedCourses.length}</div>
          <div className="text-sm text-gray-500">Seleccionados</div>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedCourses.length} curso(s) seleccionado(s)
              </span>
              <button
                onClick={() => setShowBulkOperations(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Operaciones Masivas
              </button>
            </div>
            <button
              onClick={() => setSelectedCourses([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Deseleccionar todo
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            {viewMode === 'cards' ? 'Vista de Tarjetas' : 'Vista de Tabla'}
          </h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {filteredCourses.length} de {courses.length + inactiveCourses.length} cursos
        </div>
      </div>

      {/* Courses Content */}
      {loading ? (
        <div className="space-y-6">
          <AdminLoadingStates.MetricsSkeleton count={4} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <AdminLoadingStates.CardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseAdminCard
                  key={course.id}
                  course={course}
                  isSelected={selectedCourses.includes(course.id)}
                  onSelect={(courseId) => {
                    setSelectedCourses(prev =>
                      prev.includes(courseId)
                        ? prev.filter(id => id !== courseId)
                        : [...prev, courseId]
                    );
                  }}
                  onActivate={(courseId) => handleCourseAction('activate', courseId)}
                  onDeactivate={(courseId) => handleCourseAction('deactivate', courseId)}
                  onDelete={(courseId) => handleCourseAction('delete', courseId)}
                  onTransfer={handleTransferCourse}
                  onEdit={handleEditCourse}
                  onDuplicate={handleDuplicateCourse}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <AdminCourseTable
                courses={filteredCourses}
                selectedCourses={selectedCourses}
                onSelect={(courseId) => {
                  setSelectedCourses(prev =>
                    prev.includes(courseId)
                      ? prev.filter(id => id !== courseId)
                      : [...prev, courseId]
                  );
                }}
                onSelectAll={(selected) => {
                  setSelectedCourses(
                    selected
                      ? filteredCourses.map(c => c.id)
                      : []
                  );
                }}
                onActivate={(courseId) => handleCourseAction('activate', courseId)}
                onDeactivate={(courseId) => handleCourseAction('deactivate', courseId)}
                onDelete={(courseId) => handleCourseAction('delete', courseId)}
                onTransfer={handleTransferCourse}
                onViewDetails={handleViewCourseDetail}
                onEdit={handleEditCourse}
                onDuplicate={handleDuplicateCourse}
                loading={loading}
              />

              {/* Pagination */}
              {filteredCourses.length > 0 && (
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron cursos' : 'No hay cursos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda.'
              : activeTab === 'all'
                ? 'No hay cursos activos en el sistema.'
                : 'No hay cursos inactivos.'
            }
          </p>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkOperations && (
        <AdminBulkOperations
          selectedCourses={selectedCourses}
          currentCourses={currentCourses}
          onClose={() => setShowBulkOperations(false)}
          onOperation={handleBulkOperation}
        />
      )}

      {/* Course Transfer Modal */}
      {showTransferModal && transferCourse && (
        <CourseTransferModal
          course={transferCourse}
          onClose={() => {
            setShowTransferModal(false);
            setTransferCourse(null);
          }}
          onSuccess={loadData}
        />
      )}

      {/* Course Detail Modal */}
      {showDetailModal && selectedCourseForDetail && (
        <AdminCourseDetailModal
          course={selectedCourseForDetail}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCourseForDetail(null);
          }}
          onUpdate={(course) => {
            showSuccess('Curso actualizado correctamente');
            loadData();
          }}
        />
      )}

      {/* Floating Action Buttons */}
      <AdminFloatingActions
        onRefresh={handleRefresh}
        onExport={handleExport}
        onImport={handleImport}
        onCreateCourse={handleCreateCourse}
        onBulkActions={handleBulkActions}
        onViewModeChange={handleViewModeChange}
        currentViewMode={viewMode}
        selectedCount={selectedCourses.length}
      />

      {/* Create Course Modal */}
      <AdminCourseCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Course Modal */}
      {showEditModal && selectedCourseForEdit && (
        <AdminCourseEdit
          course={selectedCourseForEdit}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourseForEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Duplicate Course Modal */}
      {showDuplicateModal && selectedCourseForDuplicate && (
        <AdminCourseDuplicate
          course={selectedCourseForDuplicate}
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false);
            setSelectedCourseForDuplicate(null);
          }}
          onSuccess={handleDuplicateSuccess}
        />
      )}

      {/* Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmedAction}
        {...confirmationConfig}
      />

      {/* State Manager Modal */}
      {showStateManager && selectedCourseForState && (
        <AdminCourseStateManager
          course={selectedCourseForState}
          isOpen={showStateManager}
          onClose={() => {
            setShowStateManager(false);
            setSelectedCourseForState(null);
          }}
          onStateChange={handleStateChange}
          onSuccess={(result) => {
            showSuccess(result.message);
            loadData();
          }}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedCourseForTransfer && (
        <AdminCourseTransfer
          course={selectedCourseForTransfer}
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedCourseForTransfer(null);
          }}
          onTransfer={handleTransferCourse}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* Policies Modal */}
      {showPoliciesModal && (
        <AdminCoursePolicies
          isOpen={showPoliciesModal}
          onClose={() => setShowPoliciesModal(false)}
          onSave={handlePoliciesSave}
          onSuccess={(result) => {
            showSuccess(result.message);
          }}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <AdminCourseMaintenance
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          onMaintenanceComplete={handleMaintenanceComplete}
          onSuccess={(result) => {
            showSuccess(result.message);
          }}
        />
      )}
    </div>
  );
};

// Main component wrapped with notification provider
const GestionCursosAdmin = () => {
  return (
    <AdminNotificationProvider>
      <GestionCursosAdminContent />
    </AdminNotificationProvider>
  );
};

export default GestionCursosAdmin;