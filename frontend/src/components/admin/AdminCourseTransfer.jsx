import React, { useState, useEffect } from 'react';
import PermissionCheck from '../PermissionCheck.jsx';

const AdminCourseTransfer = ({
  course,
  onClose,
  onTransfer,
  onSuccess
}) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transferOptions, setTransferOptions] = useState({
    notifyPreviousInstructor: true,
    notifyNewInstructor: true,
    notifyStudents: false,
    transferEnrollments: true,
    updateCourseHistory: true,
    sendNotification: true
  });
  const [transferHistory, setTransferHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    showActiveOnly: true,
    showAvailableOnly: true,
    minRating: 0
  });

  // Load instructors and transfer history on component mount
  useEffect(() => {
    loadInstructors();
    loadTransferHistory();
  }, []);

  const loadInstructors = async () => {
    try {
      // Simulate API call - replace with actual service call
      const mockInstructors = [
        {
          id: 1,
          name: 'Dr. María González',
          email: 'maria.gonzalez@university.edu',
          department: 'Ingeniería de Sistemas',
          is_active: true,
          current_courses: 3,
          max_courses: 5,
          rating: 4.8,
          specializations: ['Programación', 'Base de Datos', 'Inteligencia Artificial']
        },
        {
          id: 2,
          name: 'Prof. Carlos Rodríguez',
          email: 'carlos.rodriguez@university.edu',
          department: 'Matemáticas',
          is_active: true,
          current_courses: 2,
          max_courses: 4,
          rating: 4.6,
          specializations: ['Álgebra', 'Cálculo', 'Estadística']
        },
        {
          id: 3,
          name: 'Dra. Ana López',
          email: 'ana.lopez@university.edu',
          department: 'Ciencias de la Computación',
          is_active: true,
          current_courses: 4,
          max_courses: 6,
          rating: 4.9,
          specializations: ['Algoritmos', 'Estructuras de Datos', 'Machine Learning']
        },
        {
          id: 4,
          name: 'Prof. Juan Martínez',
          email: 'juan.martinez@university.edu',
          department: 'Ingeniería de Software',
          is_active: false,
          current_courses: 1,
          max_courses: 3,
          rating: 4.2,
          specializations: ['Desarrollo Web', 'Testing', 'DevOps']
        }
      ];

      setInstructors(mockInstructors);
    } catch (error) {
      console.error('Error loading instructors:', error);
    }
  };

  const loadTransferHistory = async () => {
    try {
      // Simulate API call - replace with actual service call
      const mockHistory = [
        {
          id: 1,
          course_title: 'Introducción a la Programación',
          from_instructor: 'Dr. Pedro Sánchez',
          to_instructor: 'Dr. María González',
          transfer_date: '2024-01-15T10:30:00Z',
          reason: 'Reasignación por carga académica',
          status: 'completed'
        },
        {
          id: 2,
          course_title: 'Base de Datos Avanzadas',
          from_instructor: 'Prof. Laura Torres',
          to_instructor: 'Prof. Carlos Rodríguez',
          transfer_date: '2024-01-10T14:20:00Z',
          reason: 'Cambio de departamento',
          status: 'completed'
        }
      ];

      setTransferHistory(mockHistory);
    } catch (error) {
      console.error('Error loading transfer history:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInstructor) {
      alert('Selecciona un instructor para la transferencia');
      return;
    }

    setShowConfirmDialog(true);
  };

  const executeTransfer = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const selectedInstructorData = instructors.find(inst => inst.id === parseInt(selectedInstructor));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = {
        success: true,
        message: `Curso "${course.title}" transferido exitosamente a ${selectedInstructorData.name}`,
        course_id: course.id,
        from_instructor: course.instructor_name,
        to_instructor: selectedInstructorData.name,
        transfer_date: new Date().toISOString(),
        reason: reason,
        options: transferOptions
      };

      if (onTransfer) {
        onTransfer(course.id, selectedInstructor, reason, transferOptions);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      // Reload instructors and history
      await loadInstructors();
      await loadTransferHistory();

    } catch (error) {
      console.error('Error transferring course:', error);
      alert('Error al transferir el curso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInstructorStatus = (instructor) => {
    if (!instructor.is_active) return { status: 'inactive', label: 'Inactivo', color: 'red' };
    if (instructor.current_courses >= instructor.max_courses) return { status: 'unavailable', label: 'No disponible', color: 'orange' };
    return { status: 'available', label: 'Disponible', color: 'green' };
  };

  const getFilteredInstructors = () => {
    return instructors.filter(instructor => {
      // Search filter
      if (searchTerm && !instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !instructor.department.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filters
      if (filterOptions.showActiveOnly && !instructor.is_active) return false;
      if (filterOptions.showAvailableOnly && instructor.current_courses >= instructor.max_courses) return false;

      // Rating filter
      if (instructor.rating < filterOptions.minRating) return false;

      return true;
    });
  };

  const getTransferImpact = () => {
    const selectedInstructorData = instructors.find(inst => inst.id === parseInt(selectedInstructor));
    if (!selectedInstructorData) return null;

    const currentLoad = selectedInstructorData.current_courses;
    const maxLoad = selectedInstructorData.max_courses;
    const newLoad = currentLoad + 1;
    const utilization = (newLoad / maxLoad) * 100;

    return {
      currentLoad,
      newLoad,
      maxLoad,
      utilization,
      isOverloaded: newLoad > maxLoad
    };
  };

  const impact = getTransferImpact();
  const filteredInstructors = getFilteredInstructors();

  // Confirmation Dialog Component
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Confirmar transferencia
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas transferir el curso <strong>"{course?.title}"</strong>?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="text-sm text-blue-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">De:</span> {course?.instructor_name}
                  </div>
                  <div>
                    <span className="font-medium">Para:</span> {instructors.find(inst => inst.id === parseInt(selectedInstructor))?.name}
                  </div>
                </div>
                {reason && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="font-medium">Motivo:</div>
                    <div className="text-sm">{reason}</div>
                  </div>
                )}
              </div>
            </div>

            {impact && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Impacto en el nuevo instructor:</h4>
                <div className="text-sm text-yellow-700">
                  <div className="flex justify-between">
                    <span>Carga actual:</span>
                    <span>{impact.currentLoad} de {impact.maxLoad} cursos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nueva carga:</span>
                    <span className={impact.isOverloaded ? 'text-red-600 font-medium' : ''}>
                      {impact.newLoad} de {impact.maxLoad} cursos ({Math.round(impact.utilization)}%)
                    </span>
                  </div>
                  {impact.isOverloaded && (
                    <div className="mt-1 text-red-600 font-medium">
                      ⚠️ Esta transferencia sobrecargará al instructor
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Opciones de transferencia:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Notificar instructor anterior:</span>
                  <span>{transferOptions.notifyPreviousInstructor ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notificar nuevo instructor:</span>
                  <span>{transferOptions.notifyNewInstructor ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transferir estudiantes inscritos:</span>
                  <span>{transferOptions.transferEnrollments ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actualizar historial del curso:</span>
                  <span>{transferOptions.updateCourseHistory ? 'Sí' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={executeTransfer}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                impact?.isOverloaded
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Confirmar transferencia'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Transferencia de Curso
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Course Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{course?.title}</h4>
                  <p className="text-sm text-gray-500">Instructor actual: {course?.instructor_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Estudiantes inscritos</div>
                  <div className="text-lg font-medium text-gray-900">{course?.enrolled_students || 0}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Instructor Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Nuevo Instructor</h4>

                  {/* Search and Filters */}
                  <div className="mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email o departamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />

                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterOptions.showActiveOnly}
                          onChange={(e) => setFilterOptions(prev => ({
                            ...prev,
                            showActiveOnly: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Solo activos</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterOptions.showAvailableOnly}
                          onChange={(e) => setFilterOptions(prev => ({
                            ...prev,
                            showAvailableOnly: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Solo disponibles</span>
                      </label>

                      <select
                        value={filterOptions.minRating}
                        onChange={(e) => setFilterOptions(prev => ({
                          ...prev,
                          minRating: parseFloat(e.target.value)
                        }))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={0}>Todas las calificaciones</option>
                        <option value={3.0}>Mínimo 3.0</option>
                        <option value={4.0}>Mínimo 4.0</option>
                        <option value={4.5}>Mínimo 4.5</option>
                      </select>
                    </div>
                  </div>

                  {/* Instructor List */}
                  <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md">
                    {filteredInstructors.map(instructor => {
                      const status = getInstructorStatus(instructor);
                      return (
                        <label
                          key={instructor.id}
                          className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            selectedInstructor === instructor.id.toString() ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="instructor"
                            value={instructor.id}
                            checked={selectedInstructor === instructor.id.toString()}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{instructor.name}</div>
                                <div className="text-sm text-gray-500">{instructor.department}</div>
                                <div className="text-xs text-gray-400">{instructor.email}</div>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  status.status === 'available' ? 'bg-green-100 text-green-800' :
                                  status.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {status.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ⭐ {instructor.rating}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-xs text-gray-500">
                                Carga: {instructor.current_courses}/{instructor.max_courses} cursos
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {instructor.specializations.slice(0, 3).map(spec => (
                                  <span key={spec} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}

                    {filteredInstructors.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No se encontraron instructores que coincidan con los filtros
                      </div>
                    )}
                  </div>
                </div>

                {/* Transfer Options and Impact */}
                <div>
                  {/* Transfer Impact */}
                  {impact && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Impacto de la Transferencia</h4>
                      <div className={`p-4 rounded-md border ${
                        impact.isOverloaded
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="text-sm">
                          <div className="flex justify-between mb-2">
                            <span>Instructor:</span>
                            <span className="font-medium">
                              {instructors.find(inst => inst.id === parseInt(selectedInstructor))?.name}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Carga actual:</span>
                            <span>{impact.currentLoad} de {impact.maxLoad} cursos</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Nueva carga:</span>
                            <span className={impact.isOverloaded ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                              {impact.newLoad} de {impact.maxLoad} cursos ({Math.round(impact.utilization)}%)
                            </span>
                          </div>
                          {impact.isOverloaded && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
                              ⚠️ Esta transferencia resultará en sobrecarga del instructor
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transfer Options */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones de Transferencia</h4>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={transferOptions.notifyPreviousInstructor}
                          onChange={(e) => setTransferOptions(prev => ({
                            ...prev,
                            notifyPreviousInstructor: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Notificar al instructor anterior</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={transferOptions.notifyNewInstructor}
                          onChange={(e) => setTransferOptions(prev => ({
                            ...prev,
                            notifyNewInstructor: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Notificar al nuevo instructor</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={transferOptions.notifyStudents}
                          onChange={(e) => setTransferOptions(prev => ({
                            ...prev,
                            notifyStudents: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Notificar a estudiantes inscritos</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={transferOptions.transferEnrollments}
                          onChange={(e) => setTransferOptions(prev => ({
                            ...prev,
                            transferEnrollments: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Transferir estudiantes inscritos</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={transferOptions.updateCourseHistory}
                          onChange={(e) => setTransferOptions(prev => ({
                            ...prev,
                            updateCourseHistory: e.target.checked
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Actualizar historial del curso</span>
                      </label>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la transferencia
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      placeholder="Describe el motivo de la transferencia..."
                    />
                  </div>
                </div>
              </div>

              {/* Transfer History */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Historial de Transferencias Recientes</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {transferHistory.map(transfer => (
                      <div key={transfer.id} className="text-sm bg-white p-2 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{transfer.course_title}</div>
                            <div className="text-gray-500">
                              {transfer.from_instructor} → {transfer.to_instructor}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(transfer.transfer_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{transfer.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedInstructor || loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    'Transferir Curso'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && <ConfirmDialog />}
    </>
  );
};

export default AdminCourseTransfer;