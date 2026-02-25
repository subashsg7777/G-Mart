const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected\n');
    
    const products = await Product.find().select('name price stars cat').lean();
    
    console.log(`Total Products: ${products.length}\n`);
    console.log('ALL PRODUCTS:\n');
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   Price: $${p.price} | Rating: ${p.stars}⭐ | Category: ${p.cat}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

checkDB();
