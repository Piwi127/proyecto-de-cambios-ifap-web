import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [newCourses] = useState(2);
  const [clickedItem, setClickedItem] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isSubmenuHovered, setIsSubmenuHovered] = useState(false);
  const [submenuTimeout, setSubmenuTimeout] = useState(null);
  const [submenuShowTimeout, setSubmenuShowTimeout] = useState(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved&&window.matchMedia('(prefers-color-scheme:dark)').matches);
  });
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recognition, setRecognition] = useState(null);
  const location = useLocation();

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setActiveSubmenu(null);
    setIsSubmenuHovered(false);
    setIsMenuHovered(false);
    if (submenuTimeout) {
      clearTimeout(submenuTimeout);
      setSubmenuTimeout(null);
    }
    if (submenuShowTimeout) {
      clearTimeout(submenuShowTimeout);
      setSubmenuShowTimeout(null);
    }
  }, [location]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeout) {
        clearTimeout(submenuTimeout);
      }
      if (submenuShowTimeout) {
        clearTimeout(submenuShowTimeout);
      }
    };
  }, [submenuTimeout, submenuShowTimeout]);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        console.log('Voice search:', transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Función para manejar clics con feedback
  const handleItemClick = (itemId) => {
    setClickedItem(itemId);
    setTimeout(() => setClickedItem(null), 300);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    handleItemClick('theme');
  };

  const startVoiceSearch = () => {
    if (recognition && !isListening){
      recognition.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    {
      path: '#cursos',
      label: 'Cursos',
      icon: '📚',
      submenu: [
        { label: 'Archivística Básica', path: '/cursos/archivistica-basica', icon: '📖' },
        { label: 'Gestión Digital', path: '/cursos/gestion-digital', icon: '💻' },
        { label: 'Archivos Históricos', path: '/cursos/archivos-historicos', icon: '🏛️' },
        { label: 'Preservación', path: '/cursos/preservacion', icon: '🛡️' },
      ]
    },
    { path: '/blog', label: 'Blog', icon: '📝' },
    { path: '/about', label: 'Sobre IFAP', icon: 'ℹ️' },
    { path: '/contacto', label: 'Contacto', icon: '📞' },
  ];

  const isActive = (path) => {
    if (path.startsWith('#')) {
      return location.pathname === '/' && window.location.hash === path;
    }
    return location.pathname === path;
  };

  const handleSubmenuHover = (itemPath, isHovering) => {
    if (isHovering) {
      if (submenuTimeout) {
        clearTimeout(submenuTimeout);
        setSubmenuTimeout(null);
      }
      setActiveSubmenu(itemPath);
      setSubmenuVisible(true);
    } else {
      setSubmenuVisible(false);
      const timeout = setTimeout(() => {
        if (!isSubmenuHovered){
          setActiveSubmenu(null);
        }
      }, 350);
      setSubmenuTimeout(timeout);
    }
  };

  const handleSubmenuMouseEnter = () => {
    setIsSubmenuHovered(true);
    setSubmenuVisible(true);
    if (submenuTimeout) {
      clearTimeout(submenuTimeout);
      setSubmenuTimeout(null);
    }
  };

  const handleSubmenuMouseLeave = () => {
    setIsSubmenuHovered(false);
    setSubmenuVisible(false);
    const timeout = setTimeout(() => {
      if (!isMenuHovered&&!isSubmenuHovered){
        setActiveSubmenu(null);
      }
    }, 350);
    setSubmenuTimeout(timeout);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-blue-200 to-cyan-200 shadow-lg border-b border-blue-300/50`}>        <div className="container mx-auto px-6">
          <div className={`flex items-center justify-between transition-all duration-300 py-3`}>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm">IFAP</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors duration-300">
                  Instituto de Formación Archivística
                </h1>
                <p className="text-xs text-neutral-500 group-hover:text-primary-600 transition-colors duration-300">
                  <span className="text-black">Formación profesional en archivística</span>
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 relative">
              {navItems.map((item, index) => (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => item.submenu && handleSubmenuHover(item.path, true)}
                  onMouseLeave={() => item.submenu && handleSubmenuHover(item.path, false)}
                >
                  <Link
                    to={item.path}
                    onClick={() => handleItemClick(item.path)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group overflow-hidden flex items-center space-x-2 ${
                      isActive(item.path)
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    } ${clickedItem === item.path ? 'scale-95' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-primary-600/10 rounded-lg transition-all duration-300 ${
                      clickedItem === item.path ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}></div>

                    <span className="text-sm relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.label}</span>

                    {item.submenu && (
                      <svg className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                        activeSubmenu === item.path ? 'rotate-180' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}

                    {item.label === 'Cursos' && newCourses > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium animate-pulse relative z-10">
                        {newCourses}
                      </span>
                    )}

                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary-600 transition-all duration-300 ${
                      isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>

                    {isActive(item.path) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 rounded-full animate-ping"></div>
                    )}
                    {isActive(item.path) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </Link>

                  {/* Submenu */}
                  {item.submenu && (
                    <div
                      className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50 transition-opacity duration-300 ${activeSubmenu === item.path && submenuVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      onMouseEnter={handleSubmenuMouseEnter}
                      onMouseLeave={handleSubmenuMouseLeave}
                      style={{
                        visibility: activeSubmenu === item.path || submenuVisible ? 'visible' : 'hidden',
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <div className="py-2">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="flex items-center space-x-3 px-5 py-4 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-300 group relative overflow-hidden"
                            style={{ animationDelay: `${subIndex * 50}ms` }}
                            onClick={() => {
                              handleItemClick(subItem.path);
                              setActiveSubmenu(null);
                            }}
                          >
                            <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <span className="text-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                              {subItem.icon}
                            </span>
                            <div className="flex-1 relative z-10">
                              <span className="font-medium block">{subItem.label}</span>
                              <span className="text-xs text-neutral-500 group-hover:text-primary-600 transition-colors duration-300">
                                {subItem.path.includes('basica') && 'Fundamentos de archivística'}
                                {subItem.path.includes('digital') && 'Tecnologías modernas'}
                                {subItem.path.includes('historicos') && 'Historia documental del Perú'}
                                {subItem.path.includes('preservacion') && 'Conservación y restauración'}
                              </span>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Notification Bell */}
              <div className="relative ml-2">
                <button className="relative p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-300 group">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 7v5h5l-5 5v-5zM4 12h8m0 0l-4-4m4 4l-4 4" />
                  </svg>
                  {notifications > 0 && (
                    <>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-white text-xs font-bold">{notifications}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-ping opacity-75">
                        <span className="text-white text-xs font-bold">{notifications}</span>
                      </div>
                    </>
                  )}
                  <div className="absolute -inset-1 bg-primary-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`relative p-2 rounded-lg transition-all duration-300 group ml-2 ${
                  isSearchOpen
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                }`}
                aria-label="Buscar"
              >
                <svg className={`w-5 h-5 transition-transform duration-300 ${isSearchOpen ? 'rotate-90 scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSearchOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-ping"></div>
                )}
                {isListening && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <div className={`absolute -inset-1 bg-primary-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </button>

              {/* Login Button */}
              <Link
                to="/login"
                onClick={() => handleItemClick('login')}
                className={`ml-4 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-primary-700 hover:to-primary-800 relative overflow-hidden ${
                  clickedItem === 'login' ? 'scale-95' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-green-500 rounded-lg transition-all duration-300 ${
                  clickedItem === 'login' ? 'scale-100 opacity-20' : 'scale-0 opacity-0'
                }`}></div>
                <span className="relative z-10 flex items-center space-x-2">
                  <span>🎓</span>
                  <span>Aula Virtual</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-300"
              aria-label="Menú"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[9998]" onClick={() => setIsSearchOpen(false)}></div>
        )}

        {/* Search Bar */}
        <div className={`fixed top-20 left-0 right-0 transition-all duration-500 ease-out z-[9999] ${
          isSearchOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}>
          <div className="container mx-auto px-6 py-8">
            <div className="relative max-w-2xl mx-auto">
              <div className={`relative transform transition-all duration-500 ${
                isSearchOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
              }`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar cursos, recursos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-4 pl-14 pr-24 text-lg bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300 placeholder:text-neutral-500"
                        autoFocus={isSearchOpen}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Voice Search Button */}
                      <button
                        onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                        className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 group ${
                          isListening
                            ? 'text-red-500 bg-red-50 animate-pulse'
                            : 'text-neutral-400 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                        aria-label="Búsqueda por voz"
                      >
                        <svg className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${
                          isListening ? 'animate-bounce' : ''
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        {isListening && (
                          <div className="absolute -inset-1 bg-red-500/20 rounded-lg animate-ping"></div>
                        )}
                      </button>

                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-all duration-300 hover:rotate-90"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Search Suggestions */}
                    <div className={`mt-2 bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden transition-all duration-300 z-[300] ${
                      isSearchOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="p-2 space-y-1">
                        {isListening && (
                          <div className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            <span>Escuchando...</span>
                          </div>
                        )}
                        <div className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer transition-colors duration-200">
                          📚 Archivística Básica
                        </div>
                        <div className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer transition-colors duration-200">
                          💻 Gestión Digital
                        </div>
                        <div className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded cursor-pointer transition-colors duration-200">
                          🏛️ Archivos Históricos
                        </div>
                        {searchQuery && (
                          <div className="px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded">
                            Buscando: "{searchQuery}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-neutral-900">Menú</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.label === 'Cursos' && newCourses > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse ml-auto">
                      {newCourses}
                    </span>
                  )}
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}

              {/* Notification item in mobile menu */}
              <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-700">
                <span className="text-lg">🔔</span>
                <span className="font-medium">Notificaciones</span>
                {notifications > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce ml-auto">
                    {notifications}
                  </span>
                )}
              </div>
            </nav>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>🎓</span>
                <span>Aula Virtual</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
    </>
  );
};

export default Navbar;
