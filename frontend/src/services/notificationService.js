let socket = null;
let reconnectInterval = 1000;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let isManualClose = false;

function connectWebSocket(onNotification) {
  if (typeof window === 'undefined') return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  const token = localStorage.getItem('access_token');
  if (!token) {
    if (import.meta.env.DEV) {
      console.error('No token available for WebSocket connection');
    }
    return;
  }

  const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const wsProtocol =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const baseWsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${defaultHost}:8000`;
  const wsUrl = `${baseWsUrl}/ws/notifications/?token=${token}`;
  isManualClose = false;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    if (import.meta.env.DEV) {
      console.log('WebSocket connected');
    }
    reconnectAttempts = 0;
    reconnectInterval = 1000;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onNotification(data.message);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Invalid WebSocket payload', error);
      }
    }
  };

  socket.onclose = (event) => {
    if (import.meta.env.DEV) {
      console.log('WebSocket closed', event);
    }
    if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(onNotification);
      }, reconnectInterval);
      reconnectInterval *= 2;
    }
  };

  socket.onerror = (error) => {
    if (import.meta.env.DEV) {
      console.error('WebSocket error', error);
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}

function disconnectWebSocket() {
  if (socket) {
    isManualClose = true;
    socket.close();
    socket = null;
  }
}

export { connectWebSocket, disconnectWebSocket };
