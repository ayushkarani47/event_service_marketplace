import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  provider: mongoose.Types.ObjectId | IUser;
  location: string;
  rating: number;
  reviewCount: number;
  availability: {
    startDate: Date;
    endDate: Date;
  };
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: ['photography', 'catering', 'venue', 'entertainment', 'decor', 'other'],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Service provider is required'],
    },
    location: {
      type: String,
      required: [true, 'Service location is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    availability: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ provider: 1 });
ServiceSchema.index({ price: 1 });
ServiceSchema.index({ rating: -1 });

// Prevent mongoose from creating a new model if it already exists
const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service; 