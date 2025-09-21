import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Assuming you have an AuthContext

const useWebSocket = () => {
  const [notifications, setNotifications] = useState([]);
  
  // Validación defensiva para evitar errores del AuthContext
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    console.warn('Error accessing AuthContext:', error);
  }
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(3000);

  useEffect(() => {
    // TEMPORALMENTE DESHABILITADO PARA PREVENIR BUCLES
    // WebSocket connection disabled to prevent infinite reconnection loops
    console.log('WebSocket temporalmente deshabilitado para prevenir bucles de reconexión');
    
    // Cleanup any existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []); // Empty dependency array to run only once

  // Siempre devolver un array, incluso si está vacío
  return notifications || [];
};

export default useWebSocket;