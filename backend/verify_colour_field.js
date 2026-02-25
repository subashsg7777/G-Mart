const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb');
    
    // Get a sample product with colour
    const product = await Product.findOne({ colour: { $exists: true, $ne: null } }).lean();
    
    console.log('📦 PRODUCT WITH COLOUR FIELD:');
    console.log(JSON.stringify({
      name: product.name,
      price: product.price,
      cat: product.cat,
      colour: product.colour,
      brand: product.brand,
      rating: product.rating,
      reviews: product.reviews,
      variant: product.variant
    }, null, 2));
    
    // Count products with colour
    const withColour = await Product.countDocuments({ colour: { $exists: true, $ne: null } });
    console.log(`\n✅ Products with colour field: ${withColour}`);
    
    // Total count
    const total = await Product.countDocuments();
    console.log(`📊 Total products in database: ${total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
