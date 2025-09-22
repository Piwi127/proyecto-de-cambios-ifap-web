import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  BookOpen,
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Zap,
  Clock,
  Star
} from 'lucide-react';
import Card from '../../components/Card';
import reportsService from '../../services/reportsService';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('enrollments');
  const [showPredictions, setShowPredictions] = useState(true);
  const [cohortData, setCohortData] = useState(null);
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedMetric]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [
        trendAnalysis,
        cohortAnalysis,
        predictions
      ] = await Promise.all([
        reportsService.getTrendAnalysis(timeRange, selectedMetric),
        reportsService.getCohortAnalysis('monthly', '12m'),
        showPredictions ? reportsService.getPredictions(selectedMetric, timeRange) : Promise.resolve(null)
      ]);

      setTrendData(trendAnalysis);
      setCohortData(cohortAnalysis);
      setAnalytics({
        trends: trendAnalysis,
        cohorts: cohortAnalysis,
        predictions: predictions,
        insights: generateInsights(trendAnalysis, cohortAnalysis, predictions)
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (trends, cohorts, predictions) => {
    const insights = [];

    // Análisis de tendencias
    if (trends?.trend_direction === 'up') {
      insights.push({
        type: 'positive',
        title: 'Tendencia Positiva',
        description: `${selectedMetric} ha aumentado un ${trends.growth_rate}% en el período seleccionado`,
        icon: TrendingUp,
        color: 'green'
      });
    } else if (trends?.trend_direction === 'down') {
      insights.push({
        type: 'negative',
        title: 'Tendencia Descendente',
        description: `${selectedMetric} ha disminuido un ${Math.abs(trends.growth_rate)}% en el período seleccionado`,
        icon: TrendingDown,
        color: 'red'
      });
    }

    // Análisis de cohortes
    if (cohorts?.retention_rate) {
      if (cohorts.retention_rate > 70) {
        insights.push({
          type: 'positive',
          title: 'Excelente Retención',
          description: `La tasa de retención es del ${cohorts.retention_rate}%, superior al promedio de la industria`,
          icon: Award,
          color: 'green'
        });
      } else if (cohorts.retention_rate < 40) {
        insights.push({
          type: 'warning',
          title: 'Retención Baja',
          description: `La tasa de retención del ${cohorts.retention_rate}% requiere atención inmediata`,
          icon: Target,
          color: 'yellow'
        });
      }
    }

    // Predicciones
    if (predictions?.forecast) {
      insights.push({
        type: 'info',
        title: 'Predicción',
        description: `Se proyecta un ${predictions.forecast > 0 ? 'aumento' : 'descenso'} del ${Math.abs(predictions.forecast)}% para el próximo período`,
        icon: Brain,
        color: 'blue'
      });
    }

    return insights;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInsightIcon = (insight) => {
    const IconComponent = insight.icon;
    const colorClasses = {
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600'
    };
    return <IconComponent className={`w-5 h-5 ${colorClasses[insight.color]}`} />;
  };

  const SimpleLineChart = ({ data, title, color = 'blue' }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data?.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.value));
          const percentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 truncate">
                {item.period}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`bg-${color}-600 h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm font-medium text-gray-900 text-right">
                {formatNumber(item.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CohortHeatmap = ({ data }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Cohortes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider p-2">
                Cohorte
              </th>
              {data?.periods?.map((period, index) => (
                <th key={index} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider p-2">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.cohorts?.map((cohort, cohortIndex) => (
              <tr key={cohortIndex}>
                <td className="text-sm font-medium text-gray-900 p-2">
                  {cohort.name}
                </td>
                {cohort.retention?.map((rate, periodIndex) => (
                  <td key={periodIndex} className="p-2">
                    <div
                      className={`text-center text-xs font-medium rounded px-2 py-1 ${
                        rate >= 70 ? 'bg-green-100 text-green-800' :
                        rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {rate ? `${rate}%` : '-'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando análisis avanzado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              Análisis Avanzado
            </h1>
            <p className="text-purple-100">Análisis predictivo, tendencias y patrones de comportamiento</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              {showPredictions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={loadAnalytics}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Métrica:</span>
            </div>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="enrollments">Inscripciones</option>
              <option value="completions">Finalizaciones</option>
              <option value="users">Usuarios Activos</option>
              <option value="revenue">Ingresos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      {analytics?.insights && analytics.insights.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            Insights Clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
              Análisis de Tendencias
            </h2>
            {trendData?.trend_direction && getTrendIcon(trendData.trend_direction)}
          </div>
          
          {trendData?.data && (
            <SimpleLineChart
              data={trendData.data}
              title={`Tendencia de ${selectedMetric}`}
              color="blue"
            />
          )}

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {formatPercentage(trendData?.growth_rate || 0)}
              </div>
              <div className="text-sm text-blue-600">Tasa de Crecimiento</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {trendData?.confidence_level || 0}%
              </div>
              <div className="text-sm text-green-600">Nivel de Confianza</div>
            </div>
          </div>
        </Card>

        {/* Predictions */}
        {showPredictions && analytics?.predictions && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-500" />
              Predicciones
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-700">Próximo Período</span>
                  <span className="text-lg font-bold text-purple-900">
                    {analytics.predictions.forecast > 0 ? '+' : ''}
                    {formatPercentage(analytics.predictions.forecast)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(Math.abs(analytics.predictions.forecast), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(analytics.predictions.predicted_value || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Valor Predicho</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    ±{formatNumber(analytics.predictions.margin_error || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Margen de Error</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                * Las predicciones se basan en datos históricos y pueden variar según factores externos
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Cohort Analysis */}
      {cohortData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-green-500" />
              Análisis de Cohortes
            </h2>
            <div className="text-sm text-gray-600">
              Retención promedio: {formatPercentage(cohortData.retention_rate || 0)}
            </div>
          </div>
          
          <CohortHeatmap data={cohortData} />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-900">
                {formatPercentage(cohortData.best_cohort_retention || 0)}
              </div>
              <div className="text-sm text-green-600">Mejor Cohorte</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-900">
                {formatPercentage(cohortData.avg_retention || 0)}
              </div>
              <div className="text-sm text-yellow-600">Retención Promedio</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-900">
                {formatPercentage(cohortData.worst_cohort_retention || 0)}
              </div>
              <div className="text-sm text-red-600">Peor Cohorte</div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efectividad de Cursos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analytics?.course_effectiveness || 78.5)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfacción Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.avg_satisfaction || 4.2}/5
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.avg_completion_time || 45}h
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Educativo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analytics?.educational_roi || 156)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Exportar Análisis</h3>
            <p className="text-sm text-gray-600">
              Descarga reportes detallados con todos los análisis y predicciones
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 inline mr-1" />
              Reporte Completo
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4 inline mr-1" />
              Solo Predicciones
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;