import React from 'react';
import MiniCarousel from '../components/MiniCarousel';
import VideoPlayer from '../components/VideoPlayer';

const ArchivosHistoricos = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Archivos Históricos del Perú
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
              Estudio especializado de los archivos coloniales, republicanos y contemporáneos del Perú
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                🏛️ Inscribirme Ahora
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
                  Sumérgete en la rica historia documental del Perú, desde los archivos
                  coloniales hasta los documentos contemporáneos. Aprende a identificar,
                  preservar y gestionar los archivos históricos que conforman la memoria
                  colectiva de nuestra nación.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Historia de los archivos peruanos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Archivos coloniales y republicanos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Documentos históricos contemporáneos</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary-500 text-xl">✓</span>
                    <span className="text-gray-700">Preservación de patrimonio documental</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Información del Curso</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Duración:</span>
                    <span className="text-gray-600">150 horas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Modalidad:</span>
                    <span className="text-gray-600">Presencial</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Nivel:</span>
                    <span className="text-gray-600">Avanzado</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certificación:</span>
                    <span className="text-gray-600">Oficial MINEDU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Inversión:</span>
                    <span className="text-primary-600 font-bold">S/ 2,200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Carrusel de Imágenes */}
            <MiniCarousel
              title="Galería Archivos Históricos del Perú"
              images={[
                {
                  src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Archivo General de la Nación',
                  title: 'Archivo General de la Nación'
                },
                {
                  src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Documentos coloniales',
                  title: 'Documentos Coloniales'
                },
                {
                  src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  alt: 'Archivo Arzobispal',
                  title: 'Archivo Arzobispal de Lima'
                }
              ]}
            />

            {/* Video del Curso */}
            <VideoPlayer
              title="Introducción a los Archivos Históricos del Perú"
              description="Explora la rica historia documental del Perú desde la época colonial hasta nuestros días en este video introductorio."
              poster="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            />

            {/* Módulos del Curso */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Módulos del Curso</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏛️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 1: Época Colonial</h3>
                  <p className="text-gray-600">Archivos de la administración española, documentos notariales y registros eclesiásticos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🇵🇪</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 2: Independencia y República</h3>
                  <p className="text-gray-600">Documentos de la emancipación, constituciones y primeros años republicanos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📜</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 3: Siglo XIX</h3>
                  <p className="text-gray-600">Archivos de la consolidación republicana, guerra con Chile y modernización.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏭</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 4: Siglo XX</h3>
                  <p className="text-gray-600">Archivos de las reformas sociales, industrialización y conflictos internos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 5: Archivos Contemporáneos</h3>
                  <p className="text-gray-600">Documentos de la democracia moderna y archivos digitales contemporáneos.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🛡️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo 6: Preservación Histórica</h3>
                  <p className="text-gray-600">Técnicas especializadas para la conservación de documentos históricos antiguos.</p>
                </div>
              </div>
            </div>

            {/* Archivos Importantes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Archivos Históricos que Estudiarás</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Archivo General de la Nación</h3>
                  <p className="text-gray-600 mb-4">El archivo histórico más importante del Perú, fundado en 1821, contiene documentos desde la época colonial hasta la actualidad.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Documentos de la Independencia</li>
                    <li>• Registros coloniales completos</li>
                    <li>• Archivos presidenciales</li>
                    <li>• Documentos legislativos históricos</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Archivo Arzobispal de Lima</h3>
                  <p className="text-gray-600 mb-4">Contiene los archivos eclesiásticos más antiguos del Perú, con documentos desde el siglo XVI.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Registros parroquiales antiguos</li>
                    <li>• Documentos de la Inquisición</li>
                    <li>• Archivos de órdenes religiosas</li>
                    <li>• Documentos de evangelización</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Archivo Histórico del Ministerio de Relaciones Exteriores</h3>
                  <p className="text-gray-600 mb-4">Documentos diplomáticos que narran la historia de las relaciones internacionales del Perú.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tratados internacionales</li>
                    <li>• Correspondencia diplomática</li>
                    <li>• Documentos de conflictos limítrofes</li>
                    <li>• Archivos de la Guerra del Pacífico</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Archivo Regionales</h3>
                  <p className="text-gray-600 mb-4">Archivos históricos de las diferentes regiones del Perú que complementan la historia nacional.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Archivos de Arequipa y Cusco</li>
                    <li>• Documentos de la Independencia regional</li>
                    <li>• Archivos municipales históricos</li>
                    <li>• Documentos de la reforma agraria</li>
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
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      DH
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dra. Helena Vargas</h3>
                      <p className="text-primary-600">Historiadora y Archivista</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Doctora en Historia con especialización en archivos coloniales peruanos y 20 años de experiencia en investigación histórica.</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      LP
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Lic. Pedro Castillo</h3>
                      <p className="text-primary-600">Especialista en Archivos Coloniales</p>
                    </div>
                  </div>
                  <p className="text-gray-600">Especialista en paleografía y archivos coloniales, con publicaciones sobre historia documental del Perú.</p>
                </div>
              </div>
            </div>

            {/* Llamado a Acción */}
            <div className="text-center bg-gradient-to-r from-primary-700 to-primary-900 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">Conoce la historia documental del Perú</h2>
              <p className="text-xl mb-6 text-primary-100">Conviértete en guardián de la memoria histórica de nuestra nación</p>
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

export default ArchivosHistoricos;