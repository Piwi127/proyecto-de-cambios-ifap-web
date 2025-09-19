import React from 'react';

const ColaboracionPage = () => {
  const padName = 'aula-virtual-colab'; // TODO: make dynamic
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src={`http://localhost:9001/p/${padName}`}
        style={{ height: '100%', width: '100%', border: 'none' }}
        title="Herramienta de Colaboración"
      />
    </div>
  );
};

export default ColaboracionPage;