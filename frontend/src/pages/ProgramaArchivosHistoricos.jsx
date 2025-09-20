import React from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ProgramaArchivosHistoricos = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Programa de Archivos Históricos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 leading-relaxed">
              Estudio especializado de los archivos coloniales, republicanos y contemporáneos del Perú
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🏛️ Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105">
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
                  Sumérgete en la fascinante historia documental del Perú. Aprende a investigar,
                  analizar y preservar los archivos históricos que cuentan la historia de nuestra
                  nación desde la época colonial hasta la contemporánea.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-700">Historia de los archivos peruanos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-700">Análisis paleográfico y diplomático</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-700">Investigación histórica documental</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-700">Preservación de documentos antiguos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-700">Métodos de datación y autenticación</span>
                  </li>
                </ul>
              </div>
              <div>
                <VideoPlayer />
              </div>
            </div>

            {/* Información del Programa */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Duración</h3>
                <p className="text-gray-600">150 horas académicas</p>
                <p className="text-sm text-gray-500 mt-2">5 meses de estudio</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modalidad</h3>
                <p className="text-gray-600">Presencial</p>
                <p className="text-sm text-gray-500 mt-2">Con visitas a archivos</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación</h3>
                <p className="text-gray-600">Diploma Especializado</p>
                <p className="text-sm text-gray-500 mt-2">Investigador Histórico</p>
              </div>
            </div>

            {/* Módulos del Programa */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Programa</h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Módulo 1: Historia Archivística Peruana',
                    duration: '30 horas',
                    topics: ['Archivos coloniales', 'Período republicano', 'Siglo XX', 'Archivos contemporáneos'],
                    professor: 'Dr. Fernando Castillo',
                    schedule: 'Lunes y Miércoles 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 2: Paleografía y Diplomática',
                    duration: '35 horas',
                    topics: ['Lectura de documentos antiguos', 'Análisis diplomático', 'Caligrafía histórica', 'Símbolos y sellos'],
                    professor: 'Dra. Isabel Morales',
                    schedule: 'Martes y Jueves 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 3: Metodología de Investigación',
                    duration: '28 horas',
                    topics: ['Fuentes documentales', 'Técnicas de investigación', 'Análisis crítico', 'Redacción histórica'],
                    professor: 'Dr. Roberto Álvarez',
                    schedule: 'Viernes 6:00 PM - 8:00 PM'
                  },
                  {
                    title: 'Módulo 4: Preservación de Archivos Históricos',
                    duration: '32 horas',
                    topics: ['Conservación preventiva', 'Restauración básica', 'Almacenamiento histórico', 'Digitalización de antiguos'],
                    professor: 'Lic. Carmen Díaz',
                    schedule: 'Sábados 9:00 AM - 1:00 PM'
                  },
                  {
                    title: 'Módulo 5: Proyecto de Investigación',
                    duration: '25 horas',
                    topics: ['Tema de investigación', 'Recopilación de fuentes', 'Análisis documental', 'Presentación final'],
                    professor: 'Equipo docente',
                    schedule: 'Sábados 2:00 PM - 6:00 PM'
                  }
                ].map((module, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{module.title}</h3>
                      <span className="text-purple-600 font-semibold">{module.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Temas principales:</h4>
                        <ul className="space-y-1">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-gray-600 text-sm flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
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
                    name: 'Dr. Fernando Castillo',
                    specialty: 'Historia Colonial Peruana',
                    experience: '20 años de experiencia',
                    image: '👨‍🏫'
                  },
                  {
                    name: 'Dra. Isabel Morales',
                    specialty: 'Paleografía Hispana',
                    experience: '18 años de experiencia',
                    image: '👩‍🎓'
                  },
                  {
                    name: 'Dr. Roberto Álvarez',
                    specialty: 'Historiografía Peruana',
                    experience: '25 años de experiencia',
                    image: '👨‍💼'
                  },
                  {
                    name: 'Lic. Carmen Díaz',
                    specialty: 'Conservación Documental',
                    experience: '15 años de experiencia',
                    image: '👩‍🔬'
                  }
                ].map((teacher, index) => (
                  <div key={index} className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {teacher.image}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
                    <p className="text-purple-600 font-medium mb-1">{teacher.specialty}</p>
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
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Título universitario en Historia o afines
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Conocimientos básicos de archivística
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Interés en investigación histórica
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Disponibilidad para trabajo de campo
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Beneficios del Programa</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Acceso a archivos históricos exclusivos
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Publicaciones en revistas especializadas
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Red de investigadores históricos
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Oportunidades de investigación financiadas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Llamado a Acción */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para explorar la historia documental del Perú?</h2>
          <p className="text-xl mb-8 text-purple-100">Únete a nuestro programa y conviértete en un especialista en archivos históricos</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login', { state: { showRegister: true } })}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Inscribirme Ahora
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105">
              📞 Contactar Asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramaArchivosHistoricos;