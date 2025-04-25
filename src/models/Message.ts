import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  serviceId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ serviceId: 1 });
MessageSchema.index({ bookingId: 1 });
MessageSchema.index({ createdAt: -1 });

// Fix for the "Schema hasn't been registered for model" error in Next.js
let Message: Model<IMessage>;

try {
  // Try to get the existing model
  Message = mongoose.model<IMessage>('Message');
} catch {
  // Model doesn't exist, so create it
  Message = mongoose.model<IMessage>('Message', MessageSchema);
}

export default Message;
