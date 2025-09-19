import React from 'react';
import UniversityMenu from '../components/UniversityMenu';
import FooterModern from '../components/FooterModern';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header con Menú Universitario */}
      <UniversityMenu />

      {/* Contenido principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer Moderno */}
      <FooterModern />
    </div>
  );
};

export default Layout;