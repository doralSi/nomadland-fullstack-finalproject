import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

// Official categories mapping (old -> new)
const categoryMigration = {
  // Restaurants variations
  'Restaurants': 'restaurant',
  'Restaurant': 'restaurant',
  'restaurants': 'restaurant',
  'restaurant': 'restaurant',
  'food': 'restaurant',
  
  // Cafes variations
  'Cafes': 'cafe',
  'Cafe': 'cafe',
  'cafes': 'cafe',
  'cafe': 'cafe',
  'coffee': 'cafe',
  
  // Beaches variations
  'Beaches': 'beach',
  'Beach': 'beach',
  'beaches': 'beach',
  'beach': 'beach',
  
  // Viewpoints variations
  'Viewpoints': 'viewpoint',
  'Viewpoint': 'viewpoint',
  'viewpoints': 'viewpoint',
  'viewpoint': 'viewpoint',
  'lookout': 'viewpoint',
  
  // Markets variations
  'Markets': 'market',
  'Market': 'market',
  'markets': 'market',
  'market': 'market',
  'shopping': 'market',
  
  // Trails variations
  'Trails': 'trail',
  'Trail': 'trail',
  'trails': 'trail',
  'trail': 'trail',
  'hiking': 'trail',
  
  // Coworking/Workspace variations
  'Coworking': 'workspace',
  'coworking': 'workspace',
  'Workspace': 'workspace',
  'workspace': 'workspace',
  'laptop': 'workspace',
  
  // Activities variations
  'Activities': 'sports',
  'activities': 'sports',
  'Sports': 'sports',
  'sports': 'sports',
  'sport': 'sports',
  
  // Nature variations
  'Nature': 'viewpoint', // Map nature to viewpoint as closest match
  'nature': 'viewpoint',
  
  // Medical variations
  'Medical': 'medical',
  'medical': 'medical',
  'hospital': 'medical',
  
  // Culture variations
  'Culture': 'culture',
  'culture': 'culture',
  
  // Kids variations
  'Kids': 'kids',
  'kids': 'kids',
  'baby': 'kids',
  
  // Pool variations
  'Pool': 'pool',
  'pool': 'pool',
  
  // Transit variations
  'Transit': 'transit',
  'transit': 'transit',
  
  // Religion variations
  'Religion': 'religion',
  'religion': 'religion',
  'Religious Site': 'religion',
  
  // Spring variations
  'Spring': 'spring',
  'spring': 'spring',
  'water': 'spring',
  
  // Other/Unknown
  'Other': null, // Will be handled separately
  'other': null,
  'Uncategorized': null,
  'uncategorized': null
};

// Official categories from constants/categories.js
const validCategories = [
  'trail',
  'spring',
  'viewpoint',
  'beach',
  'restaurant',
  'cafe',
  'culture',
  'market',
  'pool',
  'transit',
  'workspace',
  'kids',
  'medical',
  'sports',
  'religion'
];

const migrateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allPoints = await Point.find({});
    console.log(`📍 Total points to check: ${allPoints.length}\n`);

    let updated = 0;
    let noCategory = 0;
    let alreadyCorrect = 0;
    const updates = [];

    for (const point of allPoints) {
      const oldCategory = point.category;
      
      if (!oldCategory) {
        noCategory++;
        console.log(`⚠️  No category: ${point.title}`);
        continue;
      }

      // Check if already using valid category
      if (validCategories.includes(oldCategory)) {
        alreadyCorrect++;
        continue;
      }

      // Try to migrate
      const newCategory = categoryMigration[oldCategory];
      
      if (newCategory) {
        point.category = newCategory;
        await point.save();
        updated++;
        updates.push({
          title: point.title,
          old: oldCategory,
          new: newCategory
        });
      } else if (newCategory === null) {
        // Category is "Other" or unmapped
        console.log(`⚠️  Unknown category "${oldCategory}" for: ${point.title}`);
        noCategory++;
      } else {
        console.log(`⚠️  No migration rule for "${oldCategory}" for: ${point.title}`);
        noCategory++;
      }
    }

    console.log(`\n✅ Migration complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`   Already correct: ${alreadyCorrect}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   No category/Unknown: ${noCategory}`);
    console.log(`   Total: ${allPoints.length}\n`);

    if (updates.length > 0 && updates.length <= 50) {
      console.log('📝 Updates made:');
      updates.forEach((u, i) => {
        console.log(`${i+1}. ${u.title}`);
        console.log(`   "${u.old}" → "${u.new}"`);
      });
    } else if (updates.length > 50) {
      console.log(`📝 ${updates.length} points were updated (too many to list)`);
    }

    // Show final distribution
    const finalCounts = {};
    const finalPoints = await Point.find({});
    finalPoints.forEach(p => {
      const cat = p.category || 'NO_CATEGORY';
      finalCounts[cat] = (finalCounts[cat] || 0) + 1;
    });

    console.log(`\n📊 Final category distribution:`);
    Object.keys(finalCounts).sort().forEach(cat => {
      const isValid = validCategories.includes(cat);
      const icon = isValid ? '✅' : '⚠️';
      console.log(`   ${icon} ${cat}: ${finalCounts[cat]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migrateCategories();
