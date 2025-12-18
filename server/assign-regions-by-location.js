import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Point from './models/Point.js';
import Region from './models/Region.js';
import { isInsidePolygon } from './utils/isInsidePolygon.js';

dotenv.config();

const assignRegionsByLocation = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all regions with polygons
    const regions = await Region.find({});
    console.log(`\n📍 Found ${regions.length} regions`);

    // Get all points without region
    const pointsWithoutRegion = await Point.find({ 
      $or: [
        { region: null },
        { region: { $exists: false } }
      ]
    });

    console.log(`\n🔧 Found ${pointsWithoutRegion.length} points to fix`);

    let assigned = 0;
    let notAssigned = 0;

    for (const point of pointsWithoutRegion) {
      let foundRegion = null;

      // Check each region to see if point is inside
      for (const region of regions) {
        if (region.polygon && region.polygon.coordinates && region.polygon.coordinates.length > 0) {
          const polygon = region.polygon.coordinates[0]; // First ring
          
          // Check if point is inside this region's polygon
          if (isInsidePolygon({ lat: point.lat, lng: point.lng }, polygon)) {
            foundRegion = region;
            break;
          }
        }
      }

      if (foundRegion) {
        point.region = foundRegion._id;
        point.regionSlug = foundRegion.slug;
        await point.save();
        console.log(`✅ Assigned: ${point.title} -> ${foundRegion.name}`);
        assigned++;
      } else {
        console.log(`❌ No region found for: ${point.title} (${point.lat}, ${point.lng})`);
        notAssigned++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Assigned: ${assigned}`);
    console.log(`  ❌ Not assigned: ${notAssigned}`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

assignRegionsByLocation();
