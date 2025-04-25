import User from '@/models/User';
import Service from '@/models/Service';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

/**
 * Utility function to ensure all models are properly registered
 * Call this function before using any model in API routes
 */
export function ensureModels() {
  // Access each model to ensure they're registered
  const models = {
    User,
    Service,
    Booking,
    Review,
    Conversation,
    Message
  };
  
  return models;
}
