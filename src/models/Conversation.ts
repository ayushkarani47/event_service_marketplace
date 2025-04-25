import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  serviceId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: {
    [key: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Participants are required'],
    }],
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    lastMessage: {
      type: String,
    },
    lastMessageDate: {
      type: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ serviceId: 1 });
ConversationSchema.index({ bookingId: 1 });
ConversationSchema.index({ lastMessageDate: -1 });

// Fix for the "Schema hasn't been registered for model" error in Next.js
let Conversation: Model<IConversation>;

try {
  // Try to get the existing model
  Conversation = mongoose.model<IConversation>('Conversation');
} catch {
  // Model doesn't exist, so create it
  Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
}

export default Conversation;
