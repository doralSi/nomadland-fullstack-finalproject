import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Point from './models/Point.js';
import PersonalMap from './models/PersonalMap.js';

dotenv.config();

async function makeMapPointsPublic(mapId) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log(`🗺️  Finding map: ${mapId}...`);
    const map = await PersonalMap.findById(mapId);
    
    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }
    
    console.log(`✅ Map found: "${map.title}"`);
    console.log(`📍 Points in map: ${map.pointIds.length}`);

    console.log('\n🔄 Updating points to public...\n');
    
    const result = await Point.updateMany(
      { _id: { $in: map.pointIds } },
      { $set: { isPrivate: false } }
    );

    console.log('='.repeat(60));
    console.log('✨ Update Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Points updated: ${result.modifiedCount}`);
    console.log(`✅ All points are now PUBLIC`);
    console.log('='.repeat(60));

    mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Usage
const mapId = process.argv[2];

if (!mapId) {
  console.log('\n📖 Usage: node make-map-points-public.js <map-id>');
  console.log('\nExample:');
  console.log('  node make-map-points-public.js 6942dac963cd2797bc51c8f2\n');
  process.exit(1);
}

makeMapPointsPublic(mapId);
