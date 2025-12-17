import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

async function getUsers() {
  try {
    await connectDB();
    
    const users = await User.find({}).select('_id username email role createdAt').sort({ createdAt: -1 });
    
    console.log('\n📋 All Users in the system:\n');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user._id}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log('-'.repeat(80));
    });
    
    if (users.length === 0) {
      console.log('⚠️  No users found in the database');
    } else {
      console.log(`\n✅ Total users: ${users.length}\n`);
      console.log('💡 To import KML, use:');
      console.log(`   node import-kml.js koh-phangan.kml <USER_ID> "קו פאנגן - המלצות" "המלצות רותם"\n`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

getUsers();
