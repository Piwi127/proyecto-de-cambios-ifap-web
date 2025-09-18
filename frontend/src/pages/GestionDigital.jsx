import React from 'react';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const GestionDigital = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Gestión Digital de Archivos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-secondary-100 leading-relaxed">
              Tecnologías modernas para la digitalización y preservación digital de documentos históricos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                💻 Inscribirme Ahora
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-secondary-600 transition-all transform hover:scale-105">
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
                  Domina las tecnologías más avanzadas para la digitalización, gestión y
                  preservación digital de archivos. Aprende a implementar sistemas de gestión
                  documental digital que cumplan con estándares internacionales y normativas
                  vigentes.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-secondary-500 text-xl">✓</span>
                    <span className="text-gray-700">Digitalización de documentos históricos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-secondary-500 text-xl">✓</span>
                    <span className="text-gray-700">Sistemas de gestión documental digital</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-secondary-500 text-xl">✓</span>
                    <span className="text-gray-700">Preservación digital a largo plazo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-secondary-500 text-xl">✓</span>
                    <span className="text-gray-700">Metadatos y estándares internacionales</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Información del Curso</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Duración:</span>
                    <span className="text-gray-600">80 horas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Modalidad:</span>
                    <span className="text-gray-600">Virtual</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Nivel:</span>
                    <span className="text-gray-600">Intermedio</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certificación:</span>
                    <span className="text-gray-600">Oficial MINEDU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Inversión:</span>
                    <span className="text-secondary-600 font-bold">S/ 1,800</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Carrusel de Imágenes */}
            <MiniCarousel
              title="Galería Gestión Digital"
              images={[
                {
                  src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Digitalización de documentos',
                  title: 'Digitalización Avanzada'
                },
                {
                  src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Sistemas de gestión digital',
                  title: 'Sistemas Digitales'
                },
                {
                  src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Preservación digital',
                  title: 'Preservación Digital'
                }
              ]}
            />

            {/* Video del Curso */}
            <VideoPlayer
              title="Introducción a la Gestión Digital de Archivos"
              description="Descubre las tecnologías modernas para la digitalización y gestión documental digital en este video introductorio."
              poster="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            />

            {/* Módulos del Curso */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Curso</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📷</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 1: Digitalización Básica</h3>
                  <p className="text-gray-600">Equipos, técnicas y mejores prácticas para digitalizar documentos históricos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">💾</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 2: Almacenamiento Digital</h3>
                  <p className="text-gray-600">Formatos de archivo, compresión y sistemas de almacenamiento seguros.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏷️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 3: Metadatos y Catalogación</h3>
                  <p className="text-gray-600">Estándares Dublin Core, MARC y creación de metadatos descriptivos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 4: Seguridad Digital</h3>
                  <p className="text-gray-600">Protección de datos, backups y planes de contingencia digital.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 5: Acceso y Difusión</h3>
                  <p className="text-gray-600">Portales web, APIs y estrategias de difusión digital de archivos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 6: Análisis y Estadísticas</h3>
                  <p className="text-gray-600">Herramientas de análisis digital y métricas de uso de archivos.</p>
                </div>
              </div>
            </div>

            {/* Tecnologías que aprenderás */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tecnologías que Dominarás</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Adobe Acrobat</h3>
                  <p className="text-gray-600 text-sm">Procesamiento y OCR de documentos</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">🗃️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Archivematica</h3>
                  <p className="text-gray-600 text-sm">Sistema de preservación digital</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">☁️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AWS S3</h3>
                  <p className="text-gray-600 text-sm">Almacenamiento en la nube</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">ElasticSearch</h3>
                  <p className="text-gray-600 text-sm">Búsqueda y indexación avanzada</p>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Equipo Docente</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      IT
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Ing. Teresa López</h3>
                      <p className="text-secondary-600">Especialista en Digitalización</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Ingeniera con 12 años de experiencia en proyectos de digitalización de archivos históricos en América Latina.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      DR
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dr. Roberto Silva</h3>
                      <p className="text-secondary-600">Experto en Preservación Digital</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Doctor en Informática con especialización en preservación digital y metadatos en instituciones culturales.</p>
                </div>
              </div>
            </div>

            {/* Llamado a Acción */}
            <div className="text-center bg-gradient-to-r from-secondary-500 to-secondary-700 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">Conviértete en un experto en gestión digital</h2>
              <p className="text-xl mb-6 text-secondary-100">Domina las tecnologías del futuro y lidera la transformación digital de los archivos en el Perú</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  🚀 Inscribirme Ahora
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-secondary-600 transition-all transform hover:scale-105">
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

export default GestionDigital;