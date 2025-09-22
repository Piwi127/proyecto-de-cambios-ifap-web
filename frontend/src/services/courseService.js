import { api, handleApiError } from './api.js';

export const courseService = {
  // Get all courses
  async getAllCourses(params = {}) {
    try {
      const response = await api.get('/courses/', { params });
      // Handle paginated response - extract results array
      if (response.data && response.data.results) {
        return response.data.results;
      }
      // If not paginated, return data directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new course (instructor only)
  async createCourse(courseData) {
    try {
      const response = await api.post('/courses/', courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update course (instructor only)
  async updateCourse(courseId, courseData) {
    try {
      const response = await api.patch(`/courses/${courseId}/`, courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete course (instructor only)
  async deleteCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Enroll in course
  async enrollInCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Unenroll from course
  async unenrollFromCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/unenroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's enrolled courses
  async getMyCourses() {
    try {
      const response = await api.get('/courses/my_courses/');
      // Handle paginated response - extract results array
      if (response.data && response.data.results) {
        return response.data.results;
      }
      // If not paginated, return data directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get courses taught by instructor
  async getTaughtCourses() {
    try {
      const response = await api.get('/courses/taught_courses/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search courses
  async searchCourses(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/courses/', { params });
      // Handle paginated response - extract results array
      if (response.data && response.data.results) {
        return response.data.results;
      }
      // If not paginated, return data directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course metrics (instructor only)
  async getCourseMetrics(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/metrics/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== ADMINISTRATIVE METHODS ==========

  // Get all courses (admin only)
  async getAllCoursesAdmin(params = {}) {
    try {
      const response = await api.get('/courses/admin/all/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get inactive courses (admin only)
  async getInactiveCoursesAdmin(params = {}) {
    try {
      const response = await api.get('/courses/admin/inactive/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get admin metrics (admin only)
  async getAdminMetrics() {
    try {
      const response = await api.get('/courses/admin/metrics/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get instructor statistics (admin only)
  async getInstructorStats() {
    try {
      const response = await api.get('/courses/admin/instructor-stats/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Activate course (admin only)
  async activateCourse(courseId, reason = '') {
    try {
      const response = await api.post(`/courses/${courseId}/activate/`, { reason });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Deactivate course (admin only)
  async deactivateCourse(courseId, reason = '') {
    try {
      const response = await api.post(`/courses/${courseId}/deactivate/`, { reason });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Transfer course to another instructor (admin only)
  async transferCourse(courseId, newInstructorId, reason = '') {
    try {
      const response = await api.put(`/courses/${courseId}/transfer/`, {
        new_instructor_id: newInstructorId,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete course (admin only)
  async deleteCourseAdmin(courseId, reason = '') {
    try {
      const response = await api.delete(`/courses/${courseId}/admin_delete/`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk activate courses (admin only)
  async bulkActivateCourses(courseIds, reason = '') {
    try {
      const response = await api.post('/courses/bulk-activate/', {
        course_ids: courseIds,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk deactivate courses (admin only)
  async bulkDeactivateCourses(courseIds, reason = '') {
    try {
      const response = await api.post('/courses/bulk-deactivate/', {
        course_ids: courseIds,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk delete courses (admin only)
  async bulkDeleteCourses(courseIds, reason = '') {
    try {
      const response = await api.post('/courses/bulk-delete/', {
        course_ids: courseIds,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk duplicate courses (admin only)
  async bulkDuplicateCourses(courseIds, reason = '') {
    try {
      const response = await api.post('/courses/bulk-duplicate/', {
        course_ids: courseIds,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk transfer courses to another instructor (admin only)
  async bulkTransferCourses(courseIds, newInstructorId, reason = '') {
    try {
      const response = await api.post('/courses/bulk-transfer/', {
        course_ids: courseIds,
        new_instructor_id: newInstructorId,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk update course category (admin only)
  async bulkUpdateCategory(courseIds, newCategory, reason = '') {
    try {
      const response = await api.post('/courses/bulk-update-category/', {
        course_ids: courseIds,
        new_category: newCategory,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk update course level (admin only)
  async bulkUpdateLevel(courseIds, newLevel, reason = '') {
    try {
      const response = await api.post('/courses/bulk-update-level/', {
        course_ids: courseIds,
        new_level: newLevel,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk update course modality (admin only)
  async bulkUpdateModality(courseIds, newModality, reason = '') {
    try {
      const response = await api.post('/courses/bulk-update-modality/', {
        course_ids: courseIds,
        new_modality: newModality,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk set course price (admin only)
  async bulkSetPrice(courseIds, newPrice, reason = '') {
    try {
      const response = await api.post('/courses/bulk-set-price/', {
        course_ids: courseIds,
        new_price: newPrice,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk set course capacity (admin only)
  async bulkSetCapacity(courseIds, newCapacity, reason = '') {
    try {
      const response = await api.post('/courses/bulk-set-capacity/', {
        course_ids: courseIds,
        new_capacity: newCapacity,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== COURSE STATE MANAGEMENT ==========

  // Get course state configuration
  async getCourseStateConfig() {
    try {
      const response = await api.get('/courses/admin/state-config/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change course state (admin only)
  async changeCourseState(courseId, newState, reason = '') {
    try {
      const response = await api.post(`/courses/${courseId}/change-state/`, {
        new_state: newState,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk change course states (admin only)
  async bulkChangeCourseState(courseIds, newState, reason = '') {
    try {
      const response = await api.post('/courses/bulk-change-state/', {
        course_ids: courseIds,
        new_state: newState,
        reason
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course state history (admin only)
  async getCourseStateHistory(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/state-history/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get available state transitions for a course (admin only)
  async getAvailableStateTransitions(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/available-transitions/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Execute auto state transition (admin only)
  async executeAutoStateTransition(courseId, ruleId) {
    try {
      const response = await api.post(`/courses/${courseId}/auto-transition/`, {
        rule_id: ruleId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get state transition policies (admin only)
  async getStateTransitionPolicies() {
    try {
      const response = await api.get('/courses/admin/state-policies/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update state transition policies (admin only)
  async updateStateTransitionPolicies(policies) {
    try {
      const response = await api.put('/courses/admin/state-policies/', policies);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== COURSE TRANSFER MANAGEMENT ==========

  // Get available instructors for transfer (admin only)
  async getAvailableInstructors(filters = {}) {
    try {
      const response = await api.get('/courses/admin/available-instructors/', { params: filters });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get instructor workload and availability (admin only)
  async getInstructorWorkload(instructorId) {
    try {
      const response = await api.get(`/courses/admin/instructor-workload/${instructorId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course transfer history (admin only)
  async getCourseTransferHistory(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/transfer-history/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all transfer history (admin only)
  async getAllTransferHistory(params = {}) {
    try {
      const response = await api.get('/courses/admin/transfer-history/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Validate course transfer (admin only)
  async validateCourseTransfer(courseId, newInstructorId) {
    try {
      const response = await api.post('/courses/admin/validate-transfer/', {
        course_id: courseId,
        new_instructor_id: newInstructorId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get transfer statistics (admin only)
  async getTransferStatistics() {
    try {
      const response = await api.get('/courses/admin/transfer-statistics/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== SYSTEM POLICIES MANAGEMENT ==========

  // Get system policies (admin only)
  async getSystemPolicies() {
    try {
      const response = await api.get('/courses/admin/system-policies/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update system policies (admin only)
  async updateSystemPolicies(policies) {
    try {
      const response = await api.put('/courses/admin/system-policies/', policies);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get policy categories (admin only)
  async getPolicyCategories() {
    try {
      const response = await api.get('/courses/admin/policy-categories/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Validate system policies (admin only)
  async validateSystemPolicies(policies) {
    try {
      const response = await api.post('/courses/admin/validate-policies/', policies);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get policy impact analysis (admin only)
  async getPolicyImpactAnalysis(policies) {
    try {
      const response = await api.post('/courses/admin/policy-impact/', policies);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get policy change history (admin only)
  async getPolicyChangeHistory(params = {}) {
    try {
      const response = await api.get('/courses/admin/policy-history/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export policies (admin only)
  async exportPolicies(format = 'json') {
    try {
      const response = await api.get('/courses/admin/export-policies/', {
        params: { format }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import policies (admin only)
  async importPolicies(policiesData, format = 'json') {
    try {
      const response = await api.post('/courses/admin/import-policies/', policiesData, {
        headers: {
          'Content-Type': format === 'json' ? 'application/json' : 'text/csv'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== SYSTEM MAINTENANCE TOOLS ==========

  // Get system status (admin only)
  async getSystemStatus() {
    try {
      const response = await api.get('/courses/admin/system-status/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Execute system cleanup (admin only)
  async executeSystemCleanup(options) {
    try {
      const response = await api.post('/courses/admin/system-cleanup/', options);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create system backup (admin only)
  async createSystemBackup(options) {
    try {
      const response = await api.post('/courses/admin/system-backup/', options);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Execute system optimization (admin only)
  async executeSystemOptimization(options) {
    try {
      const response = await api.post('/courses/admin/system-optimization/', options);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update monitoring configuration (admin only)
  async updateMonitoringConfig(config) {
    try {
      const response = await api.put('/courses/admin/monitoring-config/', config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get maintenance logs (admin only)
  async getMaintenanceLogs(params = {}) {
    try {
      const response = await api.get('/courses/admin/maintenance-logs/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Schedule maintenance task (admin only)
  async scheduleMaintenanceTask(taskData) {
    try {
      const response = await api.post('/courses/admin/schedule-maintenance/', taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get scheduled maintenance tasks (admin only)
  async getScheduledMaintenanceTasks() {
    try {
      const response = await api.get('/courses/admin/scheduled-maintenance/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cancel scheduled maintenance task (admin only)
  async cancelScheduledMaintenanceTask(taskId) {
    try {
      const response = await api.delete(`/courses/admin/scheduled-maintenance/${taskId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get system health metrics (admin only)
  async getSystemHealthMetrics() {
    try {
      const response = await api.get('/courses/admin/system-health/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== ADVANCED ADMIN FEATURES ==========

  // Get detailed course analytics (admin only)
  async getDetailedCourseAnalytics(courseId, params = {}) {
    try {
      const response = await api.get(`/courses/${courseId}/detailed-analytics/`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get enrollment trends (admin only)
  async getEnrollmentTrends(params = {}) {
    try {
      const response = await api.get('/courses/admin/enrollment-trends/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get instructor performance metrics (admin only)
  async getInstructorPerformanceMetrics(instructorId, params = {}) {
    try {
      const response = await api.get(`/courses/admin/instructor-performance/${instructorId}/`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get student progress analytics (admin only)
  async getStudentProgressAnalytics(params = {}) {
    try {
      const response = await api.get('/courses/admin/student-progress/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Generate custom reports (admin only)
  async generateCustomReport(reportConfig) {
    try {
      const response = await api.post('/courses/admin/custom-report/', reportConfig);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get audit trail (admin only)
  async getAuditTrail(params = {}) {
    try {
      const response = await api.get('/courses/admin/audit-trail/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get system alerts (admin only)
  async getSystemAlerts() {
    try {
      const response = await api.get('/courses/admin/system-alerts/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Dismiss system alert (admin only)
  async dismissSystemAlert(alertId) {
    try {
      const response = await api.post(`/courses/admin/system-alerts/${alertId}/dismiss/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get compliance report (admin only)
  async getComplianceReport() {
    try {
      const response = await api.get('/courses/admin/compliance-report/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export data for external systems (admin only)
  async exportDataForIntegration(format = 'json', dataType = 'courses') {
    try {
      const response = await api.get('/courses/admin/export-integration/', {
        params: { format, data_type: dataType }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== PERMISSION VALIDATION HELPERS ==========

  // Check if user has admin permissions
  hasAdminPermissions(user) {
    return user && user.is_superuser === true;
  },

  // Check if user can manage courses (admin or instructor)
  canManageCourses(user) {
    return user && (user.is_superuser === true || user.is_instructor === true);
  },

  // Check if user can perform admin operations
  canPerformAdminOperations(user) {
    return user && user.is_superuser === true;
  },

  // Validate admin permissions for operations
  validateAdminPermissions(user, operation = '') {
    if (!this.hasAdminPermissions(user)) {
      throw new Error(`No tienes permisos de administrador para realizar esta operación: ${operation}`);
    }
  },

  // Validate course management permissions
  validateCourseManagementPermissions(user, operation = '') {
    if (!this.canManageCourses(user)) {
      throw new Error(`No tienes permisos para gestionar cursos: ${operation}`);
    }
  },

  // ========== ERROR HANDLING FOR ADMIN OPERATIONS ==========

  // Handle admin operation errors with specific messages
  handleAdminError(error, operation = '') {
    const errorMessage = error.message || 'Error en operación administrativa';

    // Specific error handling based on operation
    if (operation === 'activate' && error.response?.status === 400) {
      return 'El curso no se puede activar. Verifica que esté inactivo.';
    }

    if (operation === 'deactivate' && error.response?.status === 400) {
      return 'El curso no se puede desactivar. Verifica que esté activo.';
    }

    if (operation === 'transfer' && error.response?.status === 400) {
      return 'No se puede transferir el curso. Verifica que el instructor sea válido.';
    }

    if (operation === 'create' && error.response?.status === 400) {
      return 'Error en los datos del curso. Verifica que toda la información sea correcta.';
    }

    if (operation === 'update' && error.response?.status === 400) {
      return 'Error al actualizar el curso. Verifica que los cambios sean válidos.';
    }

    if (operation === 'duplicate' && error.response?.status === 400) {
      return 'Error al duplicar el curso. Verifica que el curso original exista.';
    }

    if (operation === 'transfer' && error.response?.status === 400) {
      return 'No se puede transferir el curso. Verifica que el instructor sea válido.';
    }

    if (operation === 'update_category' && error.response?.status === 400) {
      return 'Error al actualizar la categoría. Verifica que la categoría sea válida.';
    }

    if (operation === 'update_level' && error.response?.status === 400) {
      return 'Error al actualizar el nivel. Verifica que el nivel sea válido.';
    }

    if (operation === 'update_modality' && error.response?.status === 400) {
      return 'Error al actualizar la modalidad. Verifica que la modalidad sea válida.';
    }

    if (operation === 'set_price' && error.response?.status === 400) {
      return 'Error al establecer el precio. Verifica que el precio sea válido.';
    }

    if (operation === 'set_capacity' && error.response?.status === 400) {
      return 'Error al establecer la capacidad. Verifica que la capacidad sea válida.';
    }

    if (operation === 'change_state' && error.response?.status === 400) {
      return 'Error al cambiar el estado del curso. Verifica que la transición sea válida.';
    }

    if (operation === 'auto_transition' && error.response?.status === 400) {
      return 'Error al ejecutar transición automática. Verifica que las condiciones se cumplan.';
    }

    if (operation === 'transfer' && error.response?.status === 400) {
      return 'Error en la transferencia. Verifica que el instructor sea válido y esté disponible.';
    }

    if (operation === 'validate_transfer' && error.response?.status === 400) {
      return 'La transferencia no es válida. Verifica los requisitos del instructor.';
    }

    if (operation === 'update_policies' && error.response?.status === 400) {
      return 'Error en las políticas. Verifica que todos los valores sean válidos.';
    }

    if (operation === 'validate_policies' && error.response?.status === 400) {
      return 'Las políticas no son válidas. Revisa los valores ingresados.';
    }

    if (operation === 'import_policies' && error.response?.status === 400) {
      return 'Error al importar las políticas. Verifica el formato del archivo.';
    }

    if (operation === 'system_cleanup' && error.response?.status === 400) {
      return 'Error durante la limpieza del sistema. Verifica los parámetros.';
    }

    if (operation === 'system_backup' && error.response?.status === 400) {
      return 'Error al crear el respaldo. Verifica la configuración.';
    }

    if (operation === 'system_optimization' && error.response?.status === 400) {
      return 'Error durante la optimización. Verifica las opciones seleccionadas.';
    }

    if (operation === 'monitoring_config' && error.response?.status === 400) {
      return 'Error al actualizar la configuración de monitoreo.';
    }

    if (operation === 'detailed_analytics' && error.response?.status === 400) {
      return 'Error al obtener analíticas detalladas. Verifica los parámetros.';
    }

    if (operation === 'enrollment_trends' && error.response?.status === 400) {
      return 'Error al obtener tendencias de inscripción. Verifica el período solicitado.';
    }

    if (operation === 'instructor_performance' && error.response?.status === 400) {
      return 'Error al obtener métricas de rendimiento del instructor.';
    }

    if (operation === 'custom_report' && error.response?.status === 400) {
      return 'Error al generar el reporte personalizado. Verifica la configuración.';
    }

    if (operation === 'audit_trail' && error.response?.status === 400) {
      return 'Error al obtener el registro de auditoría. Verifica los filtros.';
    }

    if (operation === 'compliance_report' && error.response?.status === 400) {
      return 'Error al generar el reporte de cumplimiento.';
    }

    if (operation === 'export_integration' && error.response?.status === 400) {
      return 'Error al exportar datos para integración. Verifica el formato solicitado.';
    }

    if (error.response?.status === 403) {
      return 'No tienes permisos para realizar esta operación administrativa.';
    }

    if (error.response?.status === 404) {
      return 'Curso no encontrado.';
    }

    if (error.response?.status === 409) {
      return 'Conflicto: El curso ya existe o hay datos duplicados.';
    }

    if (error.response?.status === 422) {
      return 'Datos inválidos: Verifica que toda la información requerida esté completa.';
    }

    return errorMessage;
  },

  // ========== SECURITY AND AUDIT FUNCTIONS ==========

  // Validate course data before operations
  validateCourseData(courseData, operation = 'create') {
    const errors = [];

    // Required fields validation
    const requiredFields = ['title', 'description', 'instructor_id', 'category', 'level', 'modality'];
    requiredFields.forEach(field => {
      if (!courseData[field] || (typeof courseData[field] === 'string' && !courseData[field].trim())) {
        errors.push(`El campo ${field} es obligatorio`);
      }
    });

    // Title validation
    if (courseData.title) {
      if (courseData.title.length < 5) {
        errors.push('El título debe tener al menos 5 caracteres');
      }
      if (courseData.title.length > 200) {
        errors.push('El título no puede tener más de 200 caracteres');
      }
    }

    // Description validation
    if (courseData.description) {
      if (courseData.description.length < 20) {
        errors.push('La descripción debe tener al menos 20 caracteres');
      }
      if (courseData.description.length > 2000) {
        errors.push('La descripción no puede tener más de 2000 caracteres');
      }
    }

    // Numeric fields validation
    if (courseData.duration && (isNaN(courseData.duration) || courseData.duration <= 0)) {
      errors.push('La duración debe ser un número positivo');
    }

    if (courseData.price && (isNaN(courseData.price) || courseData.price < 0)) {
      errors.push('El precio debe ser un número positivo');
    }

    if (courseData.max_students && (isNaN(courseData.max_students) || courseData.max_students <= 0)) {
      errors.push('La capacidad debe ser un número positivo');
    }

    // Date validation
    if (courseData.start_date && courseData.end_date) {
      const startDate = new Date(courseData.start_date);
      const endDate = new Date(courseData.end_date);
      if (startDate >= endDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize course data to prevent XSS and other security issues
  sanitizeCourseData(courseData) {
    const sanitized = {};

    // Sanitize string fields
    const stringFields = ['title', 'description', 'category', 'level', 'modality', 'image_url'];
    stringFields.forEach(field => {
      if (courseData[field]) {
        sanitized[field] = courseData[field]
          .replace(/[<>]/g, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: URLs
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      }
    });

    // Keep numeric fields as numbers
    const numericFields = ['duration', 'price', 'max_students', 'instructor_id'];
    numericFields.forEach(field => {
      if (typeof courseData[field] === 'number' && !isNaN(courseData[field])) {
        sanitized[field] = courseData[field];
      }
    });

    // Keep boolean fields
    if (typeof courseData.is_active === 'boolean') {
      sanitized.is_active = courseData.is_active;
    }

    // Keep date fields
    if (courseData.start_date) sanitized.start_date = courseData.start_date;
    if (courseData.end_date) sanitized.end_date = courseData.end_date;

    return sanitized;
  },

  // Audit log function (placeholder for future implementation)
  async logAdminAction(action, courseId, userId, details = {}) {
    try {
      // In a real implementation, this would send audit data to the backend
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        courseId,
        userId,
        details,
        userAgent: navigator.userAgent,
        ip: 'client-side' // IP would be determined server-side
      };

      console.log('Audit Log:', auditEntry);

      // Future: Send to backend audit endpoint
      // await api.post('/admin/audit/', auditEntry);

      return auditEntry;
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  },

  // Rate limiting check (client-side)
  checkRateLimit(action, userId) {
    const rateLimitKey = `rate_limit_${userId}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute

    const rateLimitData = JSON.parse(localStorage.getItem(rateLimitKey) || '{"requests": [], "blocked": false}');

    // Clean old requests outside the window
    rateLimitData.requests = rateLimitData.requests.filter(timestamp => now - timestamp < windowMs);

    if (rateLimitData.requests.length >= maxRequests) {
      rateLimitData.blocked = true;
      rateLimitData.blockedUntil = now + (5 * 60000); // Block for 5 minutes
    } else {
      rateLimitData.requests.push(now);
      rateLimitData.blocked = false;
    }

    localStorage.setItem(rateLimitKey, JSON.stringify(rateLimitData));

    return {
      allowed: !rateLimitData.blocked,
      remainingRequests: Math.max(0, maxRequests - rateLimitData.requests.length),
      resetTime: rateLimitData.blockedUntil || (now + windowMs)
    };
  }
};