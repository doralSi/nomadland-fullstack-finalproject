import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const checkGoa = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Region = mongoose.model('Region', new mongoose.Schema({
      name: String,
      slug: String
    }));
    
    const Point = mongoose.model('Point', new mongoose.Schema({
      title: String,
      category: String,
      region: mongoose.Schema.Types.ObjectId,
      regionSlug: String,
      isPrivate: Boolean,
      lat: Number,
      lng: Number
    }, { strict: false }));

    const goa = await Region.findOne({ slug: 'goa' });
    
    if (!goa) {
      console.log('❌ Goa region not found');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`✅ Found Goa region:`);
    console.log(`   ID: ${goa._id}`);
    console.log(`   Name: ${goa.name}`);
    console.log(`   Slug: ${goa.slug}\n`);

    const goaPointsByRegionId = await Point.find({ region: goa._id });
    const goaPointsByRegionSlug = await Point.find({ regionSlug: 'goa' });
    
    console.log(`📍 Points in Goa (by region._id): ${goaPointsByRegionId.length}`);
    console.log(`📍 Points in Goa (by regionSlug='goa'): ${goaPointsByRegionSlug.length}\n`);
    
    if (goaPointsByRegionSlug.length > 0) {
      goaPointsByRegionSlug.forEach((p, i) => {
        console.log(`${i+1}. ${p.title} (${p.category || 'no category'}) - regionSlug: '${p.regionSlug}', isPrivate: ${p.isPrivate}`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

checkGoa();
