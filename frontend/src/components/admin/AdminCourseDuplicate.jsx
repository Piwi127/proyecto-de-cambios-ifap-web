import React, { useCallback, useEffect, useState } from 'react';
import { courseService } from '../../services/courseService.js';
import { validateCourseForm, sanitizeCourseData, validateAdminPermissions } from '../../utils/validation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminLoadingStates from './AdminLoadingStates.jsx';

const AdminCourseDuplicate = ({ course, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_id: '',
    category: '',
    level: '',
    modality: '',
    duration: '',
    price: '',
    max_students: '',
    image_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    duplicate_enrollments: false,
    duplicate_content: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validar permisos de administrador
  const loadInstructors = useCallback(async () => {
    try {
      // Simular carga de instructores - en un caso real vendría de una API
      const mockInstructors = [
        { id: 1, name: 'Dr. Juan Pérez', email: 'juan.perez@university.edu' },
        { id: 2, name: 'Dra. María González', email: 'maria.gonzalez@university.edu' },
        { id: 3, name: 'Prof. Carlos Rodríguez', email: 'carlos.rodriguez@university.edu' }
      ];
      setInstructors(mockInstructors);
    } catch (error) {
      console.error('Error loading instructors:', error);
    }
  }, []);

  const loadCourseData = useCallback(() => {
    if (!course) return;

    // Crear título duplicado
    const duplicatedTitle = `${course.title} (Copia)`;

    const courseData = {
      title: duplicatedTitle,
      description: course.description || '',
      instructor_id: course.instructor_id || course.instructor || '',
      category: course.category || '',
      level: course.level || '',
      modality: course.modality || '',
      duration: course.duration || '',
      price: course.price || '',
      max_students: course.max_students || '',
      image_url: course.image_url || '',
      start_date: '',
      end_date: '',
      is_active: false, // Por defecto los cursos duplicados están inactivos
      duplicate_enrollments: false,
      duplicate_content: false
    };

    setFormData(courseData);
  }, [course]);

  useEffect(() => {
    if (isOpen && user) {
      const { hasPermission, error } = validateAdminPermissions(user, ['create_courses']);
      if (!hasPermission) {
        alert(error);
        onClose();
        return;
      }
      loadInstructors();
    }
  }, [isOpen, loadInstructors, onClose, user]);

  useEffect(() => {
    if (isOpen && course) {
      loadCourseData();
    }
  }, [course, isOpen, loadCourseData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validación en tiempo real
    if (submitAttempted) {
      const newErrors = { ...errors };
      const fieldErrors = validateField(field, value);

      if (fieldErrors[field]) {
        newErrors[field] = fieldErrors[field];
      } else {
        delete newErrors[field];
      }

      setErrors(newErrors);
    }
  };

  const validateField = (field, value) => {
    const fieldErrors = {};

    switch (field) {
      case 'title':
        if (!value?.trim()) {
          fieldErrors.title = 'El título es obligatorio';
        } else if (value.trim().length < 5) {
          fieldErrors.title = 'El título debe tener al menos 5 caracteres';
        } else if (value.trim().length > 200) {
          fieldErrors.title = 'El título no puede tener más de 200 caracteres';
        }
        break;

      case 'description':
        if (!value?.trim()) {
          fieldErrors.description = 'La descripción es obligatoria';
        } else if (value.trim().length < 20) {
          fieldErrors.description = 'La descripción debe tener al menos 20 caracteres';
        } else if (value.trim().length > 2000) {
          fieldErrors.description = 'La descripción no puede tener más de 2000 caracteres';
        }
        break;

      case 'instructor_id':
        if (!value) {
          fieldErrors.instructor_id = 'Debe seleccionar un instructor';
        }
        break;

      case 'category':
        if (!value?.trim()) {
          fieldErrors.category = 'La categoría es obligatoria';
        }
        break;

      case 'level':
        if (!value) {
          fieldErrors.level = 'Debe seleccionar un nivel';
        }
        break;

      case 'modality':
        if (!value) {
          fieldErrors.modality = 'Debe seleccionar una modalidad';
        }
        break;

      case 'duration':
        if (value && (isNaN(value) || value <= 0)) {
          fieldErrors.duration = 'La duración debe ser un número positivo';
        }
        break;

      case 'price':
        if (value && (isNaN(value) || value < 0)) {
          fieldErrors.price = 'El precio debe ser un número positivo';
        }
        break;

      case 'max_students':
        if (value && (isNaN(value) || value <= 0)) {
          fieldErrors.max_students = 'La capacidad debe ser un número positivo';
        }
        break;

      case 'image_url':
        if (value?.trim()) {
          const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
          if (!urlRegex.test(value.trim())) {
            fieldErrors.image_url = 'Ingresa una URL válida de imagen';
          }
        }
        break;

      case 'end_date':
        if (formData.start_date && value) {
          const startDate = new Date(formData.start_date);
          const endDate = new Date(value);
          if (startDate >= endDate) {
            fieldErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
          }
        }
        break;
    }

    return fieldErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validar todo el formulario
    const sanitizedData = sanitizeCourseData(formData);
    const validation = validateCourseForm(sanitizedData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      // Crear el curso duplicado
      const duplicatedCourse = await courseService.createCourse(sanitizedData);

      // Si se seleccionó duplicar contenido, hacer la llamada correspondiente
      if (formData.duplicate_content && course.id) {
        // Aquí iría la lógica para duplicar contenido del curso original
        console.log('Duplicando contenido del curso:', course.id);
      }

      // Mostrar mensaje de éxito
      if (onSuccess) {
        onSuccess(duplicatedCourse);
      }

      // Cerrar modal
      onClose();

      // Resetear formulario
      setFormData({
        title: '',
        description: '',
        instructor_id: '',
        category: '',
        level: '',
        modality: '',
        duration: '',
        price: '',
        max_students: '',
        image_url: '',
        start_date: '',
        end_date: '',
        is_active: true,
        duplicate_enrollments: false,
        duplicate_content: false
      });
      setErrors({});
      setSubmitAttempted(false);

    } catch (error) {
      console.error('Error duplicating course:', error);
      const errorMessage = courseService.handleAdminError(error, 'create');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const validation = validateCourseForm(sanitizeCourseData(formData));
    if (validation.isValid) {
      setShowPreview(true);
    } else {
      setErrors(validation.errors);
      setSubmitAttempted(true);
    }
  };

  if (!isOpen || !course) return null;

  const categories = [
    'Archivística Básica',
    'Archivos Históricos',
    'Gestión Digital',
    'Preservación de Documentos',
    'Administración de Archivos',
    'Legislación Archivística'
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  const modalities = [
    { value: 'online', label: 'En línea' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Duplicar Curso</h2>
              <p className="text-gray-600">Crear una copia del curso: {course.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del curso original */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Curso Original</h4>
              <p className="text-sm text-blue-700 mt-1">
                Se creará una copia de "{course.title}" con la información básica duplicada.
                Puedes modificar cualquier campo antes de crear el nuevo curso.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese el título del curso"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/200 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe el contenido y objetivos del curso"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/2000 caracteres
                </p>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Nivel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar nivel</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
              </div>
            </div>
          </div>

          {/* Configuración del Curso */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor *
                </label>
                <select
                  value={formData.instructor_id}
                  onChange={(e) => handleInputChange('instructor_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.instructor_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} ({instructor.email})
                    </option>
                  ))}
                </select>
                {errors.instructor_id && <p className="mt-1 text-sm text-red-600">{errors.instructor_id}</p>}
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad *
                </label>
                <select
                  value={formData.modality}
                  onChange={(e) => handleInputChange('modality', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.modality ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar modalidad</option>
                  {modalities.map(modality => (
                    <option key={modality.value} value={modality.value}>{modality.label}</option>
                  ))}
                </select>
                {errors.modality && <p className="mt-1 text-sm text-red-600">{errors.modality}</p>}
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="40"
                  min="1"
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (S/)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="299.99"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad máxima
                </label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => handleInputChange('max_students', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.max_students ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                  min="1"
                />
                {errors.max_students && <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {formData.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Los cursos duplicados se crean inactivos por defecto
                </p>
              </div>
            </div>
          </div>

          {/* Opciones de Duplicación */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones de Duplicación</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.duplicate_content}
                  onChange={(e) => handleInputChange('duplicate_content', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Duplicar contenido del curso
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Copiará las lecciones, materiales y estructura del curso original
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.duplicate_enrollments}
                  onChange={(e) => handleInputChange('duplicate_enrollments', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Duplicar inscripciones
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Los estudiantes del curso original serán inscritos automáticamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al duplicar el curso</h3>
                  <div className="mt-2 text-sm text-red-700">{errors.submit}</div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Vista Previa
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Duplicando...
                </div>
              ) : (
                'Duplicar Curso'
              )}
            </button>
          </div>
        </form>

        {/* Modal de Vista Previa */}
        {showPreview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Vista Previa de Curso Duplicado</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{formData.title || 'Título del curso'}</h4>
                  <p className="text-gray-600 mt-1">{formData.description || 'Descripción del curso'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Categoría:</span> {formData.category || 'No especificada'}
                  </div>
                  <div>
                    <span className="font-medium">Nivel:</span> {levels.find(l => l.value === formData.level)?.label || 'No especificado'}
                  </div>
                  <div>
                    <span className="font-medium">Modalidad:</span> {modalities.find(m => m.value === formData.modality)?.label || 'No especificada'}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> {formData.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-purple-800">Curso Duplicado</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Se creará una copia del curso "{course.title}" con la configuración especificada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      // El formulario se enviará automáticamente
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Confirmar Duplicación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDuplicate;
