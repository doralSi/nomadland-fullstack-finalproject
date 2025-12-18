import mongoose from 'mongoose';
import Point from './models/Point.js';
import dotenv from 'dotenv';

dotenv.config();

const countPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Point.countDocuments({});
    console.log(`\n📊 Total points in database: ${count}`);

    if (count > 0) {
      const byRegion = await Point.aggregate([
        {
          $group: {
            _id: '$region',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      console.log('\n📍 Points by region:');
      byRegion.forEach(r => {
        console.log(`  ${r._id || 'No region'}: ${r.count} points`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countPoints();
