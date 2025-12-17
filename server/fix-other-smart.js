import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOtherByPattern = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const otherPoints = await Point.find({ category: 'Other' });
    console.log(`📍 Found ${otherPoints.length} points with "Other" category\n`);

    const updates = [];

    for (const point of otherPoints) {
      const title = point.title.toLowerCase();
      let newCategory = null;

      // Pattern matching
      if (title.includes('hospital') || title.includes('clinic') || title.includes('medical')) {
        newCategory = 'medical';
      } else if (title.includes('wat ') || title.includes('temple') || title.includes('church') || title.includes('mosque')) {
        newCategory = 'religion';
      } else if (title.includes('yoga') || title.includes('sauna') || title.includes('fitness') || title.includes('gym')) {
        newCategory = 'sports';
      } else if (title.includes('farm') || title.includes('organic')) {
        newCategory = 'culture';
      } else if (title.includes('boutique') || title.includes('market') || title.includes('shop')) {
        newCategory = 'market';
      } else if (title.includes('cafe') || title.includes('restaurant') || title.includes('food')) {
        newCategory = 'cafe';
      } else if (title.includes('workspace') || title.includes('cowork') || title.includes('office')) {
        newCategory = 'workspace';
      }

      if (newCategory) {
        console.log(`✅ ${point.title}`);
        console.log(`   Other → ${newCategory}\n`);
        point.category = newCategory;
        await point.save();
        updates.push({ title: point.title, category: newCategory });
      } else {
        console.log(`⚠️  Couldn't categorize: ${point.title}\n`);
      }
    }

    console.log(`\n✅ Updated ${updates.length} points\n`);

    // Final stats
    const stillOther = await Point.countDocuments({ category: 'Other' });
    console.log(`📊 Points still with "Other": ${stillOther}`);

    // Show final distribution
    const categories = await Point.distinct('category');
    console.log(`\n📊 All categories in use:`);
    for (const cat of categories.sort()) {
      const count = await Point.countDocuments({ category: cat });
      console.log(`   ${cat}: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixOtherByPattern();
