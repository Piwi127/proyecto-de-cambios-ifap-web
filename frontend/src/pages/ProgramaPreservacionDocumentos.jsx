import React from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ProgramaPreservacionDocumentos = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Programa de Preservación de Documentos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 leading-relaxed">
              Técnicas avanzadas para la conservación y restauración de documentos históricos y contemporáneos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🛡️ Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all transform hover:scale-105">
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
                  Conviértete en un especialista en preservación documental. Domina las técnicas
                  más avanzadas para proteger, conservar y restaurar documentos históricos y
                  contemporáneos, garantizando su permanencia para las futuras generaciones.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-red-600 text-xl">✓</span>
                    <span className="text-gray-700">Conservación preventiva de documentos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-600 text-xl">✓</span>
                    <span className="text-gray-700">Técnicas de restauración documental</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-600 text-xl">✓</span>
                    <span className="text-gray-700">Control de plagas y biodeterioro</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-600 text-xl">✓</span>
                    <span className="text-gray-700">Almacenamiento y climatización</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-600 text-xl">✓</span>
                    <span className="text-gray-700">Emergencias y planes de contingencia</span>
                  </li>
                </ul>
              </div>
              <div>
                <VideoPlayer />
              </div>
            </div>

            {/* Información del Programa */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Duración</h3>
                <p className="text-gray-600">100 horas académicas</p>
                <p className="text-sm text-gray-500 mt-2">4 meses de estudio</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modalidad</h3>
                <p className="text-gray-600">Presencial/Virtual</p>
                <p className="text-sm text-gray-500 mt-2">Laboratorios prácticos</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación</h3>
                <p className="text-gray-600">Especialista en Preservación</p>
                <p className="text-sm text-gray-500 mt-2">ISO 9001 certificado</p>
              </div>
            </div>

            {/* Módulos del Programa */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Programa</h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Módulo 1: Fundamentos de Preservación',
                    duration: '20 horas',
                    topics: ['Teoría de la preservación', 'Agentes de deterioro', 'Evaluación de estado', 'Planes de preservación'],
                    professor: 'Dra. Elena Sánchez',
                    schedule: 'Lunes y Miércoles 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 2: Restauración Documental',
                    duration: '25 horas',
                    topics: ['Técnicas de limpieza', 'Reparación de soportes', 'Restauración de tintas', 'Tratamiento de manchas'],
                    professor: 'Lic. Mario Fernández',
                    schedule: 'Martes y Jueves 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 3: Control Ambiental',
                    duration: '18 horas',
                    topics: ['Climatización de archivos', 'Control de humedad', 'Iluminación adecuada', 'Sistemas de ventilación'],
                    professor: 'Ing. Silvia Gutiérrez',
                    schedule: 'Viernes 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 4: Control de Plagas y Biodeterioro',
                    duration: '22 horas',
                    topics: ['Identificación de plagas', 'Métodos de control', 'Prevención de infestaciones', 'Monitoreo continuo'],
                    professor: 'Dr. Carlos Mendoza',
                    schedule: 'Sábados 9:00 AM - 1:00 PM'
                  },
                  {
                    title: 'Módulo 5: Gestión de Emergencias',
                    duration: '15 horas',
                    topics: ['Planes de contingencia', 'Respuesta a desastres', 'Recuperación post-emergencia', 'Seguros y coberturas'],
                    professor: 'Equipo docente',
                    schedule: 'Sábados 2:00 PM - 6:00 PM'
                  }
                ].map((module, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{module.title}</h3>
                      <span className="text-red-600 font-semibold">{module.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Temas principales:</h4>
                        <ul className="space-y-1">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-gray-600 text-sm flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
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
                    name: 'Dra. Elena Sánchez',
                    specialty: 'Conservación Preventiva',
                    experience: '16 años de experiencia',
                    image: '👩‍🔬'
                  },
                  {
                    name: 'Lic. Mario Fernández',
                    specialty: 'Restauración Documental',
                    experience: '14 años de experiencia',
                    image: '👨‍🎨'
                  },
                  {
                    name: 'Ing. Silvia Gutiérrez',
                    specialty: 'Control Ambiental',
                    experience: '12 años de experiencia',
                    image: '👩‍💼'
                  },
                  {
                    name: 'Dr. Carlos Mendoza',
                    specialty: 'Biodeterioro y Plagas',
                    experience: '18 años de experiencia',
                    image: '👨‍⚕️'
                  }
                ].map((teacher, index) => (
                  <div key={index} className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {teacher.image}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
                    <p className="text-red-600 font-medium mb-1">{teacher.specialty}</p>
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
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Título en Archivística o áreas afines
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Conocimientos básicos de química
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Interés en trabajo de laboratorio
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Disponibilidad para prácticas intensivas
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Beneficios del Programa</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Laboratorio equipado con tecnología avanzada
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Prácticas en archivos históricos reales
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Certificación internacional reconocida
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Oportunidades de consultoría especializada
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Llamado a Acción */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger el patrimonio documental?</h2>
          <p className="text-xl mb-8 text-red-100">Únete a nuestro programa y conviértete en un especialista en preservación documental</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login', { state: { showRegister: true } })}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Inscribirme Ahora
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all transform hover:scale-105">
              📞 Contactar Asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramaPreservacionDocumentos;