const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testSearch() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected');
    
    const filters = {
      price: { $gte: 1000, $lte: 2000 },
      $or: [
        { name: { $regex: 'laptop|phone', $options: 'i' } },
        { description: { $regex: 'laptop|phone', $options: 'i' } },
        { cat: { $regex: 'laptop|phone', $options: 'i' } }
      ]
    };
    
    console.log('Searching for laptops and phones $1000-2000...');
    const products = await Product.find(filters).lean();
    
    console.log(`\n✓ Found ${products.length} products:\n`);
    products.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name}`);
      console.log(`     Price: $${p.price} | Rating: ${p.stars}⭐`);
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

testSearch();
