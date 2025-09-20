import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAssignmentById,
  getAssignmentSubmissions,
  createSubmission,
  formatAssignmentStatus,
  getStatusColor,
  isOverdue,
  calculateTimeRemaining
} from '../services/taskService';

const AsignacionDetalle = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Estado para nueva entrega
  const [newSubmission, setNewSubmission] = useState({
    content: '',
    files: []
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    loadAssignmentData();
  }, [assignmentId]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignmentData, submissionsData] = await Promise.all([
        getAssignmentById(assignmentId),
        getAssignmentSubmissions(assignmentId)
      ]);

      setAssignment(assignmentData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error loading assignment data:', err);
      setError('Error al cargar los datos de la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadedFiles = [];

      for (const file of files) {
        const uploadedFile = await uploadTaskFile(assignment.task.id, file);
        uploadedFiles.push(uploadedFile);
      }

      setNewSubmission(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles]
      }));
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error al subir los archivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = async (fileId) => {
    try {
      await deleteTaskFile(fileId);
      setNewSubmission(prev => ({
        ...prev,
        files: prev.files.filter(file => file.id !== fileId)
      }));
    } catch (err) {
      console.error('Error removing file:', err);
      setError('Error al eliminar el archivo');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!newSubmission.content.trim() && newSubmission.files.length === 0) {
      setError('Debes proporcionar contenido o archivos para la entrega');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = {
        assignment: assignmentId,
        content: newSubmission.content.trim(),
        files: newSubmission.files.map(file => file.id)
      };

      const submission = await createSubmission(submissionData);
      
      // Recargar datos
      await loadAssignmentData();
      
      // Limpiar formulario
      setNewSubmission({
        content: '',
        files: []
      });
      
      setActiveTab('submissions');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Error al enviar la entrega');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta entrega?')) {
      return;
    }

    try {
      await deleteSubmission(submissionId);
      await loadAssignmentData();
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError('Error al eliminar la entrega');
    }
  };

  const canSubmit = () => {
    if (!assignment) return false;
    
    // Verificar si permite múltiples entregas
    if (!assignment.task.allow_multiple_submissions && submissions.length > 0) {
      return false;
    }
    
    // Verificar si está vencida y no permite entregas tardías
    if (isOverdue(assignment.effective_due_date, assignment.status) && !assignment.task.allow_late_submissions) {
      return false;
    }
    
    return assignment.status !== 'graded';
  };

  const getLatestSubmission = () => {
    return submissions.length > 0 ? submissions[0] : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Asignación no encontrada</p>
        </div>
      </div>
    );
  }

  const latestSubmission = getLatestSubmission();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <button
            onClick={() => navigate('/aula-virtual/tareas')}
            className="text-blue-500 hover:text-blue-600 mb-4 flex items-center"
          >
            ← Volver a tareas
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment.task_title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(assignment.status)}-100 text-${getStatusColor(assignment.status)}-800`}>
              {formatAssignmentStatus(assignment.status)}
            </span>
            {isOverdue(assignment.effective_due_date, assignment.status) && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Vencida
              </span>
            )}
            {latestSubmission && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Entregada
              </span>
            )}
            {latestSubmission?.score !== null && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Calificada: {latestSubmission.score}/{assignment.task.max_score || 100}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Información de tiempo */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fecha de Asignación</h3>
            <p className="text-gray-600">{new Date(assignment.assigned_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fecha de Vencimiento</h3>
            <p className={`${isOverdue(assignment.effective_due_date, assignment.status) ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
              {assignment.effective_due_date 
                ? new Date(assignment.effective_due_date).toLocaleDateString()
                : 'Sin fecha límite'
              }
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiempo Restante</h3>
            <p className={`${isOverdue(assignment.effective_due_date, assignment.status) ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
              {assignment.effective_due_date
                ? isOverdue(assignment.effective_due_date, assignment.status)
                  ? 'Vencida'
                  : calculateTimeRemaining(assignment.effective_due_date)
                : 'Sin límite'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Detalles
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'submit'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={!canSubmit()}
        >
          {latestSubmission ? 'Nueva Entrega' : 'Entregar'}
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'submissions'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Mis Entregas ({submissions.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'details' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Tarea</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Curso:</span>
                    <span className="ml-2">{assignment.course_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Instructor:</span>
                    <span className="ml-2">{assignment.instructor_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tipo:</span>
                    <span className="ml-2">{assignment.task_type}</span>
                  </div>
                  {assignment.task.max_score && (
                    <div>
                      <span className="font-medium text-gray-600">Puntuación máxima:</span>
                      <span className="ml-2">{assignment.task.max_score} puntos</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Entregas múltiples:</span>
                    <span className="ml-2">{assignment.task.allow_multiple_submissions ? 'Permitidas' : 'No permitidas'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Entregas tardías:</span>
                    <span className="ml-2">{assignment.task.allow_late_submissions ? 'Permitidas' : 'No permitidas'}</span>
                  </div>
                  {assignment.task.late_penalty_per_day && (
                    <div>
                      <span className="font-medium text-gray-600">Penalización por día:</span>
                      <span className="ml-2">{assignment.task.late_penalty_per_day}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Descripción</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.task_description}</p>
              </div>
            </div>
            
            {assignment.task_instructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instrucciones</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.task_instructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submit' && canSubmit() && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              {latestSubmission ? 'Nueva Entrega' : 'Entregar Tarea'}
            </h3>
            
            {latestSubmission && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  Ya tienes una entrega previa. Esta nueva entrega reemplazará la anterior.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmitAssignment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido de la Entrega
                </label>
                <textarea
                  value={newSubmission.content}
                  onChange={(e) => setNewSubmission(prev => ({ ...prev, content: e.target.value }))}
                  rows="8"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escribe tu respuesta o explicación aquí..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos Adjuntos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    disabled={uploadingFiles}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      {uploadingFiles ? 'Subiendo archivos...' : 'Haz clic para seleccionar archivos o arrastra aquí'}
                    </p>
                  </label>
                </div>
                
                {newSubmission.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
                    {newSubmission.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm text-gray-700">{file.original_name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!newSubmission.content.trim() && newSubmission.files.length === 0)}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Enviando...' : 'Enviar Entrega'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'submit' && !canSubmit() && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-4">No puedes realizar más entregas</p>
            <div className="text-sm text-gray-600">
              {!assignment.task.allow_multiple_submissions && submissions.length > 0 && (
                <p>Esta tarea no permite múltiples entregas</p>
              )}
              {isOverdue(assignment.effective_due_date, assignment.status) && !assignment.task.allow_late_submissions && (
                <p>La fecha límite ha pasado y no se permiten entregas tardías</p>
              )}
              {assignment.status === 'graded' && (
                <p>Esta tarea ya ha sido calificada</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Mis Entregas</h3>
            
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No has realizado entregas aún</p>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission, index) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Entrega #{submissions.length - index}
                          {index === 0 && <span className="ml-2 text-sm text-green-600">(Más reciente)</span>}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Enviada el {new Date(submission.submitted_at).toLocaleDateString()} a las {new Date(submission.submitted_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.score !== null ? (
                          <div>
                            <span className="text-lg font-bold text-blue-600">
                              {submission.score}/{assignment.task.max_score || 100}
                            </span>
                            <p className="text-sm text-gray-500">Calificada</p>
                          </div>
                        ) : (
                          <span className="text-yellow-600">Pendiente de calificación</span>
                        )}
                      </div>
                    </div>
                    
                    {submission.content && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Contenido:</h5>
                        <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {submission.content}
                        </p>
                      </div>
                    )}
                    
                    {submission.files && submission.files.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Archivos adjuntos:</h5>
                        <div className="space-y-2">
                          {submission.files.map(file => (
                            <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{file.original_name}</span>
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                Descargar
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {submission.feedback && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Retroalimentación del instructor:</h5>
                        <p className="text-gray-600 whitespace-pre-wrap bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                    
                    {index === 0 && canSubmit() && assignment.task.allow_multiple_submissions && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveTab('submit')}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          Realizar nueva entrega
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignacionDetalle;