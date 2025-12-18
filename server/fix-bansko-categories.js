import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

// מיפוי ידני של שם -> קטגוריה (key)
const manualCategoryMap = {
  'Pirin National Park Tourist Information Centre': 'transit',
  'Hidden eco trail‏': 'trail',
  'Bansko Gondola Ski Lift': 'transit',
  'Извори‏': 'spring',
  'Sitan Kale - Ruins of a Thracian Fortress‏': 'viewpoint',
  'Belizmata Dam‏': 'spring',
  'Рибарска Среща (Fisherman\'s meet)‏': 'spring',
  'BBQ Restaurant Picnic‏': 'restaurant',
  'St Nikola Church and Archaeological site‏': 'religion',
  'Dobrinishte Bus Station‏': 'transit',
  'Baikushev\'s pine‏': 'viewpoint',
  'Banderitsa Camping‏': 'trail',
  'Vihren Chalet‏': 'trail',
  'Бъндеришко езеро "Окото"‏': 'spring',
  'Lake Muratovo‏': 'spring',
  'Ribno ("Fish") Banderishko Lake‏': 'spring',
  'Frog Lake‏': 'spring',
  'Long Banderitsa Lake‏': 'spring',
  'Todorka Lakes‏': 'spring',
  'Demyanitsa Hut‏': 'trail',
  'Валявишки езера‏': 'spring',
  'Popovo Lake‏': 'spring',
  'Bezbog Lake‏': 'spring',
  'Lake Bezbog Lift-Upper Station‏': 'transit',
  'Bezbog Hut‏': 'trail',
  'Lake Bezbog Lift-Bottom Station‏': 'transit',
  'Sinanishko Lake‏': 'spring',
  'Vihren‏': 'viewpoint',
  'Seven Rila Lakes Lift-Bottom Station‏': 'transit',
  'Rila Lakes Chalet‏': 'trail',
  'Chalet Seven Lakes‏': 'trail',
  'שבעת אגמי רילה': 'spring',
  'Lake Peak (2657 mamsl)': 'viewpoint',
  'Okoto (lanaw)': 'spring',
};

const fixBanskoCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const points = await Point.find({
      lat: { $gte: 41.7, $lte: 42.3 },
      lng: { $gte: 23.3, $lte: 23.6 }
    });
    let updated = 0;

    for (const point of points) {
      const newCat = manualCategoryMap[point.title];
      if (newCat && point.category !== newCat) {
        console.log(`✔️  ${point.title}: ${point.category} → ${newCat}`);
        point.category = newCat;
        await point.save();
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} Bansko points to manual categories\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixBanskoCategories();
