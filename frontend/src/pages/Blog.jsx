import React, { useState } from 'react';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Datos ficticios para artículos del blog
  const articles = [
    {
      id: 1,
      title: 'La Digitalización de Archivos Históricos en el Perú: Avances y Desafíos',
      excerpt: 'Análisis detallado sobre el proceso de digitalización de archivos coloniales y republicanos en instituciones peruanas, incluyendo casos de éxito y lecciones aprendidas.',
      content: 'La digitalización de archivos históricos representa uno de los mayores desafíos y oportunidades para la preservación del patrimonio documental peruano...',
      author: 'Dra. María González',
      date: '15 Sep 2025',
      category: 'tendencias',
      readTime: '8 min',
      image: 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Digitalización+Archivos',
      tags: ['Digitalización', 'Preservación', 'Tecnología']
    },
    {
      id: 2,
      title: 'Nuevas Normativas Internacionales sobre Gestión Documental',
      excerpt: 'Revisión completa de las últimas normativas ISO y estándares internacionales que afectan la gestión documental en instituciones públicas y privadas.',
      content: 'Las nuevas normativas internacionales están transformando la forma en que las organizaciones manejan sus documentos...',
      author: 'Lic. Carlos Rodríguez',
      date: '12 Sep 2025',
      category: 'normativas',
      readTime: '12 min',
      image: 'https://via.placeholder.com/600x400/059669/FFFFFF?text=Normativas+ISO',
      tags: ['Normativas', 'ISO', 'Gestión Documental']
    },
    {
      id: 3,
      title: 'El Rol del Archivista en la Era Digital',
      excerpt: 'Cómo la profesión de archivista está evolucionando con las nuevas tecnologías y qué competencias adicionales se requieren para el siglo XXI.',
      content: 'La profesión archivística ha experimentado una transformación significativa en las últimas décadas...',
      author: 'MSc. Ana López',
      date: '10 Sep 2025',
      category: 'profesion',
      readTime: '6 min',
      image: 'https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Rol+Archivista',
      tags: ['Profesión', 'Competencias', 'Digital']
    },
    {
      id: 4,
      title: 'Preservación de Documentos en Climas Tropicales',
      excerpt: 'Estrategias específicas para la conservación de documentos en países con climas cálidos y húmedos como el Perú.',
      content: 'El clima tropical presenta desafíos únicos para la preservación documental que requieren enfoques especializados...',
      author: 'Dr. Roberto Sánchez',
      date: '8 Sep 2025',
      category: 'preservacion',
      readTime: '10 min',
      image: 'https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Preservación+Tropical',
      tags: ['Preservación', 'Clima', 'Conservación']
    },
    {
      id: 5,
      title: 'Inteligencia Artificial en la Clasificación Archivística',
      excerpt: 'Cómo la IA está revolucionando los procesos de clasificación y organización de archivos históricos.',
      content: 'La inteligencia artificial está transformando fundamentalmente cómo clasificamos y organizamos los archivos...',
      author: 'Ing. Patricia Morales',
      date: '5 Sep 2025',
      category: 'tendencias',
      readTime: '9 min',
      image: 'https://via.placeholder.com/600x400/EA580C/FFFFFF?text=IA+Archivística',
      tags: ['IA', 'Clasificación', 'Tecnología']
    },
    {
      id: 6,
      title: 'Caso de Éxito: Digitalización del Archivo General de la Nación',
      excerpt: 'Lecciones aprendidas del proyecto de digitalización más ambicioso realizado en el Perú.',
      content: 'El proyecto de digitalización del Archivo General de la Nación representa un hito en la archivística peruana...',
      author: 'Lic. Juan Torres',
      date: '3 Sep 2025',
      category: 'casos',
      readTime: '7 min',
      image: 'https://via.placeholder.com/600x400/0891B2/FFFFFF?text=Archivo+Nación',
      tags: ['Caso de Éxito', 'Digitalización', 'Proyecto']
    }
  ];

  // Eventos del sector
  const events = [
    {
      id: 1,
      title: 'Congreso Internacional de Archivística 2025',
      date: '25 Oct 2025',
      time: '09:00 - 18:00',
      location: 'Lima, Perú',
      type: 'congreso',
      description: 'El evento más importante del año para profesionales de la archivística en América Latina.',
      image: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Congreso+2025'
    },
    {
      id: 2,
      title: 'Taller: Preservación Digital Avanzada',
      date: '15 Nov 2025',
      time: '14:00 - 17:00',
      location: 'Virtual',
      type: 'taller',
      description: 'Aprende las últimas técnicas en preservación digital con expertos internacionales.',
      image: 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Taller+Digital'
    },
    {
      id: 3,
      title: 'Seminario: Normativas ISO para Archivos',
      date: '5 Dic 2025',
      time: '10:00 - 13:00',
      location: 'Arequipa, Perú',
      type: 'seminario',
      description: 'Actualización completa sobre las nuevas normativas internacionales aplicables.',
      image: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Seminario+ISO'
    }
  ];

  // Categorías disponibles
  const categories = [
    { id: 'todos', label: 'Todos los Artículos', icon: '📚' },
    { id: 'tendencias', label: 'Tendencias', icon: '📈' },
    { id: 'normativas', label: 'Normativas', icon: '⚖️' },
    { id: 'profesion', label: 'Profesión', icon: '👔' },
    { id: 'preservacion', label: 'Preservación', icon: '🛡️' },
    { id: 'casos', label: 'Casos de Éxito', icon: '🏆' }
  ];

  // Filtrar artículos por categoría
  const filteredArticles = activeCategory === 'todos'
    ? articles
    : articles.filter(article => article.category === activeCategory);

  // Función para manejar suscripción al newsletter
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog del Sector Archivístico
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Mantente actualizado con las últimas tendencias, normativas y noticias
              del mundo de la archivística nacional e internacional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveCategory('tendencias')}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg"
              >
                📈 Ver Tendencias
              </button>
              <button
                onClick={() => setActiveCategory('normativas')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105"
              >
                ⚖️ Normativas Actuales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📧 Newsletter Exclusivo
            </h2>
            <p className="text-gray-600 mb-6">
              Recibe contenido exclusivo sobre archivística, actualizaciones de normativas
              y oportunidades profesionales directamente en tu correo.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Suscribirse
              </button>
            </form>
            {isSubscribed && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                ✅ ¡Suscripción exitosa! Revisa tu correo para confirmar.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-md'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Artículos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                      {categories.find(cat => cat.id === article.category)?.label}
                    </span>
                    <span className="text-sm text-gray-500">📅 {article.date}</span>
                    <span className="text-sm text-gray-500">⏱️ {article.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {article.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">{article.author}</span>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Leer más →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Calendario de Eventos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📅 Calendario de Eventos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Próximos eventos, congresos y talleres del sector archivístico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      event.type === 'congreso' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'taller' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {event.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">📅 {event.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>🕒 {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>

                  <button className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-all">
                    Más Información
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Quieres contribuir al blog?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Si eres profesional de la archivística y tienes conocimientos para compartir,
            contáctanos para publicar tus artículos y experiencias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105 shadow-lg">
              ✍️ Enviar Artículo
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105">
              📧 Contactar Editor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;