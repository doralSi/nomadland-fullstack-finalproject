import mongoose from 'mongoose';
import Point from './models/Point.js';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

// Approximate region boundaries (lat, lng)
const regionBounds = {
  'koh-phangan': {
    name: 'Koh Phangan',
    minLat: 9.65, maxLat: 9.82,
    minLng: 99.95, maxLng: 100.08
  },
  'pai': {
    name: 'Pai',
    minLat: 19.30, maxLat: 19.45,
    minLng: 98.38, maxLng: 98.48
  },
  'goa': {
    name: 'Goa',
    minLat: 14.90, maxLat: 15.70,
    minLng: 73.70, maxLng: 74.20
  },
  'bansko': {
    name: 'Bansko',
    minLat: 41.70, maxLat: 42.25,
    minLng: 23.30, maxLng: 23.60
  }
};

// Category normalization - disabled to keep client keys
const categoryMap = {};

function findRegionForPoint(lat, lng) {
  for (const [slug, bounds] of Object.entries(regionBounds)) {
    if (lat >= bounds.minLat && lat <= bounds.maxLat &&
        lng >= bounds.minLng && lng <= bounds.maxLng) {
      return slug;
    }
  }
  return null;
}

const fixPointsRegionsAndCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all regions
    const regions = await Region.find({});
    const regionMap = {};
    regions.forEach(r => {
      regionMap[r.slug] = r._id;
    });

    console.log('🌍 Available regions:');
    Object.keys(regionMap).forEach(slug => {
      console.log(`   - ${slug}`);
    });
    console.log('');

    // Get all points without region
    const pointsToFix = await Point.find({
      $or: [
        { region: { $exists: false } },
        { region: null }
      ]
    });

    console.log(`📍 Found ${pointsToFix.length} points without region\n`);

    let fixed = 0;
    let categoriesFixed = 0;
    const byRegion = {};

    for (const point of pointsToFix) {
      let updated = false;

      // Fix region
      if (!point.region) {
        const regionSlug = findRegionForPoint(point.lat, point.lng);
        if (regionSlug && regionMap[regionSlug]) {
          point.region = regionMap[regionSlug];
          byRegion[regionSlug] = (byRegion[regionSlug] || 0) + 1;
          updated = true;
          fixed++;
        }
      }

      // Fix category
      if (point.category) {
        const normalizedCat = categoryMap[point.category.toLowerCase()];
        if (normalizedCat && normalizedCat !== point.category) {
          console.log(`   Fixing category: "${point.category}" → "${normalizedCat}" for ${point.title}`);
          point.category = normalizedCat;
          updated = true;
          categoriesFixed++;
        }
      }

      if (updated) {
        await point.save();
      }
    }

    console.log(`\n✅ Fixed ${fixed} points with regions`);
    console.log(`✅ Fixed ${categoriesFixed} categories\n`);

    console.log('📊 Points assigned to regions:');
    Object.keys(byRegion).forEach(slug => {
      console.log(`   ${slug}: ${byRegion[slug]} points`);
    });

    // Show final stats
    console.log('\n📊 Final verification:');
    for (const region of regions) {
      const count = await Point.countDocuments({ region: region._id });
      console.log(`   ${region.name}: ${count} points`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPointsRegionsAndCategories();
