import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const BibliotecaAulaVirtual = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Biblioteca Virtual</h1>
        <p className="text-primary-100 text-lg">
          Accede a recursos educativos y materiales de estudio
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Biblioteca en Desarrollo
          </h3>
          <p className="text-gray-500">
            Esta sección está siendo desarrollada. Pronto tendrás acceso a una amplia colección de recursos educativos.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default BibliotecaAulaVirtual;