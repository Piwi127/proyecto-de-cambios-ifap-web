import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || user.role !== 'admin') {
        setError('Acceso denegado. Solo los administradores pueden ver los mensajes de contacto.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/contact/submissions/', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setMessages(response.data);
      } catch (err) {
        setError('Error al cargar los mensajes de contacto.');
        console.error('Error fetching contact messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Cargando mensajes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mensajes de Contacto</h1>
      {messages.length === 0 ? (
        <p className="text-gray-600">No hay mensajes de contacto para mostrar.</p>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500"><strong>Fecha:</strong> {new Date(message.submitted_at).toLocaleString()}</p>
              <p className="text-lg font-semibold text-gray-800"><strong>Asunto:</strong> {message.subject}</p>
              <p className="text-md text-gray-700"><strong>De:</strong> {message.name} &lt;{message.email}&gt;</p>
              <p className="mt-2 text-gray-700">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;