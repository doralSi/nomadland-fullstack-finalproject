import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

// Point-in-polygon algorithm
function isPointInPolygon(point, polygon) {
  const [lng, lat] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

const assignRegionsByPolygon = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all regions with their polygons
    const regions = await Region.find({});
    console.log(`\n📍 Found ${regions.length} regions with polygons`);

    // Get all points
    const points = await Point.find({});
    console.log(`📌 Processing ${points.length} points...\n`);

    let updated = 0;
    let notMatched = 0;

    for (const point of points) {
      if (!point.lat || !point.lng) {
        console.log(`⚠️  ${point.title} - No valid coordinates`);
        notMatched++;
        continue;
      }

      const lat = point.lat;
      const lng = point.lng;
      let matched = false;

      // Check each region's polygon
      for (const region of regions) {
        if (isPointInPolygon([lng, lat], region.polygon)) {
          point.region = region._id;
          await point.save();
          updated++;
          console.log(`✅ ${point.title} -> ${region.name}`);
          matched = true;
          break;
        }
      }

      if (!matched) {
        notMatched++;
        console.log(`⚠️  ${point.title} (${lat.toFixed(4)}, ${lng.toFixed(4)}) - No matching region`);
      }
    }

    console.log(`\n✅ Updated ${updated} points with regions`);
    console.log(`⚠️  ${notMatched} points without matching region`);

    // Show summary
    const summary = await Point.aggregate([
      {
        $lookup: {
          from: 'regions',
          localField: 'region',
          foreignField: '_id',
          as: 'regionInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$regionInfo.name', 0] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Points by region:');
    summary.forEach(s => {
      console.log(`  ${s._id || 'No region'}: ${s.count} points`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignRegionsByPolygon();
