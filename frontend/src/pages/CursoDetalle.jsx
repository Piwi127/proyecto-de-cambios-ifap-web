import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService.js';
import { useAuth } from '../context/AuthContext.jsx';
import TareasTab from '../components/aula-virtual/TareasTab.jsx';
import ArchivosTab from '../components/aula-virtual/ArchivosTab.jsx';
import './CursoDetalle.css';

const CursoDetalle = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Error al cargar los detalles del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBackToCourses = () => {
    navigate('/aula-virtual/cursos');
  };

  if (loading) {
    return (
      <div className="curso-detalle-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando detalles del curso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curso-detalle-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={handleBackToCourses} className="btn-primary">
            Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="curso-detalle-container">
        <div className="error-message">
          <h3>Curso no encontrado</h3>
          <p>El curso que buscas no existe o no tienes permisos para verlo.</p>
          <button onClick={handleBackToCourses} className="btn-primary">
            Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="curso-detalle-container">
      {/* Header del curso */}
      <div className="curso-header">
        <button onClick={handleBackToCourses} className="btn-back">
          ← Volver a Mis Cursos
        </button>
        
        <div className="curso-info">
          <div className="curso-banner">
            {course.image && (
              <img src={course.image} alt={course.title} className="curso-image" />
            )}
            <div className="curso-overlay">
              <h1 className="curso-title">{course.title}</h1>
              <p className="curso-instructor">Instructor: {course.instructor_name}</p>
              <div className="curso-meta">
                <span className="curso-duration">Duración: {course.duration} horas</span>
                <span className="curso-modality">Modalidad: {course.modality}</span>
                {course.progress !== undefined && (
                  <span className="curso-progress">Progreso: {course.progress}%</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="curso-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Información General
        </button>
        <button 
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tasks')}
        >
          Tareas
        </button>
        <button 
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => handleTabChange('files')}
        >
          Archivos
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="curso-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="curso-description">
              <h3>Descripción del Curso</h3>
              <p>{course.description}</p>
            </div>
            
            {course.syllabus && (
              <div className="curso-syllabus">
                <h3>Temario</h3>
                <div className="syllabus-content">
                  {course.syllabus.modules && course.syllabus.modules.map((module, index) => (
                    <div key={index} className="syllabus-module">
                      <h4>{module.title}</h4>
                      <p>{module.description}</p>
                      {module.topics && (
                        <ul className="module-topics">
                          {module.topics.map((topic, topicIndex) => (
                            <li key={topicIndex}>{topic.title}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="curso-stats">
              <div className="stat-card">
                <h4>Estudiantes Inscritos</h4>
                <p className="stat-number">{course.enrolled_students || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Calificación</h4>
                <p className="stat-number">{course.average_rating || 'N/A'}</p>
              </div>
              <div className="stat-card">
                <h4>Fecha de Inicio</h4>
                <p className="stat-date">{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'Por definir'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TareasTab courseId={courseId} />
        )}

        {activeTab === 'files' && (
          <ArchivosTab courseId={courseId} />
        )}
      </div>
    </div>
  );
};

export default CursoDetalle;