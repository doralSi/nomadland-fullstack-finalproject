import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPointsStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const total = await Point.countDocuments({});
    const privatePoints = await Point.countDocuments({ isPrivate: true });
    const publicPoints = await Point.countDocuments({ isPrivate: false });

    console.log(`\n📊 Points Status:`);
    console.log(`  Total: ${total}`);
    console.log(`  Public: ${publicPoints}`);
    console.log(`  Private: ${privatePoints}`);

    if (privatePoints > 0) {
      console.log(`\n🔓 Making all points public...`);
      const result = await Point.updateMany(
        { isPrivate: true },
        { $set: { isPrivate: false } }
      );
      console.log(`✅ Updated ${result.modifiedCount} points to public`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPointsStatus();
