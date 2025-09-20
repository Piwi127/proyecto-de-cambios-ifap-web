import React from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ProgramaGestionDigital = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Programa de Gestión Digital
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 leading-relaxed">
              Tecnologías modernas para la digitalización y preservación digital de documentos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                💻 Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105">
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
                  Conviértete en un experto en gestión digital de archivos. Domina las tecnologías
                  más avanzadas para la digitalización, preservación y gestión de documentos en
                  entornos digitales modernos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700">Tecnologías de digitalización avanzada</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700">Sistemas de gestión documental digital</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700">Preservación digital a largo plazo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700">Metadatos y estándares digitales</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700">Seguridad y backup de información</span>
                  </li>
                </ul>
              </div>
              <div>
                <VideoPlayer />
              </div>
            </div>

            {/* Información del Programa */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Duración</h3>
                <p className="text-gray-600">80 horas académicas</p>
                <p className="text-sm text-gray-500 mt-2">3 meses de estudio</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modalidad</h3>
                <p className="text-gray-600">100% Virtual</p>
                <p className="text-sm text-gray-500 mt-2">Plataforma online</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación</h3>
                <p className="text-gray-600">Certificado Digital</p>
                <p className="text-sm text-gray-500 mt-2">Blockchain verificable</p>
              </div>
            </div>

            {/* Módulos del Programa */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Programa</h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Módulo 1: Fundamentos de Digitalización',
                    duration: '16 horas',
                    topics: ['Equipos de digitalización', 'Calidad de imagen', 'Formatos digitales', 'OCR y reconocimiento óptico'],
                    professor: 'Ing. Laura Torres',
                    schedule: 'Lunes y Miércoles 7:00 PM - 9:00 PM'
                  },
                  {
                    title: 'Módulo 2: Sistemas de Gestión Documental',
                    duration: '20 horas',
                    topics: ['DMS y EDM', 'Workflow digital', 'Automatización de procesos', 'Integración de sistemas'],
                    professor: 'Dr. Miguel Ángel Ruiz',
                    schedule: 'Martes y Jueves 7:00 PM - 9:00 PM'
                  },
                  {
                    title: 'Módulo 3: Preservación Digital',
                    duration: '18 horas',
                    topics: ['Estrategias de preservación', 'Migración de formatos', 'Almacenamiento a largo plazo', 'Auditoría digital'],
                    professor: 'Dra. Patricia Vargas',
                    schedule: 'Viernes 6:00 PM - 10:00 PM'
                  },
                  {
                    title: 'Módulo 4: Metadatos y Estándares',
                    duration: '14 horas',
                    topics: ['Estándares Dublin Core', 'METS y PREMIS', 'Linked Data', 'Ontologías documentales'],
                    professor: 'Dr. Javier Mendoza',
                    schedule: 'Sábados 9:00 AM - 1:00 PM'
                  },
                  {
                    title: 'Módulo 5: Proyecto Final Digital',
                    duration: '12 horas',
                    topics: ['Implementación de sistema', 'Caso de estudio real', 'Presentación de resultados', 'Evaluación final'],
                    professor: 'Equipo docente',
                    schedule: 'Sábados 2:00 PM - 6:00 PM'
                  }
                ].map((module, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">{module.title}</h3>
                      <span className="text-green-600 font-semibold">{module.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Temas principales:</h4>
                        <ul className="space-y-1">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-gray-600 text-sm flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
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
                    name: 'Ing. Laura Torres',
                    specialty: 'Digitalización y OCR',
                    experience: '8 años de experiencia',
                    image: '👩‍💻'
                  },
                  {
                    name: 'Dr. Miguel Ángel Ruiz',
                    specialty: 'Sistemas de Información',
                    experience: '15 años de experiencia',
                    image: '👨‍💼'
                  },
                  {
                    name: 'Dra. Patricia Vargas',
                    specialty: 'Preservación Digital',
                    experience: '12 años de experiencia',
                    image: '👩‍🔬'
                  },
                  {
                    name: 'Dr. Javier Mendoza',
                    specialty: 'Metadatos y Linked Data',
                    experience: '10 años de experiencia',
                    image: '👨‍🏫'
                  }
                ].map((teacher, index) => (
                  <div key={index} className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      {teacher.image}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
                    <p className="text-green-600 font-medium mb-1">{teacher.specialty}</p>
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
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Conocimientos básicos de computación
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Acceso a computadora con internet
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Interés en tecnologías digitales
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Disponibilidad para clases virtuales
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Beneficios del Programa</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Certificación digital verificable
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Acceso a herramientas profesionales
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Comunidad de profesionales digitales
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Actualizaciones tecnológicas continuas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Llamado a Acción */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para liderar la transformación digital?</h2>
          <p className="text-xl mb-8 text-green-100">Únete a nuestro programa y conviértete en un experto en gestión digital de archivos</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login', { state: { showRegister: true } })}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Inscribirme Ahora
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105">
              📞 Contactar Asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramaGestionDigital;