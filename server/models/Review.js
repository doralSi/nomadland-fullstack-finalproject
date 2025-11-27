import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  pointId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    minlength: 5
  },
  ratingOverall: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ratingPrice: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ratingAccessibilityArrival: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ratingAccessibilityDisability: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  language: {
    type: String,
    enum: ['he', 'en'],
    required: true,
    default: 'he'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure one review per user per point
reviewSchema.index({ pointId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
