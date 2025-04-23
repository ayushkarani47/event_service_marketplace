import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatBox from './ChatBox';

interface ChatButtonProps {
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
  serviceId?: string;
  bookingId?: string;
}

const ChatButton = ({ 
  receiverId, 
  receiverName, 
  receiverImage,
  serviceId,
  bookingId 
}: ChatButtonProps) => {
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleChatClick = () => {
    if (!isAuthenticated || !user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check if we have the user ID
    if (!user._id) {
      setError('User information is incomplete. Please log in again.');
      return;
    }

    // Open the chat dialog
    setShowChat(true);
    setError(null);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <div>
      <button
        onClick={handleChatClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200 flex items-center justify-center"
        aria-label={`Chat with ${receiverName}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        Chat with Provider
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      {showChat && user && (
        <ChatBox
          receiverId={receiverId}
          receiverName={receiverName}
          serviceId={serviceId}
          bookingId={bookingId}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default ChatButton;
