import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EventTemplate from './models/EventTemplate.js';

dotenv.config();

async function checkEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const events = await EventTemplate.find({});
    console.log(`📊 Total events in database: ${events.length}`);
    
    if (events.length > 0) {
      console.log('\n📅 Events:');
      events.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   Start Date: ${event.startDate}`);
        console.log(`   End Date: ${event.endDate}`);
        console.log(`   Time: ${event.time}`);
        console.log(`   Recurrence: ${event.recurrenceType}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEvents();
