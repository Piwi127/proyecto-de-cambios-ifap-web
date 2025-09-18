import React from 'react';
import { Link } from 'react-router-dom';

const FooterModern = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Sección principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">IFAP</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl opacity-30 blur-lg"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Instituto de Formación Archivística
                </h3>
                <p className="text-sm text-primary-400 font-medium">del Perú</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Formación profesional especializada en archivística y gestión documental.
              Líderes en la preservación del patrimonio documental del Perú desde 2010.
            </p>

            {/* Redes sociales */}
            <div className="flex space-x-4">
              {[
                { icon: '📘', label: 'Facebook', color: 'hover:text-blue-400' },
                { icon: '🐦', label: 'Twitter', color: 'hover:text-sky-400' },
                { icon: '💼', label: 'LinkedIn', color: 'hover:text-blue-500' },
                { icon: '📷', label: 'Instagram', color: 'hover:text-pink-400' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:bg-white/20 hover:scale-110 ${social.color} group`}
                  aria-label={social.label}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-400">🔗</span>
              </span>
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', path: '/', icon: '🏠' },
                { label: 'Cursos', path: '#cursos', icon: '📚' },
                { label: 'Blog', path: '/blog', icon: '📝' },
                { label: 'Sobre IFAP', path: '/about', icon: 'ℹ️' },
                { label: 'Contacto', path: '/contacto', icon: '📞' }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-3 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto e Información */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-8 h-8 bg-secondary-500/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-secondary-400">📧</span>
              </span>
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 mt-1">📧</span>
                <div>
                  <p className="text-gray-300">info@ifap.pe</p>
                  <p className="text-sm text-gray-400">Correo electrónico</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 mt-1">📞</span>
                <div>
                  <p className="text-gray-300">+51 123 456 789</p>
                  <p className="text-sm text-gray-400">Teléfono</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 mt-1">📍</span>
                <div>
                  <p className="text-gray-300">Lima, Perú</p>
                  <p className="text-sm text-gray-400">Ubicación</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/10">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
              <span className="text-3xl mr-3">📧</span>
              Newsletter IFAP
            </h3>
            <p className="text-gray-300 mb-6">
              Mantente actualizado con las últimas tendencias en archivística,
              nuevos cursos y eventos del sector.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; 2025 Instituto de Formación Archivística del Perú. Todos los derechos reservados.</p>
              <div className="flex space-x-6">
                <a href="#" className="hover:text-white transition-colors duration-300">Política de Privacidad</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Términos de Servicio</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Accesibilidad</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Desarrollado con</span>
              <div className="flex items-center space-x-1">
                <span className="text-red-500 text-lg">❤️</span>
                <span className="text-gray-300 font-medium">por IFAP</span>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '500+', label: 'Estudiantes' },
              { number: '25+', label: 'Cursos' },
              { number: '15', label: 'Años' },
              { number: '98%', label: 'Satisfacción' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elementos decorativos finales */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
    </footer>
  );
};

export default FooterModern;