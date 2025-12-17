import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all regions
    const regions = await Region.find({});
    console.log('🌍 Available regions:');
    regions.forEach(r => {
      console.log(`   - ${r.name} (${r.slug})`);
    });
    console.log('');

    // Get total points
    const allPoints = await Point.find({});
    console.log(`📍 Total points in database: ${allPoints.length}\n`);
    
    // Group by region
    for (const region of regions) {
      const pointsInRegion = await Point.find({ region: region._id });
      console.log(`\n📍 ${region.name}: ${pointsInRegion.length} points`);
      
      if (pointsInRegion.length > 0) {
        // Category breakdown
        const cats = {};
        pointsInRegion.forEach(p => {
          const c = p.category || 'NO_CATEGORY';
          cats[c] = (cats[c] || 0) + 1;
        });
        
        Object.keys(cats).sort().forEach(cat => {
          console.log(`   ${cat}: ${cats[cat]}`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAll();
