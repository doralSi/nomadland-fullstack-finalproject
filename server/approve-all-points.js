import mongoose from 'mongoose';
import Point from './models/Point.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const approveAllPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const result = await Point.updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} points to approved status`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

approveAllPoints();
