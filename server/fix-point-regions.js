import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Point from './models/Point.js';
import Region from './models/Region.js';

dotenv.config();

const fixPointRegions = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all regions
    const regions = await Region.find({});
    console.log(`\n📍 Found ${regions.length} regions`);

    // Get all points without region ObjectId
    const pointsWithoutRegion = await Point.find({ 
      $or: [
        { region: null },
        { region: { $exists: false } }
      ]
    });

    console.log(`\n🔧 Found ${pointsWithoutRegion.length} points without region ObjectId`);

    let fixed = 0;
    let notFixed = 0;

    for (const point of pointsWithoutRegion) {
      // If point has regionSlug, find the region
      if (point.regionSlug) {
        const region = regions.find(r => r.slug === point.regionSlug);
        if (region) {
          point.region = region._id;
          await point.save();
          console.log(`✅ Fixed: ${point.title} -> ${region.name}`);
          fixed++;
        } else {
          console.log(`❌ Region not found for slug: ${point.regionSlug} (${point.title})`);
          notFixed++;
        }
      } else {
        console.log(`⚠️  No regionSlug: ${point.title}`);
        notFixed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Fixed: ${fixed}`);
    console.log(`  ❌ Not fixed: ${notFixed}`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixPointRegions();
