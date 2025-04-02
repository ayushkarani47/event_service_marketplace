import mongoose, { Document, Schema } from 'mongoose';

export enum ServiceCategory {
  PHOTOGRAPHY = 'photography',
  VENUE = 'venue',
  DJ = 'dj',
  MAKEUP = 'makeup',
  DECORATION = 'decoration',
  CHOREOGRAPHY = 'choreography',
  DANCER = 'dancer',
  CATERING = 'catering',
  PACKAGE = 'package',
  OTHER = 'other'
}

export interface IService extends Document {
  title: string;
  description: string;
  provider: mongoose.Types.ObjectId;
  category: ServiceCategory;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  images: string[];
  location: string;
  availability: {
    date: Date;
    isBooked: boolean;
  }[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider ID is required']
    },
    category: {
      type: String,
      enum: Object.values(ServiceCategory),
      required: [true, 'Please specify a category']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price']
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'starting_at'],
      default: 'fixed'
    },
    images: [{
      type: String
    }],
    location: {
      type: String,
      required: [true, 'Please provide a location']
    },
    availability: [{
      date: {
        type: Date,
        required: [true, 'Date is required for availability']
      },
      isBooked: {
        type: Boolean,
        default: false
      }
    }],
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for search functionality
serviceSchema.index({ title: 'text', description: 'text', category: 'text', location: 'text' });

const Service = mongoose.model<IService>('Service', serviceSchema);

export default Service; 