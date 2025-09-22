import React, { useState, useEffect } from 'react';

const AdminInteractiveCharts = ({
  data,
  type = 'line',
  title,
  height = 300,
  className = ''
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartType, setChartType] = useState(type);

  // Sample data for demonstration
  const sampleData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Cursos Activos',
        data: [65, 78, 90, 81, 95, 102, 115, 120, 135, 142, 158, 165],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      },
      {
        label: 'Nuevos Estudiantes',
        data: [45, 52, 58, 65, 72, 78, 85, 92, 98, 105, 112, 120],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      },
      {
        label: 'Tasa de Completitud',
        data: [78, 82, 85, 88, 90, 92, 94, 95, 96, 97, 98, 99],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true
      }
    ]
  };

  const chartData = data || sampleData;

  const getChartDimensions = () => {
    const padding = 60;
    const width = 600;
    const height = 300;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return { width, height, chartWidth, chartHeight, padding };
  };

  const getScales = () => {
    const allValues = chartData.datasets.flatMap(dataset => dataset.data);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue || 1;

    return {
      x: { min: 0, max: chartData.labels.length - 1 },
      y: { min: minValue, max: maxValue, range }
    };
  };

  const getPointPosition = (valueIndex, datasetIndex) => {
    const { chartWidth, chartHeight, padding } = getChartDimensions();
    const scales = getScales();

    const x = padding + (valueIndex / (chartData.labels.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((chartData.datasets[datasetIndex].data[valueIndex] - scales.y.min) / scales.y.range) * chartHeight;

    return { x, y };
  };

  const handlePointClick = (valueIndex, datasetIndex) => {
    setSelectedDataPoint({ valueIndex, datasetIndex });
  };

  const handlePointHover = (valueIndex, datasetIndex) => {
    setHoveredPoint({ valueIndex, datasetIndex });
  };

  const renderLineChart = () => {
    const { width, height, padding } = getChartDimensions();

    return (
      <svg width={width} height={height} className="border rounded-lg bg-white">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2}
              fill="white" stroke="#e5e7eb" strokeWidth="1"/>

        {Array.from({ length: 6 }).map((_, index) => {
          const scales = getScales();
          const value = scales.y.min + (index / 5) * scales.y.range;
          const y = height - padding - (index / 5) * (height - padding * 2);

          return (
            <g key={index}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth="1"/>
              <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {chartData.datasets.map((dataset, datasetIndex) => (
          <g key={datasetIndex}>
            <polyline
              points={dataset.data.map((_, valueIndex) => {
                const pos = getPointPosition(valueIndex, datasetIndex);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke={dataset.borderColor}
              strokeWidth="2"
              className="hover:stroke-4 transition-all duration-200"
            />

            {dataset.data.map((value, valueIndex) => {
              const pos = getPointPosition(valueIndex, datasetIndex);
              const isSelected = selectedDataPoint?.valueIndex === valueIndex && selectedDataPoint?.datasetIndex === datasetIndex;
              const isHovered = hoveredPoint?.valueIndex === valueIndex && hoveredPoint?.datasetIndex === datasetIndex;

              return (
                <circle
                  key={valueIndex}
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected || isHovered ? 6 : 4}
                  fill={dataset.borderColor}
                  className="cursor-pointer hover:r-8 transition-all duration-200"
                  onClick={() => handlePointClick(valueIndex, datasetIndex)}
                  onMouseEnter={() => handlePointHover(valueIndex, datasetIndex)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </g>
        ))}

        {hoveredPoint && (
          <g>
            <rect x={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).x + 10}
                  y={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).y - 40}
                  width="120" height="35" fill="black" opacity="0.8" rx="5"/>
            <text x={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).x + 15}
                  y={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).y - 25}
                  className="text-xs fill-white">
              {chartData.labels[hoveredPoint.valueIndex]}
            </text>
            <text x={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).x + 15}
                  y={getPointPosition(hoveredPoint.valueIndex, hoveredPoint.datasetIndex).y - 10}
                  className="text-sm fill-white font-medium">
              {chartData.datasets[hoveredPoint.datasetIndex].data[hoveredPoint.valueIndex]}
            </text>
          </g>
        )}
      </svg>
    );
  };

  const renderChart = () => {
    return renderLineChart();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              chartType === 'line' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Líneas
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {renderChart()}
      </div>

      {selectedDataPoint && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Datos Seleccionados</h4>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Período:</span> {chartData.labels[selectedDataPoint.valueIndex]}
            <br />
            <span className="font-medium">{chartData.datasets[selectedDataPoint.datasetIndex].label}:</span> {chartData.datasets[selectedDataPoint.datasetIndex].data[selectedDataPoint.valueIndex]}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInteractiveCharts;