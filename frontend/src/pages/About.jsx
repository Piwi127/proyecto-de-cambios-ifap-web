import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sobre el IFAP
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Conoce nuestra historia, misión y compromiso con la formación archivística en el Perú
          </p>
        </div>
      </header>

      {/* Historia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Nuestra Historia</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  El Instituto de Formación Archivística del Perú (IFAP) fue fundado en el año 2010
                  con el propósito de cubrir una necesidad creciente en el mercado laboral peruano:
                  profesionales especializados en la gestión y preservación de archivos.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Desde nuestros inicios, hemos formado a más de 500 profesionales que hoy trabajan
                  en archivos históricos, instituciones públicas, empresas privadas y organizaciones
                  internacionales, contribuyendo al desarrollo de una cultura archivística sólida en el Perú.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Nuestra institución ha sido pionera en la implementación de metodologías innovadoras
                  que combinan la teoría archivística tradicional con las nuevas tecnologías digitales,
                  preparando a nuestros estudiantes para los desafíos del siglo XXI.
                </p>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold mb-4">15 Años de Excelencia</h3>
                  <ul className="text-left space-y-2 text-gray-600">
                    <li>✓ Más de 500 profesionales formados</li>
                    <li>✓ 25+ cursos especializados</li>
                    <li>✓ Convenios con instituciones nacionales</li>
                    <li>✓ Certificación oficial del MINEDU</li>
                    <li>✓ Aula virtual de vanguardia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Nuestros Valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Excelencia Académica</h3>
              <p className="text-gray-600">
                Nos comprometemos con los más altos estándares de calidad en la enseñanza
                y formación de nuestros estudiantes.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovación</h3>
              <p className="text-gray-600">
                Incorporamos las últimas tecnologías y metodologías pedagógicas
                para una formación actualizada y efectiva.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Compromiso Social</h3>
              <p className="text-gray-600">
                Contribuimos al desarrollo de una sociedad más organizada y
                consciente de la importancia de su patrimonio documental.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Nuestro Equipo</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👩‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dra. Ana María López</h3>
              <p className="text-blue-600 mb-2">Directora General</p>
              <p className="text-gray-600 text-sm">
                Doctora en Archivística por la Universidad Complutense de Madrid.
                20 años de experiencia en gestión de archivos históricos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dr. Carlos Mendoza</h3>
              <p className="text-blue-600 mb-2">Director Académico</p>
              <p className="text-gray-600 text-sm">
                Especialista en archivos digitales y preservación electrónica.
                Consultor internacional en proyectos archivísticos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👩‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lic. Patricia Ruiz</h3>
              <p className="text-blue-600 mb-2">Coordinadora de Programas</p>
              <p className="text-gray-600 text-sm">
                Experta en diseño curricular y evaluación educativa.
                Coordinadora de convenios institucionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infraestructura */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestra Infraestructura</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">Aulas Especializadas</h3>
              <p className="text-blue-100">
                Espacios equipados con tecnología audiovisual para clases presenciales
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2">Laboratorio Digital</h3>
              <p className="text-blue-100">
                Equipos especializados para digitalización y procesamiento de documentos
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Biblioteca Especializada</h3>
              <p className="text-blue-100">
                Colección completa de textos archivísticos y publicaciones especializadas
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Aula Virtual</h3>
              <p className="text-blue-100">
                Plataforma online de última generación para formación a distancia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-blue-900">¿Quieres saber más?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Estamos comprometidos con la formación de profesionales en archivística.
            Contáctanos para más información sobre nuestros programas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Acceder al Aula Virtual
            </a>
            <a href="mailto:info@ifap.edu.pe" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Contactar con Admisiones
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;