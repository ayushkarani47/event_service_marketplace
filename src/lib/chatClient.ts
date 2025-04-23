// Chat API client functions

/**
 * Get all conversations for the current user
 * @param serviceId Optional service ID to filter conversations
 * @param bookingId Optional booking ID to filter conversations
 * @returns Array of conversations
 */
export async function getConversations(serviceId?: string, bookingId?: string) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (serviceId) queryParams.append('serviceId', serviceId);
    if (bookingId) queryParams.append('bookingId', bookingId);
    
    const response = await fetch(`/api/conversations?${queryParams.toString()}`);
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to fetch conversations');
    }
    
    const data = await response.json();
    return data?.data || [];
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw new Error(error?.message || 'Failed to fetch conversations');
  }
}

/**
 * Get a specific conversation and its messages
 * @param conversationId Conversation ID
 * @returns Conversation and messages
 */
export async function getConversation(conversationId: string) {
  try {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    const response = await fetch(`/api/conversations/${conversationId}`);
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to fetch conversation');
    }
    
    const data = await response.json();
    return data?.data || { conversation: null, messages: [] };
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    throw new Error(error?.message || 'Failed to fetch conversation');
  }
}

/**
 * Create a new conversation
 * @param participants Array of user IDs
 * @param serviceId Optional service ID
 * @param bookingId Optional booking ID
 * @returns Created conversation
 */
export async function createConversation(participants: string[], serviceId?: string, bookingId?: string) {
  try {
    if (!participants || participants.length === 0) {
      throw new Error('At least one participant is required');
    }
    
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participants,
        serviceId,
        bookingId
      }),
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to create conversation');
    }
    
    const data = await response.json();
    return data?.data || null;
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    throw new Error(error?.message || 'Failed to create conversation');
  }
}

/**
 * Delete a conversation
 * @param conversationId Conversation ID
 * @returns Success message
 */
export async function deleteConversation(conversationId: string) {
  try {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to delete conversation');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    throw new Error(error?.message || 'Failed to delete conversation');
  }
}

/**
 * Send a new message
 * @param receiverId Receiver user ID
 * @param content Message content
 * @param serviceId Optional service ID
 * @param bookingId Optional booking ID
 * @returns Created message
 */
export async function sendMessage(receiverId: string, content: string, serviceId?: string, bookingId?: string) {
  try {
    if (!receiverId) {
      throw new Error('Receiver ID is required');
    }
    
    if (!content || content.trim() === '') {
      throw new Error('Message content is required');
    }
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver: receiverId,
        content,
        serviceId,
        bookingId
      }),
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to send message');
    }
    
    const data = await response.json();
    return data?.data || null;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error?.message || 'Failed to send message');
  }
}
