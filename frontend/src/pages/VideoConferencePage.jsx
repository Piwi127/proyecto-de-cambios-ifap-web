import React from 'react';
import VideoConference from '../components/VideoConference';

const VideoConferencePage = () => {
  const roomName = 'AulaVirtualIFAP'; // Nombre de sala dinámico basado en curso en el futuro

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Videoconferencia del Aula Virtual</h1>
      <VideoConference roomName={roomName} />
    </div>
  );
};

export default VideoConferencePage;