import mongoose from 'mongoose';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const showPaiPolygon = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const pai = await Region.findOne({ slug: 'pai' });
    
    if (!pai) {
      console.log('❌ Pai region not found');
      process.exit(1);
    }

    console.log(`\n📍 Pai Region Details:`);
    console.log(`Name: ${pai.name}`);
    console.log(`Slug: ${pai.slug}`);
    console.log(`Center: ${pai.center.lat}, ${pai.center.lng}`);
    console.log(`Zoom: ${pai.zoom}`);
    console.log(`\n🔷 Polygon (${pai.polygon.length} points):`);
    console.log(JSON.stringify(pai.polygon, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

showPaiPolygon();
