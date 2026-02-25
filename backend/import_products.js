const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    "name": "Apple iPhone 15 Pro",
    "price": 999,
    "description": "Latest Apple iPhone with A17 Bionic chip and ProMotion display.",
    "stars": 4.8,
    "count": 152,
    "cat": "Mobile Phones",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/iphone15pro.jpg"
  },
  {
    "name": "Samsung Galaxy S24 Ultra",
    "price": 1199,
    "description": "Premium Android phone with an advanced camera system and S Pen support.",
    "stars": 4.8,
    "count": 100,
    "cat": "Mobile Phones",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/samsungs24.jpg"
  },
  {
    "name": "Dell XPS 15",
    "price": 1599,
    "description": "High-performance laptop with Intel Core i7 and 4K OLED display.",
    "stars": 4.7,
    "count": 88,
    "cat": "Laptops",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/dellxps15.jpg"
  },
  {
    "name": "ASUS ROG Strix G16",
    "price": 1899,
    "description": "Powerful gaming laptop with RTX 4070 and high refresh rate display.",
    "stars": 4.6,
    "count": 85,
    "cat": "Laptops",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/asusrog.jpg"
  },
  {
    "name": "LG UltraGear 27GN950",
    "price": 699,
    "description": "4K UHD gaming monitor with 144Hz refresh rate and G-Sync support.",
    "stars": 4.9,
    "count": 60,
    "cat": "Monitors",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/lgutra.jpg"
  },
  {
    "name": "Sony WH-1000XM5",
    "price": 399,
    "description": "Industry-leading noise-canceling headphones with superior sound quality.",
    "stars": 4.8,
    "count": 120,
    "cat": "Accessories",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/sonywh.jpg"
  },
  {
    "name": "Nike Air Zoom Pegasus 39",
    "price": 130,
    "description": "Comfortable and stylish running shoes with responsive cushioning.",
    "stars": 4.7,
    "count": 200,
    "cat": "Shoes",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/nikepeg.jpg"
  },
  {
    "name": "Adidas Ultraboost 22",
    "price": 180,
    "description": "Performance running shoes with Boost cushioning for maximum energy return.",
    "stars": 4.6,
    "count": 180,
    "cat": "Shoes",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/adidasboost.jpg"
  },
  {
    "name": "Samsung 980 Pro SSD 1TB",
    "price": 159,
    "description": "High-speed NVMe SSD with PCIe Gen 4 support for ultra-fast performance.",
    "stars": 4.9,
    "count": 90,
    "cat": "Accessories",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/samsungssd.jpg"
  },
  {
    "name": "Wilson Evolution Basketball",
    "price": 69,
    "description": "Premium indoor basketball with superior grip and feel.",
    "stars": 4.8,
    "count": 50,
    "cat": "Sports",
    "vendor": "subash@mrg.com",
    "url": "https://example.com/wilson.jpg"
  }
];

async function importProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected\n');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products\n');
    
    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`✓ Imported ${result.length} products!\n`);
    
    console.log('IMPORTED PRODUCTS:\n');
    result.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   Price: $${p.price} | Rating: ${p.stars}⭐ | Category: ${p.cat}`);
    });
    
    console.log('\n✓ Database ready for testing!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

importProducts();
