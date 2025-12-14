import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  images: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['he', 'en'],
    required: true,
    default: 'he'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  averageRating: {
    type: Number,
    default: null
  },
  averagePriceLevel: {
    type: Number,
    default: null
  },
  averageAccessibilityArrival: {
    type: Number,
    default: null
  },
  averageAccessibilityDisability: {
    type: Number,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for review count
pointSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'pointId',
  count: true
});

export default mongoose.model('Point', pointSchema);
