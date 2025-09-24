import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo = ({ isDarkMode }) => {
  return (
    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
      {/* Logo */}
      <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
        <svg
          className={`w-full h-full transition-colors duration-300 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-900' : 'text-white'}`}
        >
          IFAP
        </span>
      </div>
      {/* Nombre del Instituto */}
      <span className="self-center text-2xl font-extrabold whitespace-nowrap text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
        INSTITUTO DE FORMACIÓN Archivística DEL PERÚ
      </span>
    </Link>
  );
};

export default NavbarLogo;