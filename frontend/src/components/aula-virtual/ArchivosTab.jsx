import React, { useCallback, useEffect, useState } from 'react';
import { courseService } from '../../services/courseService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './ArchivosTab.css';

const ArchivosTab = ({ courseId }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, course, task, submission
  const [searchTerm, setSearchTerm] = useState('');

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filesData = await courseService.getCourseFiles(courseId);
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Error al cargar los archivos');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchFiles();
    }
  }, [courseId, fetchFiles]);

  const handleUploadFile = async (fileData) => {
    try {
      setUploading(true);
      await courseService.uploadFile(courseId, fileData);
      await fetchFiles();
      setShowUploadForm(false);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const blob = await courseService.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Error al descargar el archivo');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      return;
    }

    try {
      await courseService.deleteFile(fileId);
      await fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Error al eliminar el archivo');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '📦';
      default: return '📁';
    }
  };

  const getAccessLevelText = (level) => {
    switch (level) {
      case 'public': return 'Público';
      case 'enrolled': return 'Solo estudiantes';
      case 'instructor': return 'Solo instructores';
      default: return 'Desconocido';
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'public': return '#28a745';
      case 'enrolled': return '#17a2b8';
      case 'instructor': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'all' || 
      (filter === 'course' && !file.task && !file.submission) ||
      (filter === 'task' && file.task) ||
      (filter === 'submission' && file.submission);
    
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="archivos-loading">
        <div className="spinner"></div>
        <p>Cargando archivos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="archivos-error">
        <p>{error}</p>
        <button onClick={fetchFiles} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="archivos-tab">
      <div className="archivos-header">
        <div className="header-top">
          <h3>Archivos del Curso</h3>
          <button 
            onClick={() => setShowUploadForm(true)}
            className="btn-upload-file"
          >
            + Subir Archivo
          </button>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos
            </button>
            <button 
              className={`filter-tab ${filter === 'course' ? 'active' : ''}`}
              onClick={() => setFilter('course')}
            >
              Curso
            </button>
            <button 
              className={`filter-tab ${filter === 'task' ? 'active' : ''}`}
              onClick={() => setFilter('task')}
            >
              Tareas
            </button>
            <button 
              className={`filter-tab ${filter === 'submission' ? 'active' : ''}`}
              onClick={() => setFilter('submission')}
            >
              Entregas
            </button>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="no-files">
          <p>
            {searchTerm ? 
              `No se encontraron archivos que coincidan con "${searchTerm}"` :
              'No hay archivos disponibles en esta categoría.'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowUploadForm(true)}
              className="btn-upload-first-file"
            >
              Subir primer archivo
            </button>
          )}
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-header">
                <div className="file-icon">
                  {getFileIcon(file.name)}
                </div>
                <div className="file-info">
                  <h4 className="file-name" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
                <div className="file-actions-menu">
                  <button className="menu-trigger">⋮</button>
                  <div className="menu-dropdown">
                    <button 
                      onClick={() => handleDownloadFile(file.id, file.name)}
                      className="menu-item"
                    >
                      Descargar
                    </button>
                    {(file.uploaded_by === user?.id || isInstructor) && (
                      <button 
                        onClick={() => handleDeleteFile(file.id)}
                        className="menu-item delete"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {file.description && (
                <p className="file-description">{file.description}</p>
              )}
              
              <div className="file-meta">
                <div className="file-details">
                  <span className="file-uploader">
                    Por: {file.uploaded_by_name || 'Usuario'}
                  </span>
                  <span className="file-date">
                    {formatDate(file.uploaded_at)}
                  </span>
                </div>
                
                <div className="file-badges">
                  <span 
                    className="access-badge"
                    style={{ backgroundColor: getAccessLevelColor(file.access_level) }}
                  >
                    {getAccessLevelText(file.access_level)}
                  </span>
                  
                  {file.task && (
                    <span className="context-badge task-badge">
                      Tarea
                    </span>
                  )}
                  
                  {file.submission && (
                    <span className="context-badge submission-badge">
                      Entrega
                    </span>
                  )}
                </div>
              </div>
              
              <div className="file-stats">
                <span className="download-count">
                  {file.download_count || 0} descargas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para subir archivo */}
      {showUploadForm && (
        <UploadFileForm
          onSubmit={handleUploadFile}
          onCancel={() => setShowUploadForm(false)}
          uploading={uploading}
          isInstructor={isInstructor}
        />
      )}
    </div>
  );
};

// Componente para subir archivos
const UploadFileForm = ({ onSubmit, onCancel, uploading, isInstructor }) => {
  const [formData, setFormData] = useState({
    file: null,
    description: '',
    access_level: 'enrolled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Debes seleccionar un archivo');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', formData.file);
    uploadData.append('description', formData.description);
    uploadData.append('access_level', formData.access_level);

    onSubmit(uploadData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content upload-modal">
        <div className="modal-header">
          <h3>Subir Archivo</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Archivo *</label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="file-input"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar,.txt"
            />
            {formData.file && (
              <div className="file-preview">
                <span className="file-icon">
                  {formData.file.name.split('.').pop().toLowerCase() === 'pdf' ? '📄' : '📁'}
                </span>
                <div className="file-info">
                  <p className="file-name">{formData.file.name}</p>
                  <p className="file-size">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Descripción (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="form-textarea"
              placeholder="Describe el contenido del archivo..."
            />
          </div>
          
          <div className="form-group">
            <label>Nivel de acceso</label>
            <select
              name="access_level"
              value={formData.access_level}
              onChange={handleChange}
              className="form-select"
            >
              <option value="enrolled">Solo estudiantes inscritos</option>
              <option value="public">Público</option>
              {isInstructor && (
                <option value="instructor">Solo instructores</option>
              )}
            </select>
          </div>
        </form>
        
        <div className="modal-footer">
          <button 
            onClick={onCancel} 
            className="btn-cancel"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            className="btn-submit"
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivosTab;
