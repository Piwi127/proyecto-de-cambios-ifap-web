import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarLogo from './NavbarLogo';
import NavbarDesktopNav from './NavbarDesktopNav';
import NavbarActions from './NavbarActions';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme:dark)').matches);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const navbarRef = useRef(null);
  const location = useLocation();

  const navItems = [
    {
      label: 'Inicio',
      path: '/',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      label: 'Nosotros',
      path: '/about',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Cursos',
      path: '/courses',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>,
      submenu: [
        { label: 'Todos los Cursos', path: '/courses/all' },
        { label: 'Archivística Básica', path: '/archivistica-basica' },
        { label: 'Archivos Históricos', path: '/archivos-historicos' },
        { label: 'Gestión Digital', path: '/gestion-digital' },
        { label: 'Preservación de Documentos', path: '/preservacion-documentos' },
      ],
    },
    {
      label: 'Blog',
      path: '/blog',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-3m-2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-3" /></svg>,
    },
    {
      label: 'Contacto',
      path: '/contact',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
  ];


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  // Efecto para gestionar el tema (dark/light mode)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    console.log('Buscando:', searchQuery);
    // Aquí iría la lógica de búsqueda real
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Función para manejar el hover en los elementos del menú principal

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Navbar Principal con diseño moderno */}
      <nav
        ref={navbarRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-blue-200 to-cyan-200 shadow-lg border-b border-blue-300/50"
      >
        {/* Fondo degradado eliminado */}

        <div className="relative flex items-center justify-between transition-all duration-500 py-5">

          <NavbarLogo isDarkMode={isDarkMode} />

          {/* Desktop Navigation mejorada */}
          <NavbarDesktopNav
            navItems={navItems}
            isActive={isActive}
            handleItemClick={() => {}}
          />

          <NavbarActions
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>
      </nav>

      {/* Search Overlay mejorado */}

      {/* Search Overlay mejorado */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar cursos, artículos, eventos..."
                      className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-gray-800 rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300"
                    />
                    <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleSearch}
                    className={`p-4 rounded-2xl transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>

                {/* Resultados de búsqueda simulados */}
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Resultados sugeridos:</div>
                  {[
                    { title: 'Archivística Básica', type: 'Curso', icon: '📖' },
                    { title: 'Tendencias Digitales 2025', type: 'Artículo', icon: '📝' },
                    { title: 'Congreso Internacional', type: 'Evento', icon: '📅' }
                  ].map((result, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 cursor-pointer">
                      <span className="text-2xl">{result.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{result.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{result.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu mejorado */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl border-l border-white/20 dark:border-gray-700/50 transform transition-transform duration-300 ease-out">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5"></div>
            <div className="relative p-6 pt-20">
              <div className="space-y-4">
                {navItems.map((item) => (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-4 w-full p-4 rounded-xl font-semibold transition-all duration-300
                        ${isActive(item.path)
                          ? 'text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-xl'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>

                    {/* Mobile submenu */}
                    {item.submenu && (
                      <div className="ml-8 mt-2 space-y-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300
                              ${location.pathname === subItem.path
                                ? 'text-primary-600 dark:text-primary-400 font-semibold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                          >
                            <span className="text-lg">{subItem.icon}</span>
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full p-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Ingresar</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

{/* Spacer for fixed navbar */}
<div className="h-20" />
