import mongoose from 'mongoose';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const checkRegions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const regions = await Region.find({});
    console.log(`\n📍 Found ${regions.length} regions:\n`);

    regions.forEach(region => {
      console.log(`Region: ${region.name} (${region.slug})`);
      console.log(`  Center: ${region.center.lat}, ${region.center.lng}`);
      console.log(`  Zoom: ${region.zoom}`);
      console.log(`  Polygon: ${region.polygon ? `${region.polygon.length} points` : 'NO POLYGON'}`);
      if (region.polygon && region.polygon.length > 0) {
        console.log(`  First point: [${region.polygon[0][0]}, ${region.polygon[0][1]}]`);
      }
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkRegions();
