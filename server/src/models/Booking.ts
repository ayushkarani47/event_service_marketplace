import mongoose, { Document, Schema } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IBooking extends Document {
  service: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required']
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required']
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking; 