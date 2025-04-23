import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Service {
  _id: string;
  title: string;
  images: string[];
}

interface Conversation {
  _id: string;
  participants: Participant[];
  serviceId?: Service;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: Record<string, number>;
}

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

const ChatList = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  currentUserId
}: ChatListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p._id !== currentUserId);
    if (!otherParticipant) return false;
    
    const fullName = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    const serviceTitle = conversation.serviceId?.title?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           serviceTitle.includes(searchTerm.toLowerCase());
  });

  // Get other participant's name and image
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedConversationId === conversation._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                    {otherParticipant?.profilePicture ? (
                      <Image
                        src={otherParticipant.profilePicture}
                        alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {otherParticipant?.firstName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">
                        {otherParticipant ? 
                          `${otherParticipant.firstName} ${otherParticipant.lastName}` : 
                          'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDate(conversation.lastMessageDate)}
                      </span>
                    </div>
                    
                    {conversation.serviceId && (
                      <p className="text-xs text-blue-600 mb-1 truncate">
                        Service: {conversation.serviceId.title}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full mt-1">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
