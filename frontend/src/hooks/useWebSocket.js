import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Assuming you have an AuthContext

const useWebSocket = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth(); // Get user from AuthContext
    const ws = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = useRef(3000);

    useEffect(() => {
        if (!user) {
            // If no user, close any existing connection and don't try to connect
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            return;
        }

        // Reset attempts when user changes
        reconnectAttempts.current = 0;
        reconnectDelay.current = 3000;

        // Establish WebSocket connection
        const connectWebSocket = () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.warn('No access token found, cannot establish WebSocket connection.');
                return;
            }
            ws.current = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
                reconnectAttempts.current = 0; // Reset on successful connection
                reconnectDelay.current = 3000;
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket Disconnected', event);
                // Attempt to reconnect if not exceeded max attempts
                if (reconnectAttempts.current < maxReconnectAttempts && user) {
                    reconnectAttempts.current += 1;
                    console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
                    setTimeout(() => {
                        connectWebSocket();
                    }, reconnectDelay.current);
                    reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // Exponential backoff, max 30s
                } else {
                    console.error('Max reconnection attempts reached or user logged out.');
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                // Don't close here, let onclose handle it
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [user]);

    return notifications;
};

export default useWebSocket;