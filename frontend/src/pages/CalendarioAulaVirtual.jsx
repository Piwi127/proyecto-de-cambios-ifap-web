import React, { useState } from 'react';
import Card from '../components/Card';

const CalendarioAulaVirtual = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Datos de ejemplo de actividades
  const activities = [
    {
      id: 1,
      title: 'Sesión en Vivo: Archivística Básica',
      type: 'clase',
      date: '2025-09-16',
      time: '10:00',
      duration: '90 min',
      course: 'Archivística Básica',
      instructor: 'Dra. María González',
      description: 'Clase sobre clasificación documental',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Entrega de Tarea: Análisis Documental',
      type: 'tarea',
      date: '2025-09-18',
      time: '23:59',
      duration: null,
      course: 'Archivística Básica',
      instructor: 'Dra. María González',
      description: 'Análisis de documentos coloniales',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Examen Final',
      type: 'examen',
      date: '2025-09-25',
      time: '14:00',
      duration: '120 min',
      course: 'Archivística Básica',
      instructor: 'Dra. María González',
      description: 'Evaluación final del curso',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Foro: Digitalización Ética',
      type: 'foro',
      date: '2025-09-20',
      time: '18:00',
      duration: '60 min',
      course: 'Gestión Digital de Archivos',
      instructor: 'Ing. Carlos Rodríguez',
      description: 'Discusión sobre ética en digitalización',
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Tarea: Proyecto Final',
      type: 'tarea',
      date: '2025-09-30',
      time: '23:59',
      duration: null,
      course: 'Gestión Digital de Archivos',
      instructor: 'Ing. Carlos Rodríguez',
      description: 'Proyecto de digitalización de archivos',
      status: 'pending'
    }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        activities: []
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayActivities = activities.filter(activity =>
        activity.date === date.toISOString().split('T')[0]
      );

      days.push({
        date,
        isCurrentMonth: true,
        activities: dayActivities
      });
    }

    // Días del mes siguiente
    const remainingCells = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        activities: []
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'clase': return 'bg-blue-500';
      case 'tarea': return 'bg-red-500';
      case 'examen': return 'bg-purple-500';
      case 'foro': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'clase': return '📹';
      case 'tarea': return '📝';
      case 'examen': return '📋';
      case 'foro': return '💬';
      default: return '📅';
    }
  };

  const selectedDateActivities = activities.filter(activity =>
    activity.date === selectedDate.toISOString().split('T')[0]
  );

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Calendario Académico</h1>
        <p className="text-primary-100">Organiza tus actividades y no pierdas ninguna fecha importante</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-3">
          <Card>
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">‹</span>
              </button>

              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">›</span>
              </button>
            </div>

            {/* Vista del calendario */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${
                    day.date.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {day.activities.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className={`text-xs p-1 rounded text-white ${getActivityTypeColor(activity.type)} truncate`}
                        title={activity.title}
                      >
                        {activity.time} {getActivityTypeIcon(activity.type)}
                      </div>
                    ))}
                    {day.activities.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{day.activities.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Actividades del día seleccionado */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>

            {selectedDateActivities.length > 0 ? (
              <div className="space-y-3">
                {selectedDateActivities.map((activity) => (
                  <div key={activity.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getActivityTypeIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{activity.course}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>⏰ {activity.time}</span>
                          {activity.duration && <span>• {activity.duration}</span>}
                        </div>
                        <p className="text-xs text-gray-700 mt-1">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📅</span>
                <p className="text-sm">No hay actividades programadas</p>
              </div>
            )}
          </Card>

          {/* Próximas actividades */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Actividades</h3>
            <div className="space-y-3">
              {activities
                .filter(activity => new Date(activity.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getActivityTypeColor(activity.type)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600">
                        {activity.date} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Leyenda */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Clases en vivo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Tareas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Exámenes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Foros</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarioAulaVirtual;