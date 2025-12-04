import mongoose from 'mongoose';
import Point from './models/Point.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const points = await Point.find({}).populate('createdBy', 'name email');
    
    console.log(`📍 Total points: ${points.length}\n`);
    
    points.forEach((point, index) => {
      console.log(`${index + 1}. ${point.title}`);
      console.log(`   Status: ${point.status}`);
      console.log(`   Location: [${point.lat}, ${point.lng}]`);
      console.log(`   Category: ${point.category}`);
      console.log(`   Created by: ${point.createdBy?.name || point.createdBy?.email || 'Unknown'}`);
      console.log(`   Created at: ${point.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPoints();
