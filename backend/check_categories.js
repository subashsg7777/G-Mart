const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/GmartDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  // Get distinct categories
  const categories = await Product.distinct('cat');
  console.log('\n📋 ACTUAL CATEGORIES IN DATABASE:\n');
  categories.forEach(cat => console.log(`  - "${cat}"`));
  
  // Test the regex that's used in search
  const testPatterns = {
    shoe: /\b(shoe|shoes|sneaker|boot|footwear|trainer|pumps?)\b/i,
    phone: /\b(phone|smartphone|mobile|iphone|android)\b/i,
    laptop: /\b(laptop|notebook|computer|macbook|ultrabook)\b/i,
    headphone: /\b(headphone|headphones|earphone|earbud|earbuds|airpod|speaker|audio)\b/i,
  };
  
  console.log('\n🔍 PATTERN MATCHING TESTS:\n');
  
  for (const [key, pattern] of Object.entries(testPatterns)) {
    console.log(`Pattern "${key}":`);
    for (const cat of categories) {
      if (cat && pattern.test(cat)) {
        const count = await Product.countDocuments({ cat });
        console.log(`  ✅ Matches "${cat}" (${count} products)`);
      }
    }
  }
  
  process.exit(0);
}).catch(e => {
  console.log('Error:', e.message);
  process.exit(1);
});
