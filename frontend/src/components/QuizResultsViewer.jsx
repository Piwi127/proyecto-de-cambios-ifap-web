import React, { useCallback, useEffect, useState } from 'react';
import { quizService } from '../services/quizService.js';
import Card from '../components/Card';

const QuizResultsViewer = ({ quizId, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const resultsData = await quizService.getQuizResults(quizId);
      setResults(resultsData);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    if (filter === 'passed') return result.is_passed;
    if (filter === 'failed') return !result.is_passed;
    return true;
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (result) => {
    if (result.is_passed) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Aprobado</span>;
    }
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Reprobado</span>;
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

  const calculateStats = () => {
    const total = results.length;
    const passed = results.filter(r => r.is_passed).length;
    const failed = total - passed;
    const avgScore = total > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / total : 0;

    return { total, passed, failed, avgScore: avgScore.toFixed(1) };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>Cargando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Resultados del Quiz</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Intentos</p>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              <p className="text-sm text-gray-600">Aprobados</p>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-sm text-gray-600">Reprobados</p>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgScore}%</div>
              <p className="text-sm text-gray-600">Promedio</p>
            </Card>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'passed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Aprobados ({stats.passed})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Reprobados ({stats.failed})
              </button>
            </div>
          </div>

          {/* Lista de resultados */}
          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <Card key={result.id}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          Intento #{result.attempt_number}
                        </span>
                        {getStatusBadge(result)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.percentage)}`}>
                          {result.percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Estudiante:</span><br />
                          {result.user_details?.first_name} {result.user_details?.last_name}
                        </div>
                        <div>
                          <span className="font-medium">Puntuación:</span><br />
                          {result.score}/{result.max_score} pts
                        </div>
                        <div>
                          <span className="font-medium">Tiempo:</span><br />
                          {result.time_taken_seconds ? `${Math.floor(result.time_taken_seconds / 60)}:${(result.time_taken_seconds % 60).toString().padStart(2, '0')}` : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span><br />
                          {formatDate(result.completed_at)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4">
                      <button
                        onClick={() => console.log('Ver detalles del intento:', result.id)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resultados</h3>
                <p className="text-gray-600">
                  {filter === 'all'
                    ? 'Aún no hay intentos para este quiz'
                    : `No hay intentos ${filter === 'passed' ? 'aprobados' : 'reprobados'}`
                  }
                </p>
              </Card>
            )}
          </div>

          {/* Botón de exportar */}
          {results.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => console.log('Exportar resultados')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📥 Exportar Resultados (Excel)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultsViewer;
