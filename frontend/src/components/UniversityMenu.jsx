import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UniversityMenu.css';

const UniversityMenu = () => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuRef = useRef(null);
  const location = useLocation();

  // Estructura del menú académico universitario
  const menuItems = [
    {
      id: 'inicio',
      label: 'Inicio',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Portal principal de la universidad'
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      path: '/nosotros',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Conoce nuestra historia y equipo'
    },
    {
      id: 'cursos',
      label: 'Cursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      description: 'Programas académicos y educación',
      submenu: [
        {
          category: 'Archivística y Gestión Documental',
          items: [
            { label: 'Archivística Básica', path: '/archivistica-basica', icon: '📋' },
            { label: 'Gestión Digital', path: '/gestion-digital', icon: '💻' },
            { label: 'Archivos Históricos', path: '/archivos-historicos', icon: '📜' },
            { label: 'Preservación de Documentos', path: '/preservacion-documentos', icon: '🛡️' }
          ]
        }
      ]
    },
    {
      id: 'blog',
      label: 'Blog',
      path: '/blog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      description: 'Noticias y artículos de interés'
    },
    {
      id: 'aula-virtual',
      label: 'Aula Virtual',
      path: '/aula-virtual',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Plataforma de aprendizaje en línea',
      badge: 'Nuevo'
    },
    {
      id: 'contacto',
      label: 'Contacto',
      path: '/contacto',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Información de contacto y ubicación'
    }
  ];

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveSubmenu(null);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verificar si una ruta está activa
  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Manejar hover en elementos del menú
  const handleMouseEnter = (itemId) => {
    setHoveredItem(itemId);
    const item = menuItems.find(item => item.id === itemId);
    if (item?.submenu) {
      setActiveSubmenu(itemId);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    // Pequeño delay para permitir navegar al submenu
    setTimeout(() => {
      if (!hoveredItem) {
        setActiveSubmenu(null);
      }
    }, 150);
  };

  return (
    <nav ref={menuRef} className="relative bg-white/95 backdrop-blur-md z-50 border-b border-gray-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y nombre de la universidad */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg logo-glow animate-float">
                <svg className="w-6 h-6 text-white icon-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gradient">
                IFAP Universidad
              </h1>
              <p className="text-xs text-gray-600 -mt-1">Instituto de Formación Académica Profesional</p>
            </div>
          </div>

          {/* Menú principal - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`
                      menu-item focus-ring flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 dynamic-shadow
                      ${isActive(item.path) 
                        ? 'bg-primary-50 text-primary-700 shadow-md' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      }
                      ${hoveredItem === item.id ? 'transform scale-105' : ''}
                    `}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <span className={`icon-hover transition-colors duration-300 ${isActive(item.path) ? 'text-primary-600' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full font-medium badge-shimmer">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    className={`
                      menu-item focus-ring flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 dynamic-shadow
                      text-gray-700 hover:bg-gray-50 hover:text-primary-600
                      ${hoveredItem === item.id ? 'transform scale-105 bg-gray-50' : ''}
                    `}
                    aria-expanded={activeSubmenu === item.id}
                    aria-haspopup={item.submenu ? 'true' : 'false'}
                  >
                    <span className="icon-hover transition-colors duration-300">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.submenu && (
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${activeSubmenu === item.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full font-medium badge-shimmer">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )}

                {/* Submenu Dropdown */}
                {item.submenu && activeSubmenu === item.id && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-96 submenu-container rounded-xl shadow-2xl border border-gray-200/50 z-50 animate-fade-in"
                    role="menu"
                    aria-labelledby={`menu-${item.id}`}
                  >
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 
                          id={`menu-${item.id}`}
                          className="text-lg font-semibold text-gray-900 flex items-center space-x-2"
                        >
                          <span className="icon-hover">{item.icon}</span>
                          <span>{item.label}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      
                      <div className="space-y-6">
                        {item.submenu.map((category, categoryIndex) => (
                          <div key={categoryIndex}>
                            <h4 className="category-header text-sm font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                              {category.category}
                            </h4>
                            <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby={`category-${categoryIndex}`}>
                              {category.items.map((subItem, subIndex) => (
                                <Link
                                  key={subIndex}
                                  to={subItem.path}
                                  className="submenu-item focus-ring flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 group parallax-subtle"
                                  role="menuitem"
                                >
                                  <span className="text-lg group-hover:scale-110 transition-transform duration-200 icon-hover">
                                    {subItem.icon}
                                  </span>
                                  <span className="text-sm font-medium">{subItem.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón de menú móvil */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus-ring p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 dynamic-shadow"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <svg className="w-6 h-6 icon-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden absolute top-full left-0 right-0 glass-effect border-t border-gray-200 shadow-xl z-50 animate-slide-up"
            role="navigation"
            aria-label="Menú de navegación móvil"
          >
            <div className="px-4 py-6 space-y-4 max-h-screen overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        menu-item focus-ring flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 dynamic-shadow
                        ${isActive(item.path) 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <span className="icon-hover">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full font-medium badge-shimmer">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => setActiveSubmenu(activeSubmenu === item.id ? null : item.id)}
                        className="focus-ring w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 dynamic-shadow"
                        aria-expanded={activeSubmenu === item.id}
                        aria-controls={`mobile-submenu-${item.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="icon-hover">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full font-medium badge-shimmer">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${activeSubmenu === item.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {item.submenu && activeSubmenu === item.id && (
                        <div 
                          id={`mobile-submenu-${item.id}`}
                          className="mt-2 ml-6 space-y-3 animate-slide-up"
                          role="region"
                          aria-labelledby={`mobile-menu-${item.id}`}
                        >
                          {item.submenu.map((category, categoryIndex) => (
                            <div key={categoryIndex}>
                              <h4 
                                id={`mobile-category-${item.id}-${categoryIndex}`}
                                className="category-header text-sm font-semibold text-gray-800 mb-2"
                              >
                                {category.category}
                              </h4>
                              <div 
                                className="space-y-1"
                                role="group"
                                aria-labelledby={`mobile-category-${item.id}-${categoryIndex}`}
                              >
                                {category.items.map((subItem, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="submenu-item focus-ring flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 parallax-subtle"
                                  >
                                    <span className="text-sm icon-hover">{subItem.icon}</span>
                                    <span className="text-sm">{subItem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UniversityMenu;