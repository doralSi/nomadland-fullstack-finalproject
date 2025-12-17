import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

// Manual category assignments for "Other" points
const manualCategories = {
  'Wallaby Werks': 'workspace',
  'Wonderland Healing Center': 'medical',
  'Wat Thong Nai Pan': 'religion',
  'Tahini House': 'restaurant',
  'The Dome Sauna': 'sports',
  'Raitiaviset Organic farm': 'culture',
  'Koh Phangan Hospital': 'medical',
  'Phangan International Hospital by Bangkok hospital samui โรงพยาบาลพะงันอินเตอร์เนชั่นแนล': 'medical',
  'Pyramid/ Chakra Yoga': 'sports',
  'Pims Organic Boutique & Joy of Life Cafe at Pantip Market': 'market',
  'Dr. T. Medical Clinic': 'medical',
  'First Western Hospital': 'medical'
};

const fixOtherCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const otherPoints = await Point.find({ category: 'Other' });
    console.log(`📍 Found ${otherPoints.length} points with "Other" category\n`);

    let updated = 0;

    for (const point of otherPoints) {
      const newCategory = manualCategories[point.title];
      
      if (newCategory) {
        console.log(`✅ Updating: ${point.title}`);
        console.log(`   Other → ${newCategory}`);
        point.category = newCategory;
        await point.save();
        updated++;
      } else {
        console.log(`⚠️  No mapping for: ${point.title}`);
      }
    }

    console.log(`\n✅ Updated ${updated} points\n`);

    // Final verification
    const stillOther = await Point.countDocuments({ category: 'Other' });
    console.log(`📊 Points still with "Other": ${stillOther}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixOtherCategories();
