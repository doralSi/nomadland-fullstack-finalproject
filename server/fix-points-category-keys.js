import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

// Mapping from old category names to client keys
const categoryKeyMap = {
  'Restaurants': 'restaurant',
  'Cafes': 'cafe',
  'Markets': 'market',
  'Viewpoints': 'viewpoint',
  'Beaches': 'beach',
  'Trails': 'trail',
  'Activities': 'kids',
  'Culture': 'culture',
  'Coworking': 'workspace',
  'Swimming Pool': 'pool',
  'Sports': 'sports',
  'Medical Center': 'medical',
  'Religious Site': 'religion',
  'Public Transit': 'transit',
  'Other': 'other',
  'Nature': 'spring', // או trail לפי הצורך
  'Kids Zone': 'kids',
  'Workspace': 'workspace',
  'Pool': 'pool',
  'Spring': 'spring',
  'Viewpoint': 'viewpoint',
  'Trail': 'trail',
  'Market': 'market',
  'Restaurant': 'restaurant',
  'Cafe': 'cafe',
  'Beach': 'beach',
  'Culture': 'culture',
  'Sports': 'sports',
  'Religion': 'religion',
  'Medical': 'medical',
  'Transit': 'transit',
};

const fixPointCategoriesToKeys = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const points = await Point.find({});
    let updated = 0;

    for (const point of points) {
      const origCat = point.category;
      const newCat = categoryKeyMap[origCat] || categoryKeyMap[origCat?.trim()] || null;
      if (newCat && origCat !== newCat) {
        console.log(`✔️  ${point.title}: ${origCat} → ${newCat}`);
        point.category = newCat;
        await point.save();
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} points to client category keys\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPointCategoriesToKeys();
