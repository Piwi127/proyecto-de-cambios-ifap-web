let socket = null;
let reconnectInterval = 1000;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connectWebSocket(onNotification) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('No token available for WebSocket connection');
    return;
  }

  const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const wsProtocol =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const baseWsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${defaultHost}:8000`;
  const wsUrl = `${baseWsUrl}/ws/notifications/?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onNotification(data.message);
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed', event);
    if (reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        reconnectAttempts++;
        connectWebSocket(onNotification);
      }, reconnectInterval);
      reconnectInterval *= 2;
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error', error);
    socket.close();
  };
}

function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export { connectWebSocket, disconnectWebSocket };
