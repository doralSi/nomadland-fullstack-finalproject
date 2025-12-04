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
  timestamps: true
});

export default mongoose.model('Point', pointSchema);
