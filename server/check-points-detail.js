import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allPoints = await Point.find({}).limit(20);
    
    console.log('📍 Sample points (first 20):\n');
    
    allPoints.forEach((p, i) => {
      console.log(`${i+1}. ${p.title}`);
      console.log(`   Category: ${p.category || 'NO CATEGORY'}`);
      console.log(`   Region: ${p.region || 'NO REGION'}`);
      console.log(`   Location: [${p.lat}, ${p.lng}]`);
      console.log('');
    });
    
    // Check how many have no region
    const noRegion = await Point.countDocuments({ region: { $exists: false } });
    const nullRegion = await Point.countDocuments({ region: null });
    
    console.log(`\n📊 Points without region field: ${noRegion}`);
    console.log(`📊 Points with null region: ${nullRegion}`);
    
    // Check unique categories
    const categories = await Point.distinct('category');
    console.log(`\n📂 Existing categories: ${categories.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPoints();
