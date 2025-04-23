'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatList from '@/components/chat/ChatList';
import ChatDetail from '@/components/chat/ChatDetail';
import { FaInbox } from 'react-icons/fa';

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
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: Record<string, number>;
}

const ChatsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/chats');
      return;
    }

    if (user?._id) {
      fetchConversations();
    }
  }, [user, isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/chat/conversations?userId=${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      
      const data = await response.json();
      setConversations(data.data || []);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user?._id) return null;
    return conversation.participants.find(p => p._id !== user._id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchConversations}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaInbox className="text-5xl mb-4" />
          <p className="text-xl">No conversations yet</p>
          <p className="mt-2">Start chatting with service providers to see your conversations here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <ChatList 
              conversations={conversations}
              selectedConversationId={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUserId={user?._id || ''}
            />
          </div>
          
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            {selectedConversation ? (
              <ChatDetail 
                conversationId={selectedConversation}
                userId={user?._id || ''}
                onMessageSent={fetchConversations}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <p className="text-xl">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
