import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const checkKohPhanganCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const kohPhangan = await Region.findOne({ slug: 'koh-phangan' });
    const points = await Point.find({ region: kohPhangan._id });

    console.log(`📍 Total points in Koh Phangan: ${points.length}\n`);

    // Group by category
    const byCategory = {};
    points.forEach(p => {
      const cat = p.category || 'NO_CATEGORY';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p.title);
    });

    console.log('📊 Category breakdown:\n');
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`${cat}: ${byCategory[cat].length} points`);
      // Show first few examples
      byCategory[cat].slice(0, 3).forEach(name => {
        console.log(`   - ${name}`);
      });
      if (byCategory[cat].length > 3) {
        console.log(`   ... and ${byCategory[cat].length - 3} more`);
      }
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkKohPhanganCategories();
