import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const assignRegions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all regions
    const regions = await Region.find({});
    console.log(`\n📍 Found ${regions.length} regions`);

    // Define expanded region boundaries (including surrounding areas)
    const regionBounds = {
      'bansko': {
        minLat: 41.6, maxLat: 42.3,  // Expanded to include Seven Rila Lakes
        minLng: 23.2, maxLng: 23.8,  // Expanded to include wider area
        regionId: null
      },
      'koh-phangan': {
        minLat: 9.65, maxLat: 9.80,
        minLng: 99.95, maxLng: 100.10,
        regionId: null
      }
    };

    // Match regions by slug
    for (const region of regions) {
      const slug = region.slug;
      if (regionBounds[slug]) {
        regionBounds[slug].regionId = region._id;
        console.log(`✅ Matched region: ${slug} -> ${region._id}`);
      }
    }

    // Get all points without a region
    const points = await Point.find({});
    console.log(`\n📌 Processing ${points.length} points...`);

    let updated = 0;
    for (const point of points) {
      const lat = point.location.coordinates[1];
      const lng = point.location.coordinates[0];

      for (const [slug, bounds] of Object.entries(regionBounds)) {
        if (!bounds.regionId) continue;

        if (lat >= bounds.minLat && lat <= bounds.maxLat &&
            lng >= bounds.minLng && lng <= bounds.maxLng) {
          
          point.region = bounds.regionId;
          await point.save();
          updated++;
          console.log(`✅ Assigned ${point.title} to ${slug}`);
          break;
        }
      }
    }

    console.log(`\n✅ Updated ${updated} points with regions`);

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

assignRegions();
