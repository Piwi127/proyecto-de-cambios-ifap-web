import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import Card from '../components/Card';

const CalificacionesAulaVirtual = () => {
  const { user: _user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndGrades();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndGrades = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para obtener estudiantes y calificaciones
      // Por ahora usamos datos de ejemplo
      const mockStudents = [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
        { id: 2, name: 'María García', email: 'maria@example.com' },
        { id: 3, name: 'Carlos López', email: 'carlos@example.com' },
      ];
      setStudents(mockStudents);

      // Calificaciones de ejemplo
      const mockGrades = {
        1: { quiz1: 85, quiz2: 92, final: 88 },
        2: { quiz1: 78, quiz2: 85, final: 81 },
        3: { quiz1: 95, quiz2: 88, final: 91 },
      };
      setGrades(mockGrades);
    } catch (err) {
      console.error('Error fetching students and grades:', err);
      setError('Error al cargar estudiantes y calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, assessment, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessment]: parseFloat(value) || 0
      }
    }));
  };

  const calculateAverage = (studentGrades) => {
    if (!studentGrades) return 0;
    const values = Object.values(studentGrades);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600 bg-green-50';
    if (grade >= 80) return 'text-blue-600 bg-blue-50';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">📊 Gestión de Calificaciones</h1>
        <p className="text-primary-100">
          Administra las calificaciones de tus estudiantes de forma organizada y eficiente.
        </p>
      </div>

      {/* Selector de curso */}
      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Curso
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecciona un curso...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examen Final
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const studentGrades = grades[student.id] || {};
                  const average = calculateAverage(studentGrades);

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.quiz1 || ''}
                          onChange={(e) => handleGradeChange(student.id, 'quiz1', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.quiz2 || ''}
                          onChange={(e) => handleGradeChange(student.id, 'quiz2', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.final || ''}
                          onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(average)}`}>
                          {average}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!selectedCourse && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Selecciona un curso para ver las calificaciones
            </h3>
            <p className="text-gray-500">
              Elige un curso de la lista para gestionar las calificaciones de sus estudiantes.
            </p>
          </div>
        )}
      </Card>

      {/* Estadísticas */}
      {selectedCourse && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {students.filter(s => calculateAverage(grades[s.id]) >= 90).length}
              </div>
              <p className="text-sm text-gray-600">Excelente (90-100)</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {students.filter(s => {
                  const avg = calculateAverage(grades[s.id]);
                  return avg >= 80 && avg < 90;
                }).length}
              </div>
              <p className="text-sm text-gray-600">Bueno (80-89)</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {students.filter(s => calculateAverage(grades[s.id]) < 80).length}
              </div>
              <p className="text-sm text-gray-600">Necesita mejorar (&lt;80)</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalificacionesAulaVirtual;