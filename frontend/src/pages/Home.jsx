import React from 'react';
import Carousel from '../components/Carousel';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <div>
      {/* Hero Carousel */}
      <Carousel />

      {/* ¿Qué es IFAP? */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Instituto de Formación Archivística del Perú
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Líder en formación profesional especializada en archivística y gestión documental
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestra Misión</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Formar profesionales altamente capacitados en archivística y gestión documental,
                  contribuyendo al desarrollo de una cultura archivística sólida en el Perú y
                  preservando el patrimonio documental nacional.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestra Visión</h3>
                <p className="text-gray-700 leading-relaxed">
                  Ser el instituto líder en formación archivística en América Latina,
                  reconocido por la excelencia académica y la contribución al desarrollo
                  de políticas archivísticas nacionales e internacionales.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">¿Por qué elegir IFAP?</h4>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Docentes con experiencia internacional</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Convenios con archivos históricos del Perú</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Certificación oficial del Ministerio de Educación</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Plataforma virtual de vanguardia</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Prácticas profesionales garantizadas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cursos Destacados */}
      <section id="cursos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Cursos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Programas especializados diseñados para formar profesionales en archivística
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow animate-slide-up">
              <div className="bg-primary-600 p-6 text-white">
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-xl font-bold">Archivística Básica</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Fundamentos esenciales de la archivística, organización y clasificación documental.
                  Ideal para principiantes en el campo.
                </p>
                <div className="flex justify-between items-center text-sm text-neutral-500 mb-4">
                  <span>📅 120 horas</span>
                  <span>👥 Presencial/Virtual</span>
                </div>
                <button className="w-full btn-primary">
                  Más Información
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow animate-slide-up">
              <div className="bg-secondary-500 p-6 text-white">
                <div className="text-4xl mb-2">💻</div>
                <h3 className="text-xl font-bold">Gestión Digital de Archivos</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Tecnologías modernas para la digitalización y preservación digital
                  de documentos históricos.
                </p>
                <div className="flex justify-between items-center text-sm text-neutral-500 mb-4">
                  <span>📅 80 horas</span>
                  <span>👥 Virtual</span>
                </div>
                <button className="w-full btn-secondary">
                  Más Información
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow animate-slide-up">
              <div className="bg-primary-700 p-6 text-white">
                <div className="text-4xl mb-2">🏛️</div>
                <h3 className="text-xl font-bold">Archivos Históricos del Perú</h3>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Estudio especializado de los archivos coloniales, republicanos y
                  contemporáneos del Perú.
                </p>
                <div className="flex justify-between items-center text-sm text-neutral-500 mb-4">
                  <span>📅 150 horas</span>
                  <span>👥 Presencial</span>
                </div>
                <button className="w-full btn-primary">
                  Más Información
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Ver Todos los Cursos en el Aula Virtual
            </a>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestro Impacto</h2>
            <p className="text-xl text-primary-100">Cifras que demuestran nuestro compromiso con la formación archivística</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-primary-200">95%</div>
              <h3 className="text-lg font-semibold mb-2">Empleabilidad</h3>
              <p className="text-primary-100 text-sm">De nuestros egresados</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-primary-200">500+</div>
              <h3 className="text-lg font-semibold mb-2">Profesionales Formados</h3>
              <p className="text-primary-100 text-sm">Desde 2010</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-primary-200">15</div>
              <h3 className="text-lg font-semibold mb-2">Años de Experiencia</h3>
              <p className="text-primary-100 text-sm">Liderando formación</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-primary-200">98%</div>
              <h3 className="text-lg font-semibold mb-2">Satisfacción</h3>
              <p className="text-primary-100 text-sm">De estudiantes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios y Casos de Éxito */}
      <Testimonials />

      {/* Llamado a Acción Final */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para comenzar tu carrera en archivística?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Únete a cientos de profesionales que han transformado su futuro con nuestra formación especializada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105 shadow-lg">
              🚀 Inscribirme Ahora
            </a>
            <a href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105">
              📖 Conocer Más sobre IFAP
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;