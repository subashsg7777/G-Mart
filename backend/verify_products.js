const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/GmartDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const totalCount = await Product.countDocuments();
  console.log('\n✅ DATABASE VERIFICATION\n');
  console.log(`Total products: ${totalCount}`);
  
  // Show category distribution
  console.log('\n📊 PRODUCTS BY CATEGORY:');
  const categories = ['Shoes', 'Mobile Phones', 'Laptops', 'Headphones', 'Tablets', 'Cameras', 'Smartwatches', 'Monitors', 'Keyboards', 'Mouse', 'Speakers', 'Storage'];
  
  for (const cat of categories) {
    const count = await Product.countDocuments({ cat });
    console.log(`  ${cat}: ${count}`);
  }
  
  // Show sample products
  console.log('\n📦 SAMPLE PRODUCTS FROM EACH CATEGORY:\n');
  
  for (const cat of categories) {
    const products = await Product.find({ cat }).limit(2).lean();
    if (products.length > 0) {
      console.log(`${cat}:`);
      products.forEach(p => {
        console.log(`  • ${p.name}`);
        console.log(`    Price: $${p.price} | Rating: ${p.stars}/5 | Reviews: ${p.count}`);
        console.log(`    Brand: ${p.brand} | Vendor: ${p.vendor}`);
        console.log(`    Image: ${p.url}`);
      });
    }
  }
  
  process.exit(0);
}).catch(e => {
  console.log('Error:', e.message);
  process.exit(1);
});
