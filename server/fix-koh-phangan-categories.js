import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

// Manual mapping for Koh Phangan special cases
const kohPhanganMapping = {
  // מסעדות עם בריכה -> pool במקום restaurant
  'Coco Locco‏': 'pool',
  'Tomorrow X‏': 'pool',
  'Longtail': 'pool',
  'Bluerama‏‏': 'pool',
  'The Yoga House‏': 'pool',
  'Common Grounds Coffee': 'pool',
  'The Pool Deck': 'pool',
  'High Life Bar & Restaurant': 'pool',
  'Sea Love Bungalows': 'pool',
  'Sunset Hill Resort‏': 'pool',
  'Sandy Bay Resort': 'pool',
  'Vagga Bar cafe': 'pool',
  'Secret Mountain Viewpoint‏‏': 'viewpoint', // זה viewpoint לא מסעדה
  'Cookies Salad Resort‏‏': 'pool',
  'Lime N Soda': 'pool',
  'Chaloklum Bay Resort': 'pool',
  'WILD WOOD Beach Fitness': 'sports',
  'The Cabin': 'pool',
  'Orion Cafe‏': 'pool',
  
  // תצפיות שצריכות להישאר viewpoint (כבר תקין)
  'Wat Khao Tham‏': 'culture', // זה מקום תרבות/דת לא תצפית
  
  // מפלים -> spring (כבר תקין)
  'Paradise Waterfall‏‏': 'spring',
  
  // רפואה
  'Koh Phangan Hospital‏': 'medical',
  'Phangan International Hospital by Bangkok hospital samui โรงพยาบาลพะงันอินเตอร์เนชั่นแนล‏': 'medical',
  'Dr. T. Medical Clinic‏': 'medical',
  'First Western Hospital‏': 'medical',
  
  // תרבות/דת
  'Wat Thong Nai Pan‏': 'religion',
  
  // ספורט/יוגה
  'Pyramid/ Chakra Yoga‏': 'sports',
  'Wonderland Healing Center‏': 'sports',
  
  // בתי קפה שצריכים להישאר cafe
  '2C Bar‏': 'cafe', // זה גם בר וגם בית קפה
};

const fixKohPhanganCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    let updated = 0;

    for (const [title, newCategory] of Object.entries(kohPhanganMapping)) {
      const point = await Point.findOne({ title });
      if (point && point.category !== newCategory) {
        console.log(`✔️  ${title}: ${point.category} → ${newCategory}`);
        point.category = newCategory;
        await point.save();
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} Koh Phangan points\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixKohPhanganCategories();
