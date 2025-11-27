import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const promoteUserToMapRanger = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    user.role = 'mapRanger';
    await user.save();

    console.log(`✅ User ${user.name} promoted to mapRanger!`);
    console.log(`New role: ${user.role}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node promote-map-ranger.js <user-email>');
  console.log('Example: node promote-map-ranger.js user@example.com');
  process.exit(1);
}

promoteUserToMapRanger(email);
