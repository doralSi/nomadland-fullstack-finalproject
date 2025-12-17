import './config/db.js';
import Point from './models/Point.js';
import Region from './models/Region.js';

async function updateCategories() {
  try {
    console.log('🔍 Searching for Koh Phangan region...');
    
    const kohPhangan = await Region.findOne({ 
      $or: [{slug: 'koh-phangan'}, {name: /koh.*phangan/i}] 
    });
    
    if (!kohPhangan) {
      console.log('❌ Koh Phangan region not found');
      process.exit(1);
    }
    
    console.log(`✅ Found region: ${kohPhangan.name} (${kohPhangan.slug})`);
    
    // Get all points
    const points = await Point.find({ region: kohPhangan._id });
    console.log(`\n📍 Total points: ${points.length}`);
    
    // Category mapping based on name patterns
    const categoryRules = [
      // Restaurants & Food
      { pattern: /restaurant|food|eat|kitchen|grill|bistro|diner|eatery/i, category: 'Restaurants' },
      { pattern: /cafe|coffee|bakery|tea|bubble tea/i, category: 'Cafes' },
      
      // Activities
      { pattern: /yoga|gym|fitness|sport|dive|diving|snorkel|kayak|massage|spa|sauna|meditation/i, category: 'Activities' },
      { pattern: /kindergarten|school|kid|children|playground/i, category: 'Activities' },
      { pattern: /zoo|animal|monkey/i, category: 'Activities' },
      
      // Beaches
      { pattern: /beach|haad|bay|shore/i, category: 'Beaches' },
      
      // Markets
      { pattern: /market|bazaar|shopping/i, category: 'Markets' },
      
      // Viewpoints & Nature
      { pattern: /viewpoint|view point|lookout|panorama|scenic|overlook/i, category: 'Viewpoints' },
      { pattern: /waterfall|falls|namtok|cascade|park|nature|trail|trek|hiking|forest/i, category: 'Nature' },
      { pattern: /mountain|hill|peak/i, category: 'Viewpoints' },
      
      // Coworking
      { pattern: /cowork|co-work|workspace|work space|remote work/i, category: 'Coworking' },
      
      // Medical & Services
      { pattern: /hospital|clinic|medical|doctor|health/i, category: 'Other' },
      { pattern: /temple|wat|shrine|church|mosque/i, category: 'Other' },
      { pattern: /hotel|resort|bungalow|hostel|accommodation/i, category: 'Accommodation' },
      { pattern: /bar|pub|club|nightlife|lounge/i, category: 'Nightlife' },
      { pattern: /shop|store|boutique|organic|farm/i, category: 'Shopping' },
    ];
    
    let updated = 0;
    const updates = [];
    
    for (const point of points) {
      let newCategory = point.category;
      
      // Check if needs categorization
      if (!point.category || point.category === 'Other' || point.category === 'Uncategorized') {
        // Try to find matching category
        for (const rule of categoryRules) {
          if (rule.pattern.test(point.name) || rule.pattern.test(point.description || '')) {
            newCategory = rule.category;
            break;
          }
        }
      }
      
      // Update if category changed
      if (newCategory !== point.category) {
        updates.push({
          id: point._id,
          name: point.name,
          oldCategory: point.category || 'None',
          newCategory: newCategory
        });
        
        point.category = newCategory;
        await point.save();
        updated++;
      }
    }
    
    console.log(`\n✅ Updated ${updated} points\n`);
    
    if (updates.length > 0) {
      console.log('📝 Updates made:');
      updates.forEach((u, i) => {
        console.log(`${i+1}. ${u.name}`);
        console.log(`   ${u.oldCategory} → ${u.newCategory}\n`);
      });
    }
    
    // Show final category breakdown
    const finalCounts = {};
    const finalPoints = await Point.find({ region: kohPhangan._id });
    finalPoints.forEach(p => {
      const cat = p.category || 'No Category';
      finalCounts[cat] = (finalCounts[cat] || 0) + 1;
    });
    
    console.log('\n📊 Final category breakdown:');
    Object.keys(finalCounts).sort().forEach(cat => {
      console.log(`   ${cat}: ${finalCounts[cat]}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Wait for DB connection
setTimeout(updateCategories, 3000);
