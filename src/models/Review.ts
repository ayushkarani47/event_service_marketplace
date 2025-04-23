import mongoose, { Document, Schema } from 'mongoose';
import { IService } from './Service';
import { IBooking } from './Booking';
import { IUser } from './User';

export interface IReview extends Document {
  service: mongoose.Types.ObjectId | IService;
  booking: mongoose.Types.ObjectId | IBooking;
  customer: mongoose.Types.ObjectId | IUser;
  provider: mongoose.Types.ObjectId | IUser;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required']
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required']
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    },
    reply: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews from the same customer for the same booking
reviewSchema.index({ booking: 1, customer: 1 }, { unique: true });

// Calculate average ratings after saving a review
reviewSchema.post('save', async function() {
  const model = this.constructor as any;
  
  try {
    // Calculate average rating
    const stats = await model.aggregate([
      { $match: { service: this.service } },
      { 
        $group: { 
          _id: '$service', 
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);
    
    // Update service with new rating data
    if (stats.length > 0) {
      await mongoose.model('Service').findByIdAndUpdate(this.service, {
        rating: stats[0].avgRating.toFixed(1),
        reviewCount: stats[0].numReviews
      });
    }
  } catch (err) {
    console.error('Error updating service rating:', err);
  }
});

// Prevent mongoose from creating a new model if it already exists
const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
