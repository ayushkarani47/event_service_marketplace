'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

interface ChatBoxProps {
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
  serviceId?: string;
  bookingId?: string;
  onClose?: () => void;
  initialMessages?: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({
  receiverId,
  receiverName,
  receiverImage,
  serviceId,
  bookingId,
  onClose,
  initialMessages = []
}) => {
  const { user, isAuthenticated, logout, refreshToken } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching or creating conversation for:', {
        userId: user._id,
        receiverId,
        serviceId,
        bookingId
      });

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (serviceId) queryParams.append('serviceId', serviceId);
      if (bookingId) queryParams.append('bookingId', bookingId);
      queryParams.append('userId', user._id);
      
      // Find or create conversation using the direct API endpoint
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          participants: [receiverId],
          serviceId,
          bookingId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Conversation creation error:', errorData);
        throw new Error(errorData.message || 'Failed to load or create conversation');
      }

      const data = await response.json();
      const convoId = data.data._id;
      setConversationId(convoId);
      console.log('Conversation created/found:', convoId);

      // Get messages for this conversation using the direct API endpoint
      const messagesResponse = await fetch(`/api/chat/conversations/${convoId}?userId=${user._id}`);
      
      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        console.error('Messages fetch error:', errorData);
        throw new Error(errorData.message || 'Failed to load messages');
      }
      
      const messagesData = await messagesResponse.json();
      console.log(`Loaded ${messagesData.data.messages?.length || 0} messages`);
      setMessages(messagesData.data.messages || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?._id) return;
    
    try {
      setError(null);
      
      console.log('Sending message:', {
        userId: user._id,
        receiver: receiverId,
        content: newMessage,
        serviceId,
        bookingId
      });
      
      // Use the direct API endpoint for sending messages
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          receiver: receiverId,
          content: newMessage,
          serviceId,
          bookingId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Message send error:', errorData);
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent successfully:', data.data._id);
      
      // Add the new message to the list
      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: string) => {
    return user?._id === senderId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{receiverName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close chat"
            title="Close chat"
          >
            &times;
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-2xl" />
              <span className="ml-2">Loading messages...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MdError className="text-red-500 text-4xl mb-2" />
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={fetchMessages}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div 
                  key={message._id}
                  className={`flex ${isCurrentUser(message.sender._id) ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser(message.sender._id) 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser(message.sender._id) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !!error}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
              disabled={!newMessage.trim() || loading || !!error}
              aria-label="Send message"
              title="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
