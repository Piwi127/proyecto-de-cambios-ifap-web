import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const VideoConference = ({ roomName = 'AulaVirtualIFAP', userName }) => {
  const interfaceConfig = {
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
      'livestreaming', 'etherpad', 'sharedvideo', 'shareaudio', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
      'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'mute-video-everyone', 'security', 'whiteboard'
    ],
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: true,
          enableEmailInStats: false,
          toolbarButtons: interfaceConfig.TOOLBAR_BUTTONS
        }}
        interfaceConfigOverwrite={interfaceConfig}
        userInfo={{
          displayName: userName || 'Usuario'
        }}
        onApiReady={(externalApi) => {
          // Aquí puedes agregar lógica personalizada si es necesario
        }}
        getIFrameRef={(node) => { node.style.height = '100%'; node.style.width = '100%'; }}
      />
    </div>
  );
};

export default VideoConference;