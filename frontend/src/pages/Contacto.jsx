import React, { useState, useEffect } from 'react';
import contactService from '../services/contactService';
import { validateContactForm, formatPhoneNumber, sanitizeInput } from '../utils/validation';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    tipoConsulta: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sanitizar entrada
    let sanitizedValue = sanitizeInput(value);

    // Formatear teléfono si es el campo teléfono
    if (name === 'telefono') {
      sanitizedValue = formatPhoneNumber(sanitizedValue);
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Limpiar error de validación para este campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const [contactData, setContactData] = useState({
    address: 'Av. Principal 123, Lima, Perú',
    phone: '+51 1 234 5678',
    email: 'info@ifap.edu.pe',
    hours: 'Lunes - Viernes: 8:00 AM - 6:00 PM'
  });

  useEffect(() => {
    // Cargar información de contacto al montar el componente
    const loadContactInfo = async () => {
      try {
        const info = await contactService.getContactInfo();
        setContactData(info);
      } catch {
        // Mantener valores por defecto
      }
    };

    loadContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSubmitMessage('Por favor, corrige los errores en el formulario.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    setValidationErrors({});

    try {
      await contactService.sendContactForm(formData);
      setSubmitMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        tipoConsulta: 'general'
      });
    // eslint-disable-next-line no-unused-vars
    } catch (_error) {
      setSubmitMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

    const contactCards = [
    {
      icon: '📍',
      title: 'Dirección',
      content: contactData.address,
      details: 'Instituto de Formación Archivística'
    },
    {
      icon: '📞',
      title: 'Teléfono',
      content: contactData.phone,
      details: 'Lunes a Viernes: 8:00 AM - 6:00 PM'
    },
    {
      icon: '✉️',
      title: 'Email',
      content: contactData.email,
      details: 'Respuesta en 24 horas'
    },
    {
      icon: '🕒',
      title: 'Horario de Atención',
      content: 'Lunes - Viernes',
      details: contactData.hours
    }
  ];

  const socialLinks = [
    { icon: '📘', name: 'Facebook', url: '#', color: 'hover:text-blue-600' },
    { icon: '🐦', name: 'Twitter', url: '#', color: 'hover:text-blue-400' },
    { icon: '📷', name: 'Instagram', url: '#', color: 'hover:text-pink-600' },
    { icon: '💼', name: 'LinkedIn', url: '#', color: 'hover:text-blue-700' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Contacta con <span className="text-primary-600">Nosotros</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre nuestros cursos o necesitas más información?
            Estamos aquí para ayudarte. Completa el formulario y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Envíanos un Mensaje</h2>

            {submitMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitMessage.includes('exitosamente')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre y Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      validationErrors.nombre ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {validationErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      validationErrors.email ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Teléfono y Tipo de Consulta */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      validationErrors.telefono ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="+51 999 999 999"
                  />
                  {validationErrors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.telefono}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="tipoConsulta" className="block text-sm font-medium text-neutral-700 mb-2">
                    Tipo de Consulta
                  </label>
                  <select
                    id="tipoConsulta"
                    name="tipoConsulta"
                    value={formData.tipoConsulta}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="general">Consulta General</option>
                    <option value="cursos">Información de Cursos</option>
                    <option value="matricula">Matrícula</option>
                    <option value="certificacion">Certificación</option>
                    <option value="soporte">Soporte Técnico</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-neutral-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    validationErrors.asunto ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="¿Cuál es el motivo de tu consulta?"
                />
                {validationErrors.asunto && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.asunto}</p>
                )}
              </div>

              {/* Mensaje */}
              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-neutral-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical ${
                    validationErrors.mensaje ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Describe detalladamente tu consulta o pregunta..."
                />
                {validationErrors.mensaje && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.mensaje}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar Mensaje'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid gap-6">
              {contactCards.map((info, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{info.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{info.title}</h3>
                      <p className="text-primary-600 font-medium">{info.content}</p>
                      <p className="text-sm text-neutral-600">{info.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Nuestra Ubicación</h3>
              <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-neutral-600">Mapa interactivo próximamente</p>
                  <p className="text-sm text-neutral-500 mt-1">Av. Principal 123, Lima, Perú</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Síguenos en Redes Sociales</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`text-2xl p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-sm text-neutral-600 mt-4">
                Mantente al día con nuestras últimas noticias, eventos y actualizaciones educativas.
              </p>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Preguntas Frecuentes</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900">¿Cómo puedo matricularme en un curso?</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    Puedes matricularte contactándonos directamente o visitando nuestras oficinas.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">¿Ofrecen certificación?</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    Sí, todos nuestros cursos incluyen certificación oficial del IFAP.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">¿Hay modalidades virtuales?</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    Ofrecemos tanto cursos presenciales como virtuales según la disponibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">¿Prefieres hablar directamente?</h2>
            <p className="text-primary-100 mb-6">
              Nuestro equipo está disponible para atenderte personalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+5112345678"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                📞 Llamar Ahora
              </a>
              <a
                href="mailto:info@ifap.edu.pe"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                ✉️ Enviar Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;