import './config/db.js';
import Point from './models/Point.js';
import Region from './models/Region.js';

async function checkCategories() {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const kohPhangan = await Region.findOne({ slug: 'koh-phangan' });
    
    if (!kohPhangan) {
      console.log('❌ Region not found');
      process.exit(1);
    }
    
    console.log(`✅ Found: ${kohPhangan.name}\n`);
    
    const points = await Point.find({ region: kohPhangan._id }).select('name category');
    
    console.log(`Total points: ${points.length}\n`);
    
    // Group by category
    const byCategory = {};
    points.forEach(p => {
      const cat = p.category || 'NO CATEGORY';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p.name);
    });
    
    // Show breakdown
    console.log('📊 Category breakdown:\n');
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`${cat}: ${byCategory[cat].length} points`);
      if (cat === 'NO CATEGORY' || byCategory[cat].length < 10) {
        byCategory[cat].forEach(name => {
          console.log(`  - ${name}`);
        });
      }
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCategories();
