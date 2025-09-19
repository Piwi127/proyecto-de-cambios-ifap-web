import React from 'react';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ArchivisticaBasica = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Archivística Básica
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
              Fundamentos esenciales para la gestión y organización de archivos documentales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                📚 Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105">
                📋 Ver Programa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Información del Curso */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Qué aprenderás?</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Este curso te proporciona los conocimientos fundamentales de la archivística,
                  desde los conceptos básicos hasta las técnicas prácticas de organización y
                  gestión documental. Ideal para principiantes que desean iniciar una carrera
                  en el campo de los archivos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Conceptos básicos de archivística</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Clasificación y organización documental</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Técnicas de descripción archivística</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Normativas y estándares internacionales</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Información del Curso</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Duración:</span>
                    <span className="text-gray-600">120 horas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Modalidad:</span>
                    <span className="text-gray-600">Presencial/Virtual</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Nivel:</span>
                    <span className="text-gray-600">Básico</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certificación:</span>
                    <span className="text-gray-600">Oficial MINEDU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Inversión:</span>
                    <span className="text-primary-600 font-bold">S/ 1,200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Carrusel de Imágenes */}
            <MiniCarousel
              title="Galería Archivística Básica"
              images={[
                {
                  src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Archivo histórico - Formación archivística',
                  title: 'Fundamentos de Archivística'
                },
                {
                  src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Biblioteca y archivos',
                  title: 'Organización Documental'
                },
                {
                  src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Investigación histórica',
                  title: 'Técnicas de Investigación'
                }
              ]}
            />

            {/* Video del Curso */}
            <VideoPlayer
              title="Introducción al Curso de Archivística Básica"
              description="Conoce los fundamentos de la archivística y las técnicas básicas de gestión documental en este video introductorio."
              poster="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            />

            {/* Módulos del Curso */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Curso</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 1: Introducción a la Archivística</h3>
                  <p className="text-gray-600">Conceptos fundamentales, historia y evolución de la archivística moderna.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 2: Organización Documental</h3>
                  <p className="text-gray-600">Técnicas de clasificación, ordenación y descripción de documentos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏷️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 3: Sistemas de Referencia</h3>
                  <p className="text-gray-600">Creación de inventarios, catálogos y sistemas de referencia eficientes.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 4: Normativas y Estándares</h3>
                  <p className="text-gray-600">Marco legal peruano e internacional para la gestión archivística.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 5: Acceso y Consulta</h3>
                  <p className="text-gray-600">Políticas de acceso, protección de datos y servicio al usuario.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">💼</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 6: Práctica Profesional</h3>
                  <p className="text-gray-600">Aplicación práctica en casos reales y elaboración de proyecto final.</p>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Equipo Docente</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      DR
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dra. María Rodríguez</h3>
                      <p className="text-primary-600">Directora Académica</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Doctora en Archivística con 15 años de experiencia en instituciones públicas y privadas del Perú.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      LC
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Lic. Carlos Mendoza</h3>
                      <p className="text-primary-600">Especialista en Gestión Documental</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Especialista en sistemas de gestión documental con experiencia internacional en archivística moderna.</p>
                </div>
              </div>
            </div>

            {/* Llamado a Acción */}
            <div className="text-center bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu carrera en archivística?</h2>
              <p className="text-xl mb-6 text-primary-100">Únete a nuestros estudiantes y forma parte del futuro de la gestión documental en el Perú</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  🚀 Inscribirme Ahora
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105">
                  📞 Contactar Asesor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArchivisticaBasica;