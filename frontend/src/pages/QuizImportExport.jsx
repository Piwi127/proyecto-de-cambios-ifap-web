import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card';
import { quizService } from '../services/quizService.js';
import { courseService } from '../services/courseService.js';

const QuizImportExport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Datos de ejemplo para quizzes disponibles
  React.useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [quizzesData, coursesData] = await Promise.all([
        quizService.getAllQuizzes(),
        courseService.getMyCourses()
      ]);
      const quizzesList = Array.isArray(quizzesData?.results) ? quizzesData.results : quizzesData;
      const coursesList = Array.isArray(coursesData?.results) ? coursesData.results : coursesData;
      setAvailableQuizzes(Array.isArray(quizzesList) ? quizzesList : []);
      setCourses(Array.isArray(coursesList) ? coursesList : []);
    } catch (error) {
      console.error('Error loading import/export data:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleImport = async (file) => {
    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text, file.name);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

      if (!data.course) {
        if (!selectedCourse) {
          throw new Error('Selecciona un curso para importar el quiz');
        }
        data.course = Number(selectedCourse);
      }

      // Validar estructura del archivo
      await quizService.validateImportData(data);
      const createdQuiz = await quizService.importQuiz(data);

      setImportResults({
        success: true,
        message: `Importación completada exitosamente`,
        imported: 1,
        skipped: 0,
        errors: []
      });

      if (createdQuiz) {
        await loadInitialData();
      }

    } catch (error) {
      setImportResults({
        success: false,
        message: 'Error al procesar el archivo',
        errors: [error.message]
      });
    } finally {
      setImporting(false);
    }
  };

  const parseCSV = (csvText, filename) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).filter(line => line.trim().length > 0).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = (values[index] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });

    const questionsMap = new Map();
    rows.forEach(row => {
      const key = row.question_text || row.question;
      if (!key) return;
      if (!questionsMap.has(key)) {
        questionsMap.set(key, {
          question_text: key,
          question_type: row.question_type || 'multiple_choice',
          points: Number(row.points || 1),
          order: Number(row.order || questionsMap.size + 1),
          explanation: row.explanation || '',
          options: []
        });
      }
      if (row.option_text) {
        questionsMap.get(key).options.push({
          option_text: row.option_text,
          is_correct: String(row.is_correct).toLowerCase() === 'true',
          order: Number(row.option_order || questionsMap.get(key).options.length + 1)
        });
      }
    });

    return {
      title: filename.replace(/\.(csv|json)$/i, ''),
      description: '',
      course: selectedCourse ? Number(selectedCourse) : null,
      questions: Array.from(questionsMap.values())
    };
  };

  const handleExport = async () => {
    if (selectedQuizzes.length === 0) {
      alert('Selecciona al menos un quiz para exportar');
      return;
    }

    setExporting(true);

    try {
      const blobData = await quizService.bulkExportQuizzes(selectedQuizzes, selectedFormat);
      const filename = `quizzes_export_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      const blob = new Blob([blobData], { type: selectedFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Exportación completada: ${filename}`);

    } catch (error) {
      console.error('Error exporting quizzes:', error);
      alert('Error al exportar los quizzes');
    } finally {
      setExporting(false);
    }
  };

  const handleQuizSelection = (quizId) => {
    setSelectedQuizzes(prev =>
      prev.includes(quizId)
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  const selectAllQuizzes = () => {
    setSelectedQuizzes(availableQuizzes.map(quiz => quiz.id));
  };

  const clearSelection = () => {
    setSelectedQuizzes([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Importar/Exportar Quizzes</h1>
            <p className="text-green-100">Gestiona la migración de contenido de evaluaciones</p>
          </div>
          <button
            onClick={() => navigate('/aula-virtual/quizzes')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ← Quizzes
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <span onClick={() => navigate('/aula-virtual/quizzes')} className="cursor-pointer hover:text-primary-600">Quizzes</span>
        <span className="mx-2">/</span>
        <span className="text-primary-600 font-medium">Importar/Exportar</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Importación */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Importar Quizzes</h2>
              <p className="text-gray-600 text-sm">
                Sube un archivo JSON o CSV con la estructura de quizzes para importarlos al sistema
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso de destino
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Necesario para crear el quiz importado.
              </p>
            </div>

            {/* Área de drop y selección de archivo */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-gray-400 mb-4">
                <span className="text-6xl">📁</span>
              </div>
              <p className="text-gray-700 font-medium mb-2">
                {importing ? 'Procesando archivo...' : 'Haz clic para seleccionar archivo'}
              </p>
              <p className="text-gray-500 text-sm">
                Soporta archivos JSON y CSV
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Resultados de importación */}
            {importResults && (
              <div className={`p-4 rounded-lg ${
                importResults.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  <span className={`text-lg mr-2 ${
                    importResults.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {importResults.success ? '✅' : '❌'}
                  </span>
                  <h3 className={`font-medium ${
                    importResults.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importResults.message}
                  </h3>
                </div>

                {importResults.imported !== undefined && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✅ Importados: {importResults.imported}</p>
                    {importResults.skipped > 0 && (
                      <p>⚠️ Omitidos: {importResults.skipped}</p>
                    )}
                  </div>
                )}

                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-800 mb-2">Errores:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Información sobre formatos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Formatos soportados:</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>
                  <strong>JSON:</strong> Estructura completa con preguntas, opciones y respuestas
                </div>
                <div>
                  <strong>CSV:</strong> Formato tabular para migraciones simples
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sección de Exportación */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Exportar Quizzes</h2>
              <p className="text-gray-600 text-sm">
                Selecciona los quizzes que deseas exportar y elige el formato
              </p>
            </div>

            {/* Selector de formato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de exportación
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="json">JSON (Completo)</option>
                <option value="csv">CSV (Simple)</option>
              </select>
            </div>

            {/* Lista de quizzes para exportar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Seleccionar Quizzes ({selectedQuizzes.length} de {availableQuizzes.length})
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllQuizzes}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {availableQuizzes.map(quiz => (
                  <div
                    key={quiz.id}
                    className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedQuizzes.includes(quiz.id)}
                      onChange={() => handleQuizSelection(quiz.id)}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{quiz.title}</p>
                      <p className="text-sm text-gray-600">{quiz.course} • {quiz.questions} preguntas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de exportación */}
            <button
              onClick={handleExport}
              disabled={selectedQuizzes.length === 0 || exporting}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {exporting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </div>
              ) : (
                `Exportar ${selectedQuizzes.length} Quiz${selectedQuizzes.length !== 1 ? 'zes' : ''}`
              )}
            </button>
          </div>
        </Card>
      </div>

      {/* Información adicional */}
      <Card variant="info" className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Información importante</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los archivos importados deben seguir la estructura correcta para evitar errores</li>
              <li>• Las respuestas correctas se mantendrán confidenciales durante la exportación</li>
              <li>• Puedes importar/exportar múltiples quizzes en un solo archivo</li>
              <li>• Se recomienda hacer una copia de seguridad antes de importar datos</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizImportExport;
