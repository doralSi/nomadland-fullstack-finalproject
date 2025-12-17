import './config/db.js';
import Point from './models/Point.js';
import Region from './models/Region.js';

async function checkCopenhagen() {
  try {
    // Find Copenhagen region
    const copenhagen = await Region.findOne({ 
      $or: [{slug: 'copenhagen'}, {name: /copenhagen/i}] 
    });
    
    console.log('Region found:', copenhagen ? copenhagen.name : 'NOT FOUND');
    
    if (copenhagen) {
      console.log('Region ID:', copenhagen._id);
      console.log('Slug:', copenhagen.slug);
      
      // Find all points in Copenhagen
      const points = await Point.find({ region: copenhagen._id })
        .select('name category')
        .lean();
      
      console.log(`\nTotal points: ${points.length}\n`);
      
      // Group by category
      const byCategory = {};
      points.forEach(point => {
        const cat = point.category || 'No Category';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(point.name);
      });
      
      // Print results
      Object.keys(byCategory).sort().forEach(category => {
        console.log(`\n${category} (${byCategory[category].length}):`);
        byCategory[category].forEach((name, i) => {
          console.log(`  ${i+1}. ${name}`);
        });
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setTimeout(checkCopenhagen, 5000);
