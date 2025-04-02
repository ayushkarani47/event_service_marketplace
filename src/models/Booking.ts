import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  service: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  startDate: Date;
  endDate?: Date;
  numberOfGuests?: number;
  specialRequests?: string;
  totalPrice: number;
  providerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    numberOfGuests: {
      type: Number,
      min: 1,
      default: 1,
    },
    specialRequests: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    providerNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Use mongoose.models to check if the model exists already
const Booking: Model<IBooking> = mongoose.models.Booking as Model<IBooking> || 
  mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking; 