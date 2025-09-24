import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IFAP</span>
              </div>
              <h3 className="text-lg font-bold">IFAP INSTITUTO DE FORMACIÓN Archivística DEL PERÚ</h3>
            </div>
            <p className="text-neutral-400">
              IFAP INSTITUTO DE FORMACIÓN ARCHIVÍSTICA DEL PERÚ - Formación profesional en archivística y gestión documental.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-neutral-400 hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#cursos" className="text-neutral-400 hover:text-white transition-colors">Cursos</a></li>
              <li><a href="/about" className="text-neutral-400 hover:text-white transition-colors">Sobre IFAP</a></li>
              <li><a href="#contacto" className="text-neutral-400 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>📧 info@ifap.pe</li>
              <li>📞 +51 123 456 789</li>
              <li>📍 Lima, Perú</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2025 IFAP INSTITUTO DE FORMACIÓN Archivística DEL PERÚ. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;