import React from 'react';
import { useNavigate } from 'react-router-dom';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const PreservacionDocumentos = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Preservación de Documentos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-neutral-100 leading-relaxed">
              Técnicas avanzadas para la conservación y restauración de documentos históricos y contemporáneos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🛡️ Inscribirme Ahora
              </button>
              <button 
                onClick={() => navigate('/programa/preservacion-documentos')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-neutral-600 transition-all transform hover:scale-105"
              >
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
                  Conviértete en un especialista en preservación documental aprendiendo
                  las técnicas más avanzadas para proteger y restaurar documentos históricos
                  y contemporáneos. Domina los procesos de conservación preventiva y
                  restauración especializada.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-neutral-600 text-xl">✓</span>
                    <span className="text-gray-700">Conservación preventiva de documentos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neutral-600 text-xl">✓</span>
                    <span className="text-gray-700">Técnicas de restauración documental</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neutral-600 text-xl">✓</span>
                    <span className="text-gray-700">Control de plagas y biodeterioro</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-neutral-600 text-xl">✓</span>
                    <span className="text-gray-700">Almacenamiento y exhibición segura</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Información del Curso</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Duración:</span>
                    <span className="text-gray-600">100 horas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Modalidad:</span>
                    <span className="text-gray-600">Presencial/Virtual</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Nivel:</span>
                    <span className="text-gray-600">Especializado</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certificación:</span>
                    <span className="text-gray-600">Oficial MINEDU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Inversión:</span>
                    <span className="text-neutral-700 font-bold">S/ 2,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Carrusel de Imágenes */}
            <MiniCarousel
              title="Galería Preservación de Documentos"
              images={[
                {
                  src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Laboratorio de conservación',
                  title: 'Laboratorio de Conservación'
                },
                {
                  src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Restauración documental',
                  title: 'Restauración Documental'
                },
                {
                  src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Equipos especializados',
                  title: 'Equipos Especializados'
                }
              ]}
            />

            {/* Video del Curso */}
            <VideoPlayer
              title="Introducción a la Preservación de Documentos"
              description="Conoce las técnicas avanzadas de conservación y restauración documental en este video introductorio."
              poster="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            />

            {/* Módulos del Curso */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Curso</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🔬</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 1: Ciencia de la Conservación</h3>
                  <p className="text-gray-600">Principios químicos y físicos de la degradación documental y métodos de prevención.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🧪</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 2: Materiales y Técnicas</h3>
                  <p className="text-gray-600">Estudio de soportes documentales y técnicas de conservación específicas por material.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🐛</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 3: Control de Plagas</h3>
                  <p className="text-gray-600">Identificación, prevención y tratamiento de plagas que afectan documentos históricos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 4: Instalaciones y Almacenamiento</h3>
                  <p className="text-gray-600">Diseño de depósitos, control ambiental y sistemas de almacenamiento seguro.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🔧</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 5: Restauración Práctica</h3>
                  <p className="text-gray-600">Técnicas de restauración manual y uso de equipos especializados en laboratorio.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 6: Gestión de Riesgos</h3>
                  <p className="text-gray-600">Planes de contingencia, evaluación de riesgos y protocolos de emergencia.</p>
                </div>
              </div>
            </div>

            {/* Laboratorios y Equipos */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Laboratorios y Equipos Especializados</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">🔬</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Laboratorio de Conservación</h3>
                  <p className="text-gray-600 text-sm">Equipado con microscopios, cámaras de humedad controlada y estaciones de trabajo especializadas.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">🧪</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Análisis Químico</h3>
                  <p className="text-gray-600 text-sm">Equipos para análisis de tintas, papeles y tratamientos de conservación química.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-4xl mb-4">📷</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Fotografía y Digitalización</h3>
                  <p className="text-gray-600 text-sm">Cámaras especializadas y software para documentación antes/después de tratamientos.</p>
                </div>
              </div>
            </div>

            {/* Tipos de Documentos */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tipos de Documentos que Preservarás</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Documentos en Papel</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Manuscritos antiguos y medievales</li>
                    <li>• Documentos coloniales y republicanos</li>
                    <li>• Mapas y planos históricos</li>
                    <li>• Fotografías en papel</li>
                    <li>• Documentos contemporáneos</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Otros Soportes</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Papiros y pergaminos</li>
                    <li>• Documentos en seda y textiles</li>
                    <li>• Microfilmes y microfichas</li>
                    <li>• Discos ópticos y digitales</li>
                    <li>• Objetos tridimensionales</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Equipo Docente</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-neutral-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      QC
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quím. Rosa Martínez</h3>
                      <p className="text-neutral-700">Conservadora y Restauradora</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Química especializada en conservación documental con 18 años de experiencia en laboratorios de restauración.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      BA
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Biól. Andrés Soto</h3>
                      <p className="text-neutral-700">Especialista en Biodeterioro</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Biólogo con especialización en control de plagas y biodeterioro en archivos históricos.</p>
                </div>
              </div>
            </div>

            {/* Llamado a Acción */}
            <div className="text-center bg-gradient-to-r from-neutral-700 to-neutral-900 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">Protege el patrimonio documental del Perú</h2>
              <p className="text-xl mb-6 text-neutral-100">Conviértete en un especialista en preservación y garantiza que nuestros documentos históricos perduren para las futuras generaciones</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/login', { state: { showRegister: true } })}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  🚀 Inscribirme Ahora
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-neutral-600 transition-all transform hover:scale-105">
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

export default PreservacionDocumentos;