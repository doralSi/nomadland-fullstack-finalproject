import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAndUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Koh Phangan region
    const kohPhangan = await Region.findOne({ slug: 'koh-phangan' });
    
    if (!kohPhangan) {
      console.log('❌ Koh Phangan region not found');
      process.exit(1);
    }
    
    console.log(`✅ Found region: ${kohPhangan.name}\n`);

    // Get all points in Koh Phangan
    const points = await Point.find({ region: kohPhangan._id });
    
    console.log(`📍 Total points in Koh Phangan: ${points.length}\n`);
    
    // Show current category distribution
    const categoryCounts = {};
    points.forEach(point => {
      const cat = point.category || 'NO_CATEGORY';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    console.log('📊 Current category distribution:');
    Object.keys(categoryCounts).sort().forEach(cat => {
      console.log(`   ${cat}: ${categoryCounts[cat]}`);
    });
    console.log('');
    
    // Show points without category
    const noCategoryPoints = points.filter(p => !p.category || p.category === 'Other');
    if (noCategoryPoints.length > 0) {
      console.log(`\n⚠️ Points without proper category (${noCategoryPoints.length}):`);
      noCategoryPoints.forEach((p, i) => {
        console.log(`${i+1}. ${p.title} - Current: ${p.category || 'none'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAndUpdate();
