import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPointsWithoutRegion = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const points = await Point.find({
      $or: [
        { region: { $exists: false } },
        { region: null }
      ]
    }).limit(30);

    console.log(`📍 Found ${points.length} points without region:\n`);

    points.forEach(p => {
      console.log(`${p.title}`);
      console.log(`  Lat: ${p.lat}, Lng: ${p.lng}`);
      console.log(`  Category: ${p.category}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPointsWithoutRegion();
