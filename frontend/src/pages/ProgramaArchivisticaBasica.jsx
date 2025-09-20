import React from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ProgramaArchivisticaBasica = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Programa de Archivística Básica
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Fundamentos esenciales para la gestión y organización de archivos documentales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                📚 Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
                📋 Descargar Programa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Información del Programa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Qué aprenderás?</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Domina los fundamentos esenciales de la archivística moderna. Aprende las técnicas
                  y metodologías necesarias para organizar, clasificar y gestionar archivos de manera
                  profesional y eficiente.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-700">Principios fundamentales de la archivística</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-700">Sistemas de clasificación documental</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-700">Organización y descripción de archivos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-700">Normativas y estándares archivísticos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-700">Prácticas profesionales en archivística</span>
                  </li>
                </ul>
              </div>
              <div>
                <VideoPlayer />
              </div>
            </div>

            {/* Información del Programa */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Duración</h3>
                <p className="text-gray-600">120 horas académicas</p>
                <p className="text-sm text-gray-500 mt-2">4 meses de estudio</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modalidad</h3>
                <p className="text-gray-600">Presencial / Virtual</p>
                <p className="text-sm text-gray-500 mt-2">Clases híbridas</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación</h3>
                <p className="text-gray-600">Certificado Oficial</p>
                <p className="text-sm text-gray-500 mt-2">Reconocido por el MINEDU</p>
              </div>
            </div>

            {/* Módulos del Programa */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Programa</h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Módulo 1: Introducción a la Archivística',
                    duration: '24 horas',
                    topics: ['Historia de la archivística', 'Conceptos básicos', 'Tipos de archivos', 'Importancia social de los archivos'],
                    professor: 'Dra. María González',
                    schedule: 'Lunes y Miércoles 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 2: Organización Documental',
                    duration: '28 horas',
                    topics: ['Sistemas de clasificación', 'Descripción archivística', 'Control de calidad', 'Metadatos básicos'],
                    professor: 'Dr. Carlos Rodríguez',
                    schedule: 'Martes y Jueves 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 3: Gestión de Archivos',
                    duration: '32 horas',
                    topics: ['Transferencia documental', 'Valoración archivística', 'Eliminación de documentos', 'Preservación básica'],
                    professor: 'Lic. Ana Martínez',
                    schedule: 'Sábados 9:00 AM - 1:00 PM'
                  },
                  {
                    title: 'Módulo 4: Normativas y Ética Profesional',
                    duration: '20 horas',
                    topics: ['Marco legal peruano', 'Estándares internacionales', 'Ética archivística', 'Derechos de acceso'],
                    professor: 'Dr. Roberto Silva',
                    schedule: 'Viernes 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 5: Práctica Profesional',
                    duration: '16 horas',
                    topics: ['Proyecto final', 'Visitas técnicas', 'Simulaciones prácticas', 'Evaluación final'],
                    professor: 'Equipo docente',
                    schedule: 'Sábados 2:00 PM - 6:00 PM'
                  }
                ].map((module, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{module.title}</h3>
                      <span className="text-blue-600 font-semibold">{module.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Temas principales:</h4>
                        <ul className="space-y-1">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-gray-600 text-sm flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900">Docente:</h4>
                          <p className="text-gray-600">{module.professor}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Horario:</h4>
                          <p className="text-gray-600">{module.schedule}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipo Docente */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Equipo Docente</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    name: 'Dra. María González',
                    specialty: 'Historia de la Archivística',
                    experience: '15 años de experiencia',
                    image: '👩‍🏫'
                  },
                  {
                    name: 'Dr. Carlos Rodríguez',
                    specialty: 'Sistemas de Información',
                    experience: '12 años de experiencia',
                    image: '👨‍🏫'
                  },
                  {
                    name: 'Lic. Ana Martínez',
                    specialty: 'Preservación Documental',
                    experience: '10 años de experiencia',
                    image: '👩‍💼'
                  },
                  {
                    name: 'Dr. Roberto Silva',
                    specialty: 'Derecho Archivístico',
                    experience: '18 años de experiencia',
                    image: '👨‍⚖️'
                  }
                ].map((teacher, index) => (
                  <div key={index} className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {teacher.image}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
                    <p className="text-blue-600 font-medium mb-1">{teacher.specialty}</p>
                    <p className="text-gray-600 text-sm">{teacher.experience}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Requisitos de Ingreso</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Educación secundaria completa
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Conocimientos básicos de computación
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Interés en la gestión documental
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Disponibilidad horaria para clases
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Beneficios del Programa</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Certificación oficial reconocida
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Prácticas profesionales supervisadas
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Acceso a red de contactos profesionales
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Material didáctico actualizado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Llamado a Acción */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu carrera en archivística?</h2>
          <p className="text-xl mb-8 text-blue-100">Únete a nuestro programa y conviértete en un profesional calificado en gestión documental</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login', { state: { showRegister: true } })}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Inscribirme Ahora
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
              📞 Contactar Asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramaArchivisticaBasica;