import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const PerfilEstudiante = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: 'Estudiante de archivística apasionado por la preservación documental.',
    phone: '',
    address: '',
    date_of_birth: '',
    institution: 'Instituto de Formación Archivística del Perú'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el perfil
    console.log('Actualizando perfil:', formData);
    setIsEditing(false);
  };

  const achievements = [
    { id: 1, title: 'Primer Curso Completado', description: 'Archivística Básica', date: '2025-08-15', icon: '🎓' },
    { id: 2, title: 'Participación Activa', description: '10 posts en el foro', date: '2025-09-01', icon: '💬' },
    { id: 3, title: 'Proyecto Destacado', description: 'Análisis de archivos históricos', date: '2025-08-30', icon: '🏆' }
  ];

  const enrolledCourses = [
    { id: 1, title: 'Archivística Básica', progress: 75, status: 'En progreso' },
    { id: 2, title: 'Gestión Digital de Archivos', progress: 45, status: 'En progreso' },
    { id: 3, title: 'Archivos Históricos del Perú', progress: 100, status: 'Completado' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-primary-100">Gestiona tu información personal y académica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500">@{user?.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo de Usuario</label>
                    <p className="text-gray-900">{user?.is_student ? 'Estudiante' : user?.is_instructor ? 'Instructor' : 'Administrador'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="text-gray-900">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Institución</label>
                    <p className="text-gray-900">{formData.institution}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estado</label>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Biografía</label>
                  <p className="text-gray-700">{formData.bio}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cursos Inscritos</span>
                <span className="font-semibold">{enrolledCourses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cursos Completados</span>
                <span className="font-semibold">{enrolledCourses.filter(c => c.progress === 100).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Promedio General</span>
                <span className="font-semibold">
                  {Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Logros Obtenidos</span>
                <span className="font-semibold">{achievements.length}</span>
              </div>
            </div>
          </Card>

          {/* Logros Recientes */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Recientes</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cursos Actuales */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Actuales</h3>
            <div className="space-y-3">
              {enrolledCourses.filter(c => c.progress < 100).map((course) => (
                <div key={course.id} className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">{course.progress}% completado</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerfilEstudiante;