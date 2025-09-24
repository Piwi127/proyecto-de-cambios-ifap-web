import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService.js';
import { lessonService } from '../services/lessonService.js';
import { quizService } from '../services/quizService.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card';
import './CursoDetalle.css';

const CursoDetalle = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principales
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos del curso
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      
      // Obtener lecciones del curso
      const lessonsData = await lessonService.getAllLessons(courseId);
      setLessons(lessonsData);
      
      // Obtener quizzes del curso
      const quizzesData = await quizService.getQuizzesByCourse(courseId);
      setQuizzes(quizzesData);
      
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Error al cargar los datos del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      await lessonService.markLessonCompleted(lessonId);
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: { completed: true, completedAt: new Date() }
      }));
      // Refrescar datos del curso para actualizar progreso
      fetchCourseData();
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBackToCourses = () => {
    navigate('/aula-virtual/cursos');
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson-content');
  };

  if (loading) {
    return (
      <div className="curso-detalle-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando curso...</p>
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
        
        <div className="curso-banner">
          <div className="curso-banner-content">
            <div className="curso-info">
              <h1 className="curso-title">{course.title}</h1>
              <p className="curso-instructor">Instructor: {course.instructor_name || course.instructor}</p>
              <div className="curso-meta">
                <span className="curso-duration">📚 {course.duration || 40} horas</span>
                <span className="curso-modality">🌐 {course.modality || 'Virtual'}</span>
                <span className="curso-students">👥 {course.enrolled_students || 0} estudiantes</span>
                {course.progress !== undefined && (
                  <span className="curso-progress">📊 Progreso: {course.progress}%</span>
                )}
              </div>
            </div>
            
            {/* Barra de progreso */}
            {course.progress !== undefined && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{course.progress}% completado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="curso-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          📋 Información General
        </button>
        <button 
          className={`tab-button ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => handleTabChange('lessons')}
        >
          📖 Lecciones ({lessons.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => handleTabChange('quizzes')}
        >
          🎯 Evaluaciones ({quizzes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          📁 Recursos
        </button>
        <button 
          className={`tab-button ${activeTab === 'forum' ? 'active' : ''}`}
          onClick={() => handleTabChange('forum')}
        >
          💬 Foro
        </button>
        <button 
          className={`tab-button ${activeTab === 'certificate' ? 'active' : ''}`}
          onClick={() => handleTabChange('certificate')}
        >
          🏆 Certificado
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="curso-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Descripción del curso */}
              <Card className="description-card">
                <h3>📝 Descripción del Curso</h3>
                <p>{course.description}</p>
                
                {course.objectives && (
                  <div className="objectives-section">
                    <h4>🎯 Objetivos de Aprendizaje</h4>
                    <ul>
                      {course.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Estadísticas del curso */}
              <Card className="stats-card">
                <h3>📊 Estadísticas del Curso</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{lessons.length}</span>
                    <span className="stat-label">Lecciones</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{quizzes.length}</span>
                    <span className="stat-label">Evaluaciones</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{course.enrolled_students || 0}</span>
                    <span className="stat-label">Estudiantes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{course.duration || 40}h</span>
                    <span className="stat-label">Duración</span>
                  </div>
                </div>
              </Card>

              {/* Próxima lección */}
              {course.next_lesson && (
                <Card className="next-lesson-card">
                  <h3>📚 Próxima Lección</h3>
                  <div className="next-lesson-content">
                    <h4>{course.next_lesson.title}</h4>
                    <p>{course.next_lesson.description}</p>
                    <button 
                      className="btn-primary"
                      onClick={() => handleLessonClick(course.next_lesson)}
                    >
                      Continuar Lección
                    </button>
                  </div>
                </Card>
              )}

              {/* Temario */}
              {course.syllabus && (
                <Card className="syllabus-card">
                  <h3>📋 Temario del Curso</h3>
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
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="lessons-tab">
            <div className="lessons-header">
              <h3>📖 Lecciones del Curso</h3>
              <p>Completa las lecciones en orden para avanzar en el curso</p>
            </div>
            
            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className="lesson-card">
                  <div className="lesson-content">
                    <div className="lesson-number">{index + 1}</div>
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <p>{lesson.description}</p>
                      <div className="lesson-meta">
                        <span>⏱️ {lesson.duration || 30} min</span>
                        <span>📄 {lesson.content_type || 'Texto'}</span>
                      </div>
                    </div>
                    <div className="lesson-actions">
                      {lessonProgress[lesson.id]?.completed ? (
                        <div className="lesson-completed">
                          <span className="completed-icon">✅</span>
                          <span>Completada</span>
                        </div>
                      ) : (
                        <button 
                          className="btn-primary"
                          onClick={() => handleLessonClick(lesson)}
                        >
                          {index === 0 || lessonProgress[lessons[index-1]?.id]?.completed ? 'Iniciar' : 'Bloqueada'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lesson-content' && selectedLesson && (
          <div className="lesson-content-tab">
            <div className="lesson-viewer">
              <div className="lesson-header">
                <button 
                  className="btn-back"
                  onClick={() => setActiveTab('lessons')}
                >
                  ← Volver a Lecciones
                </button>
                <h3>{selectedLesson.title}</h3>
              </div>
              
              <Card className="lesson-content-card">
                <div className="lesson-body">
                  <p>{selectedLesson.description}</p>
                  {selectedLesson.content && (
                    <div className="lesson-text">
                      {selectedLesson.content}
                    </div>
                  )}
                  
                  {/* Aquí se podría agregar contenido multimedia */}
                  <div className="lesson-media">
                    {selectedLesson.video_url && (
                      <div className="video-container">
                        <iframe 
                          src={selectedLesson.video_url}
                          title={selectedLesson.title}
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="lesson-footer">
                  <button 
                    className="btn-success"
                    onClick={() => handleLessonComplete(selectedLesson.id)}
                    disabled={lessonProgress[selectedLesson.id]?.completed}
                  >
                    {lessonProgress[selectedLesson.id]?.completed ? '✅ Completada' : 'Marcar como Completada'}
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="quizzes-tab">
            <div className="quizzes-header">
              <h3>🎯 Evaluaciones del Curso</h3>
              <p>Demuestra tus conocimientos con estas evaluaciones</p>
            </div>
            
            <div className="quizzes-list">
              {quizzes.length > 0 ? quizzes.map((quiz) => (
                <Card key={quiz.id} className="quiz-card">
                  <div className="quiz-content">
                    <div className="quiz-info">
                      <h4>{quiz.title}</h4>
                      <p>{quiz.description}</p>
                      <div className="quiz-meta">
                        <span>❓ {quiz.questions_count || 0} preguntas</span>
                        <span>⏱️ {quiz.time_limit_minutes || 'Sin límite'} min</span>
                        <span>📊 {quiz.passing_score || 70}% para aprobar</span>
                      </div>
                    </div>
                    <div className="quiz-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/aula-virtual/quiz/${quiz.id}`)}
                      >
                        Realizar Evaluación
                      </button>
                    </div>
                  </div>
                </Card>
              )) : (
                <Card className="no-quizzes">
                  <div className="empty-state">
                    <span className="empty-icon">🎯</span>
                    <h4>No hay evaluaciones disponibles</h4>
                    <p>Las evaluaciones aparecerán aquí cuando estén disponibles</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-tab">
            <div className="resources-header">
              <h3>📁 Recursos del Curso</h3>
              <p>Materiales adicionales para complementar tu aprendizaje</p>
            </div>
            
            <div className="resources-grid">
              <Card className="resource-category">
                <h4>📚 Documentos</h4>
                <div className="resource-list">
                  <div className="resource-item">
                    <span className="resource-icon">📄</span>
                    <span>Manual del Curso.pdf</span>
                    <button className="btn-download">Descargar</button>
                  </div>
                  <div className="resource-item">
                    <span className="resource-icon">📊</span>
                    <span>Presentaciones.pptx</span>
                    <button className="btn-download">Descargar</button>
                  </div>
                </div>
              </Card>

              <Card className="resource-category">
                <h4>🔗 Enlaces Útiles</h4>
                <div className="resource-list">
                  <div className="resource-item">
                    <span className="resource-icon">🌐</span>
                    <span>Sitio Web Oficial</span>
                    <button className="btn-link">Visitar</button>
                  </div>
                  <div className="resource-item">
                    <span className="resource-icon">📖</span>
                    <span>Bibliografía Recomendada</span>
                    <button className="btn-link">Ver</button>
                  </div>
                </div>
              </Card>

              <Card className="resource-category">
                <h4>🎥 Videos Complementarios</h4>
                <div className="resource-list">
                  <div className="resource-item">
                    <span className="resource-icon">▶️</span>
                    <span>Introducción al Tema</span>
                    <button className="btn-play">Reproducir</button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="forum-tab">
            <div className="forum-header">
              <h3>💬 Foro del Curso</h3>
              <p>Participa en discusiones con otros estudiantes e instructores</p>
            </div>
            
            <Card className="forum-content">
              <div className="forum-stats">
                <div className="stat">
                  <span className="stat-number">24</span>
                  <span className="stat-label">Temas</span>
                </div>
                <div className="stat">
                  <span className="stat-number">156</span>
                  <span className="stat-label">Mensajes</span>
                </div>
                <div className="stat">
                  <span className="stat-number">18</span>
                  <span className="stat-label">Participantes</span>
                </div>
              </div>
              
              <div className="forum-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate(`/aula-virtual/foro/curso/${courseId}`)}
                >
                  Ir al Foro del Curso
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className="certificate-tab">
            <div className="certificate-header">
              <h3>🏆 Certificado del Curso</h3>
              <p>Obtén tu certificado al completar el curso exitosamente</p>
            </div>
            
            <Card className="certificate-content">
              {course.progress === 100 ? (
                <div className="certificate-available">
                  <div className="certificate-icon">🎓</div>
                  <h4>¡Felicitaciones!</h4>
                  <p>Has completado exitosamente el curso</p>
                  <button className="btn-success">
                    Descargar Certificado
                  </button>
                </div>
              ) : (
                <div className="certificate-pending">
                  <div className="certificate-icon">📋</div>
                  <h4>Certificado en Progreso</h4>
                  <p>Completa el {100 - (course.progress || 0)}% restante del curso para obtener tu certificado</p>
                  <div className="certificate-requirements">
                    <h5>Requisitos:</h5>
                    <ul>
                      <li>✅ Completar todas las lecciones</li>
                      <li>✅ Aprobar todas las evaluaciones</li>
                      <li>⏳ Alcanzar el 100% de progreso</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CursoDetalle;