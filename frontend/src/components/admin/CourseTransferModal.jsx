import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService.js';
import PermissionCheck from '../PermissionCheck.jsx';

const CourseTransferModal = ({ course, onClose, onSuccess }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load instructors on component mount
  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      // This would typically come from a users/instructors API endpoint
      // For now, we'll use a mock implementation
      const mockInstructors = [
        { id: 1, name: 'Dr. Juan Pérez', username: 'jperez', email: 'jperez@university.edu' },
        { id: 2, name: 'Dra. María González', username: 'mgonzalez', email: 'mgonzalez@university.edu' },
        { id: 3, name: 'Prof. Carlos Rodríguez', username: 'crodriguez', email: 'crodriguez@university.edu' },
        { id: 4, name: 'Dra. Ana López', username: 'alopez', email: 'alopez@university.edu' },
        { id: 5, name: 'Prof. Luis Martínez', username: 'lmartinez', email: 'lmartinez@university.edu' },
      ];
      setInstructors(mockInstructors);
    } catch (error) {
      console.error('Error loading instructors:', error);
      alert('Error al cargar la lista de instructores');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstructor) {
      alert('Selecciona un instructor');
      return;
    }

    setLoading(true);
    try {
      const result = await courseService.transferCourse(course.id, selectedInstructor, reason);

      // Show success message
      alert(`Curso "${course.title}" transferido exitosamente a ${result.transferred_to.name}`);

      // Call success callback
      onSuccess();

      // Close modal
      onClose();
    } catch (error) {
      const errorMessage = courseService.handleAdminError(error, 'transfer');
      alert('Error al transferir el curso: ' + errorMessage);
      console.error('Error transferring course:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Transferir Curso
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
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Información del curso
            </h4>
            <div className="text-sm text-blue-700">
              <p><strong>Título:</strong> {course.title}</p>
              <p><strong>Instructor actual:</strong> {course.instructor_name || 'No asignado'}</p>
              <p><strong>Estudiantes:</strong> {course.students_count || 0}</p>
              <p><strong>Estado:</strong> {course.is_active ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Instructor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar nuevo instructor
              </label>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar instructor por nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Instructor List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {filteredInstructors.map(instructor => (
                  <label
                    key={instructor.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
                      <div className="text-sm font-medium text-gray-900">
                        {instructor.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{instructor.username} • {instructor.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {filteredInstructors.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron instructores' : 'No hay instructores disponibles'}
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la transferencia (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Describe el motivo de la transferencia..."
              />
            </div>

            {/* Warning */}
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Importante
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Al transferir el curso:</p>
                      <ul className="mt-1 list-disc list-inside">
                        <li>El nuevo instructor tendrá control total sobre el curso</li>
                        <li>Se mantendrán todos los estudiantes inscritos</li>
                        <li>Se registrará la transferencia en el log de auditoría</li>
                        <li>El instructor anterior perderá acceso administrativo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={loading}
              >
                Cancelar
              </button>
              <PermissionCheck permission="transfer_courses">
                <button
                  type="submit"
                  disabled={!selectedInstructor || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Transfiriendo...
                    </div>
                  ) : (
                    'Transferir Curso'
                  )}
                </button>
              </PermissionCheck>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseTransferModal;