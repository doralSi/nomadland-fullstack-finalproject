import mongoose from 'mongoose';
import Region from './models/Region.js';
import dotenv from 'dotenv';

dotenv.config();

const updatePaiPolygon = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const newPolygon = [
      [99.19646746562154, 20.08369086628781],
      [98.94839879927338, 19.87120424699384],
      [98.6711247572137, 19.809105056454584],
      [98.33562462300819, 19.788385576344226],
      [97.99964550078636, 19.88502355909884],
      [97.8390695374423, 19.685880794351903],
      [97.72236272771443, 19.238575045753436],
      [97.67858781444284, 19.100708619196027],
      [97.64218529831845, 18.87298830004957],
      [97.66406987272012, 18.64496951281997],
      [97.48871465804092, 18.63108834113308],
      [97.26267205301144, 18.65187492727584],
      [97.48136657214019, 18.229458251430927],
      [97.59049223695632, 17.93079944142299],
      [97.95567447841597, 17.652930224528333],
      [98.99227988509472, 17.68760040009178],
      [99.99265458788767, 17.791713332559766],
      [100.21863648422823, 18.028171823846904],
      [100.23311736164396, 19.00415100071119],
      [100.12376884015549, 19.631056791003758],
      [99.93388650250137, 20.056704469259245],
      [99.4810016276142, 20.02879837520635],
      [99.19646746562154, 20.08369086628781]
    ];

    const result = await Region.updateOne(
      { slug: 'pai' },
      { 
        $set: { 
          polygon: newPolygon,
          center: { lat: 19.3, lng: 98.6 }
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Pai region not found');
      process.exit(1);
    }

    console.log(`✅ Updated Pai polygon (${newPolygon.length} points)`);
    console.log(`✅ Updated Pai center to: 19.3, 98.6`);

    // Verify the update
    const pai = await Region.findOne({ slug: 'pai' });
    console.log(`\n📍 Verified Pai Region:`);
    console.log(`   Name: ${pai.name}`);
    console.log(`   Center: ${pai.center.lat}, ${pai.center.lng}`);
    console.log(`   Polygon points: ${pai.polygon.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updatePaiPolygon();
