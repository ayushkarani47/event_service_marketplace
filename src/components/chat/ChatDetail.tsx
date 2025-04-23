import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaPaperPlane } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Link from 'next/link';

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
  read: boolean;
}

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }[];
  serviceId?: {
    _id: string;
    title: string;
    images: string[];
  };
  bookingId?: string;
}

interface ChatDetailProps {
  conversationId: string;
  userId: string;
  onMessageSent?: () => void;
}

const ChatDetail = ({ conversationId, userId, onMessageSent }: ChatDetailProps) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && userId) {
      fetchConversationDetails();
    }
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/conversations/${conversationId}?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      setConversation(data.data.conversation);
      setMessages(data.data.messages || []);
    } catch (err: any) {
      console.error('Error fetching conversation details:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userId || !conversation) return;
    
    try {
      setError(null);
      
      // Find the other participant
      const receiver = conversation.participants.find(p => p._id !== userId);
      
      if (!receiver) {
        throw new Error('Could not determine message recipient');
      }
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          receiver: receiver._id,
          content: newMessage,
          serviceId: conversation.serviceId?._id,
          bookingId: conversation.bookingId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
      
      // Notify parent component that a message was sent
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isCurrentUser = (senderId: string) => {
    return userId === senderId;
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p._id !== userId);
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {conversation && (
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              {otherParticipant?.profilePicture ? (
                <Image
                  src={otherParticipant.profilePicture}
                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {otherParticipant?.firstName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">
                {otherParticipant ? 
                  `${otherParticipant.firstName} ${otherParticipant.lastName}` : 
                  'Unknown User'}
              </h3>
              {conversation.serviceId && (
                <Link 
                  href={`/services/${conversation.serviceId._id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {conversation.serviceId.title}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
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
              onClick={fetchConversationDetails}
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
            {messages.map((message, index) => {
              // Check if we need to show a date separator
              const showDateSeparator = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(messages[index - 1].createdAt).toDateString();
              
              return (
                <div key={message._id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  )}
                  <div className={`flex ${isCurrentUser(message.sender._id) ? 'justify-end' : 'justify-start'}`}>
                    {!isCurrentUser(message.sender._id) && (
                      <div className="relative w-8 h-8 mr-2 flex-shrink-0">
                        {message.sender.profilePicture ? (
                          <Image
                            src={message.sender.profilePicture}
                            alt={`${message.sender.firstName} ${message.sender.lastName}`}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {message.sender.firstName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser(message.sender._id) 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none border'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser(message.sender._id) ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                        {isCurrentUser(message.sender._id) && (
                          <span className="ml-1">{message.read ? '✓✓' : '✓'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !!error || !conversation}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!newMessage.trim() || loading || !!error || !conversation}
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
  );
};

export default ChatDetail;
