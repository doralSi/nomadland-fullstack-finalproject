import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

const fixLastThree = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fix by partial name match
    const updates = [
      { pattern: /Wallaby Werks/i, category: 'workspace' },
      { pattern: /Wonderland Healing/i, category: 'sports' }, // wellness/healing center
      { pattern: /Tahini House/i, category: 'restaurant' }
    ];

    for (const update of updates) {
      const point = await Point.findOne({ 
        title: update.pattern,
        category: 'Other'
      });

      if (point) {
        console.log(`✅ Updating: ${point.title}`);
        console.log(`   Other → ${update.category}\n`);
        point.category = update.category;
        await point.save();
      }
    }

    // Final verification
    const stillOther = await Point.countDocuments({ category: 'Other' });
    console.log(`\n📊 Points still with "Other": ${stillOther}`);

    if (stillOther === 0) {
      console.log('🎉 All points have been categorized!\n');
    }

    // Show final distribution
    const validCategories = [
      'trail', 'spring', 'viewpoint', 'beach', 'restaurant', 'cafe',
      'culture', 'market', 'pool', 'transit', 'workspace', 'kids',
      'medical', 'sports', 'religion'
    ];

    console.log('📊 Final category distribution:\n');
    for (const cat of validCategories) {
      const count = await Point.countDocuments({ category: cat });
      if (count > 0) {
        console.log(`   ✅ ${cat}: ${count}`);
      }
    }

    const other = await Point.countDocuments({ category: 'Other' });
    if (other > 0) {
      console.log(`   ⚠️ Other: ${other}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixLastThree();
