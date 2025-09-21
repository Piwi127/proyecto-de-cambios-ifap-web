import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { messagingService } from '../services/messagingService';
import { useAuth } from '../context/AuthContext';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const ChatPage = () => {
    const { conversationId: routeConversationId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [wsClient, setWsClient] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});

    const fetchConversations = useCallback(async () => {
        try {
            const response = await messagingService.getConversations();
            setConversations(response.data);
            if (routeConversationId) {
                const foundConversation = response.data.find(conv => conv.id === parseInt(routeConversationId));
                setCurrentConversation(foundConversation);
            } else if (response.data.length > 0) {
                setCurrentConversation(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, [routeConversationId]);

    const fetchMessages = useCallback(async (convId) => {
        if (!convId) return;
        try {
            const response = await messagingService.getConversationMessages(convId);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (currentConversation) {
            fetchMessages(currentConversation.id);
            // Setup WebSocket connection
            if (wsClient) {
                wsClient.close();
            }
            const client = new W3CWebSocket(`${import.meta.env.VITE_API_WS_URL}/ws/chat/${currentConversation.id}/`);
            setWsClient(client);

            client.onopen = () => {
                console.log('WebSocket Client Connected');
            };

            client.onmessage = (message) => {
                const data = JSON.parse(message.data);
                if (data.type === 'message') {
                    setMessages(prevMessages => [...prevMessages, data.message]);
                } else if (data.type === 'typing_status') {
                    setTypingUsers(prev => ({ ...prev, [data.user_id]: data.is_typing }));
                }
            };

            client.onclose = () => {
                console.log('WebSocket Client Closed');
            };

            client.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            return () => {
                client.close();
            };
        }
    }, [currentConversation, fetchMessages]);

    const handleSendMessage = async (content) => {
        if (!currentConversation || !user) return;
        try {
            const messageData = {
                conversation: currentConversation.id,
                content: content
            };
            await messagingService.sendMessage(messageData);
            // El mensaje será añadido a través del WebSocket cuando el backend lo procese
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (isTyping) => {
        if (wsClient && wsClient.readyState === wsClient.OPEN && user) {
            wsClient.send(JSON.stringify({
                type: 'typing_status',
                is_typing: isTyping,
                user_id: user.id
            }));
        }
    };

    const handleConversationSelect = (conversation) => {
        setCurrentConversation(conversation);
    };

    return (
        <div className="flex h-screen antialiased text-gray-800">
            <div className="flex flex-row h-full w-full overflow-x-hidden">
                <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
                    <div className="flex flex-row items-center justify-center h-12 w-full">
                        <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                        </div>
                        <div className="ml-2 font-bold text-2xl">Chats</div>
                    </div>
                    <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
                        <div className="h-20 w-20 rounded-full border overflow-hidden">
                            <img src="https://avatars3.githubusercontent.com/u/2763884?s=128" alt="Avatar" className="h-full w-full" />
                        </div>
                        <div className="text-sm font-semibold mt-2">Aminos Co.</div>
                        <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
                        <div className="flex flex-row items-center mt-3">
                            <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
                                <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                            </div>
                            <div className="leading-none ml-1 text-xs">Active</div>
                        </div>
                    </div>
                    <div className="flex flex-col mt-8">
                        <div className="flex flex-row items-center justify-between text-xs">
                            <span className="font-bold">Conversations</span>
                            <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{conversations.length}</span>
                        </div>
                        <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 ${currentConversation?.id === conv.id ? 'bg-gray-100' : ''}`}
                                    onClick={() => handleConversationSelect(conv)}
                                >
                                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                                        {conv.participants.length > 1 ? 'GR' : conv.participants[0]?.username[0].toUpperCase()}
                                    </div>
                                    <div className="ml-2 text-sm font-semibold">
                                        {conv.participants.length > 1 ? conv.name || 'Group Chat' : conv.participants[0]?.username}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-auto h-full p-6">
                    {currentConversation ? (
                        <ChatWindow
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                            wsClient={wsClient}
                            typingUsers={typingUsers}
                            conversation={currentConversation}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;