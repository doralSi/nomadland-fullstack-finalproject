import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Point from './models/Point.js';

dotenv.config();

const checkPoints = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all points with their region info
    const points = await Point.find({}).select('title regionSlug region status').limit(20);
    
    console.log('\n📍 Sample Points:');
    points.forEach(point => {
      console.log(`- ${point.title}`);
      console.log(`  regionSlug: ${point.regionSlug || 'NONE'}`);
      console.log(`  region (ID): ${point.region || 'NONE'}`);
      console.log(`  status: ${point.status}`);
      console.log('');
    });

    // Count points by region
    const byRegion = await Point.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$regionSlug', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Points by Region (approved only):');
    byRegion.forEach(r => {
      console.log(`  ${r._id || 'NO SLUG'}: ${r.count} points`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkPoints();
