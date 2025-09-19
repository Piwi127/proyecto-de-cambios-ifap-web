import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext

const useWebSocket = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth(); // Get user from AuthContext
    const ws = useRef(null);

    useEffect(() => {
        if (!user) {
            // If no user, close any existing connection and don't try to connect
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            return;
        }

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
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket Disconnected', event);
                // Attempt to reconnect after a short delay
                setTimeout(() => {
                    if (user) { // Only try to reconnect if user is still logged in
                        connectWebSocket();
                    }
                }, 3000);
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.current.close();
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