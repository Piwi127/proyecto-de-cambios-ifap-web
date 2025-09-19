import React, { useState } from 'react';
import Carousel from './Carousel';

const Testimonials = () => {
  const [activeTab, setActiveTab] = useState('testimonios');

  // Datos ficticios para testimonios
  const testimonials = [
    {
      id: 1,
      name: 'María Castillo',
      role: 'Archivista en Archivo General de la Nación',
      type: 'estudiante',
      quote: 'El IFAP me proporcionó las herramientas necesarias para desenvolverme profesionalmente. Los conocimientos adquiridos me han permitido trabajar en importantes instituciones del país.',
      rating: 5,
      avatar: 'MC',
      color: 'bg-blue-600'
    },
    {
      id: 2,
      name: 'Dr. Carlos Mendoza',
      role: 'Docente Principal - IFAP',
      type: 'profesor',
      quote: 'Como docente, veo cómo nuestros estudiantes se transforman en profesionales competentes. El IFAP no solo enseña teoría, sino que prepara para el mundo real de la archivística.',
      rating: 5,
      avatar: 'CM',
      color: 'bg-green-600'
    },
    {
      id: 3,
      name: 'Ana García',
      role: 'Directora de Archivo Municipal de Lima',
      type: 'empleador',
      quote: 'Los egresados del IFAP llegan con una preparación excepcional. Hemos contratado a varios y su contribución ha sido invaluable para modernizar nuestros sistemas archivísticos.',
      rating: 5,
      avatar: 'AG',
      color: 'bg-purple-600'
    },
    {
      id: 4,
      name: 'Pedro Ramírez',
      role: 'Especialista en Preservación Digital',
      type: 'estudiante',
      quote: 'La formación en tecnologías digitales del IFAP me abrió las puertas a oportunidades internacionales. Ahora trabajo en proyectos de digitalización en varios países.',
      rating: 5,
      avatar: 'PR',
      color: 'bg-red-600'
    }
  ];

  // Casos de éxito
  const successStories = [
    {
      id: 1,
      name: 'Luis Torres',
      title: 'De estudiante a Director Nacional de Archivos',
      story: 'Luis comenzó como estudiante en nuestro curso de Archivística Básica en 2015. Su dedicación y talento lo llevaron a completar todos nuestros programas avanzados. Hoy es el Director Nacional de Archivos del Perú, implementando políticas archivísticas a nivel nacional.',
      image: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Luis+Torres',
      achievement: 'Director Nacional de Archivos del Perú'
    },
    {
      id: 2,
      name: 'Carmen Silva',
      title: 'Innovadora en Preservación Digital',
      story: 'Carmen se especializó en Gestión Digital de Archivos y desarrolló un sistema revolucionario para la preservación de documentos coloniales. Su proyecto ha sido adoptado por más de 20 instituciones en América Latina.',
      image: 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Carmen+Silva',
      achievement: 'Premio Internacional de Archivística Digital 2023'
    }
  ];

  // Estadísticas impactantes
  const stats = [
    { number: '95%', label: 'Empleabilidad', description: 'De nuestros egresados encuentran trabajo en los primeros 6 meses' },
    { number: '500+', label: 'Profesionales Formados', description: 'Desde nuestra fundación en 2010' },
    { number: '15', label: 'Años de Experiencia', description: 'Liderando la formación archivística en Perú' },
    { number: '25+', label: 'Cursos Especializados', description: 'Actualizados con las últimas tendencias' },
    { number: '98%', label: 'Satisfacción Estudiantil', description: 'Según encuestas de seguimiento' },
    { number: '50+', label: 'Instituciones Asociadas', description: 'Archivos y bibliotecas que confían en nuestros egresados' }
  ];

  // Videos testimoniales (URLs ficticias)
  const testimonialVideos = [
    {
      id: 1,
      title: 'Testimonio de María Castillo',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      thumbnail: 'https://via.placeholder.com/300x200/2563EB/FFFFFF?text=Video+1'
    },
    {
      id: 2,
      title: 'Caso de Éxito: Luis Torres',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      thumbnail: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Video+2'
    },
    {
      id: 3,
      title: 'Entrevista con Dr. Carlos Mendoza',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      thumbnail: 'https://via.placeholder.com/300x200/16A34A/FFFFFF?text=Video+3'
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Testimonios y Casos de Éxito
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre las historias de transformación de nuestros estudiantes, profesores y empleadores
          </p>
        </div>

        {/* Tabs para navegación */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('testimonios')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'testimonios'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Testimonios
            </button>
            <button
              onClick={() => setActiveTab('casos')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'casos'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Casos de Éxito
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Videos
            </button>
          </div>
        </div>

        {/* Contenido según tab activo */}
        {activeTab === 'testimonios' && (
          <div>
            {/* Carrusel de testimonios */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Lo que dicen nuestros estudiantes, profesores y empleadores
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold`}>
                        {testimonial.avatar}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          testimonial.type === 'estudiante' ? 'bg-blue-100 text-blue-800' :
                          testimonial.type === 'profesor' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {testimonial.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(testimonial.rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas impactantes */}
            <div className="bg-primary-900 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Nuestro Impacto en Números</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold mb-2 text-primary-200">{stat.number}</div>
                    <h4 className="text-lg font-semibold mb-2">{stat.label}</h4>
                    <p className="text-primary-100 text-sm">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'casos' && (
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Historias de Éxito de Nuestros Graduados
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {successStories.map((story) => (
                <div key={story.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img src={story.image} alt={story.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h4>
                    <p className="text-gray-700 mb-4">{story.story}</p>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <p className="text-primary-800 font-semibold">{story.achievement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Videos Testimoniales
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonialVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={video.url}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{video.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;