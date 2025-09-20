import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import Testimonials from '../components/Testimonials';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* Hero Carousel Moderno */}
      <Carousel />

      {/* Sección Hero Mejorada */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100/80 backdrop-blur-sm rounded-full text-primary-800 font-semibold text-sm mb-6 border border-primary-200/50">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                Instituto Líder en Formación Archivística
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-black">Formación Profesional en Archivística</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Desarrolla una carrera sólida en el campo de la archivística con nuestros programas especializados,
                reconocidos por su excelencia académica y contribución al patrimonio documental del Perú.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Misión y Visión con diseño moderno */}
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 group">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 ml-4">Nuestra Misión</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Formar profesionales altamente capacitados en archivística y gestión documental,
                    contribuyendo al desarrollo de una cultura archivística sólida en el Perú y
                    preservando el patrimonio documental nacional.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 group">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-xl">🔮</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 ml-4">Nuestra Visión</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Ser el instituto líder en formación archivística en América Latina,
                    reconocido por la excelencia académica y la contribución al desarrollo
                    de políticas archivísticas nacionales e internacionales.
                  </p>
                </div>
              </div>

              {/* ¿Por qué elegir IFAP? con diseño moderno */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">¿Por qué elegir IFAP?</h4>
                  <p className="text-gray-600">Descubre nuestras ventajas competitivas</p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: '👨‍🏫', text: 'Docentes con experiencia internacional', color: 'from-blue-500 to-blue-600' },
                    { icon: '🏛️', text: 'Convenios con archivos históricos del Perú', color: 'from-green-500 to-green-600' },
                    { icon: '📜', text: 'Certificación oficial del Ministerio de Educación', color: 'from-purple-500 to-purple-600' },
                    { icon: '💻', text: 'Plataforma virtual de vanguardia', color: 'from-orange-500 to-orange-600' },
                    { icon: '🎓', text: 'Prácticas profesionales garantizadas', color: 'from-red-500 to-red-600' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 group">
                      <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-white text-lg">{item.icon}</span>
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas Modernas */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nuestro Impacto en Números</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Cifras que demuestran nuestro compromiso con la formación archivística
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '95%', label: 'Empleabilidad', desc: 'De nuestros egresados', icon: '💼' },
              { number: '500+', label: 'Profesionales Formados', desc: 'Desde 2010', icon: '👥' },
              { number: '15', label: 'Años de Experiencia', desc: 'Liderando formación', icon: '🏆' },
              { number: '98%', label: 'Satisfacción', desc: 'De estudiantes', icon: '⭐' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">{stat.number}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{stat.label}</h3>
                  <p className="text-primary-100 text-sm">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos Destacados Modernos */}
      <section id="cursos" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100/80 backdrop-blur-sm rounded-full text-primary-800 font-semibold text-sm mb-6 border border-primary-200/50">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              Programas Especializados
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-black">Nuestros Cursos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Programas especializados diseñados para formar profesionales en archivística
              con las últimas tendencias y tecnologías del sector.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                icon: '📚',
                title: 'Archivística Básica',
                desc: 'Fundamentos esenciales de la archivística, organización y clasificación documental.',
                duration: '120 horas',
                mode: 'Presencial/Virtual',
                gradient: 'from-blue-500 to-blue-600',
                features: ['Bases teóricas', 'Práctica intensiva', 'Certificación oficial']
              },
              {
                icon: '💻',
                title: 'Gestión Digital',
                desc: 'Tecnologías modernas para la digitalización y preservación digital de documentos.',
                duration: '80 horas',
                mode: 'Virtual',
                gradient: 'from-green-500 to-green-600',
                features: ['Herramientas digitales', 'Preservación digital', 'Software especializado']
              },
              {
                icon: '🏛️',
                title: 'Archivos Históricos',
                desc: 'Estudio especializado de los archivos coloniales, republicanos y contemporáneos.',
                duration: '150 horas',
                mode: 'Presencial',
                gradient: 'from-purple-500 to-purple-600',
                features: ['Historia archivística', 'Análisis documental', 'Investigación histórica']
              },
              {
                icon: '🛡️',
                title: 'Preservación de Documentos',
                desc: 'Técnicas avanzadas para la conservación y restauración de documentos históricos.',
                duration: '100 horas',
                mode: 'Presencial/Virtual',
                gradient: 'from-red-500 to-red-600',
                features: ['Conservación preventiva', 'Restauración documental', 'Control ambiental']
              }
            ].map((course, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`bg-gradient-to-br ${course.gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{course.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                      <p className="text-blue-100 leading-relaxed">{course.desc}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                      <span className="flex items-center">
                        <span className="mr-2">📅</span>
                        {course.duration}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-2">👥</span>
                        {course.mode}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {course.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => navigate('/login', { state: { showRegister: true } })}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        📚 Inscribirme Ahora
                      </button>
                      <button 
                        onClick={() => {
                          const programRoutes = {
                            'Archivística Básica': '/programa/archivistica-basica',
                            'Gestión Digital': '/programa/gestion-digital',
                            'Archivos Históricos': '/programa/archivos-historicos',
                            'Preservación de Documentos': '/programa/preservacion-documentos'
                          };
                          navigate(programRoutes[course.title]);
                        }}
                        className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        📋 Ver Programa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2">
              <span>Ver Todos los Cursos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonios y Casos de Éxito */}
      <Testimonials />

      {/* Call to Action Final Moderno */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              ¿Listo para comenzar tu carrera en
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent"> archivística</span>?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Únete a cientos de profesionales que han transformado su futuro con nuestra formación especializada
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => navigate('/login', { state: { showRegister: true } })}
                className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2"
              >
                <span>🚀 Inscribirme Ahora</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2">
                <span>📖 Conocer Más sobre IFAP</span>
              </button>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: '🎓', title: 'Formación de Calidad', desc: 'Programas certificados' },
                { icon: '💼', title: 'Empleabilidad Garantizada', desc: '95% de nuestros egresados' },
                { icon: '🌟', title: 'Excelencia Académica', desc: 'Docentes especializados' }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-primary-100 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;