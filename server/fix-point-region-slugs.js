import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixPointRegionSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const Region = mongoose.model('Region', new mongoose.Schema({
      name: String,
      slug: String
    }));
    
    const Point = mongoose.model('Point', new mongoose.Schema({
      title: String,
      region: mongoose.Schema.Types.ObjectId,
      regionSlug: String
    }, { strict: false }));

    // Get all regions
    const regions = await Region.find({});
    console.log(`📌 Found ${regions.length} regions\n`);

    let updatedCount = 0;

    for (const region of regions) {
      // Find points with this region ObjectId but missing regionSlug
      const pointsToFix = await Point.find({
        region: region._id,
        $or: [
          { regionSlug: { $exists: false } },
          { regionSlug: null },
          { regionSlug: '' }
        ]
      });

      if (pointsToFix.length > 0) {
        console.log(`🔧 Fixing ${pointsToFix.length} points for region: ${region.name} (${region.slug})`);
        
        for (const point of pointsToFix) {
          await Point.updateOne(
            { _id: point._id },
            { $set: { regionSlug: region.slug } }
          );
          console.log(`   ✓ Updated point: ${point.title}`);
          updatedCount++;
        }
        console.log('');
      }
    }

    console.log(`\n✅ Fixed ${updatedCount} points`);
    
    // Verify
    console.log('\n📊 Verification:');
    for (const region of regions) {
      const count = await Point.countDocuments({ regionSlug: region.slug });
      console.log(`   ${region.name}: ${count} points`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

fixPointRegionSlugs();
