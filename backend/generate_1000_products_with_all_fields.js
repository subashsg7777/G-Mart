const mongoose = require('mongoose');
const Product = require('./models/Product');

// Product data generator with all fields
const categories = {
  'Shoes': {
    brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Asics', 'New Balance', 'Saucony', 'Brooks'],
    types: ['Running', 'Basketball', 'Casual', 'Formal', 'Sports', 'Sneaker'],
    colours: ['Black', 'White', 'Red', 'Blue', 'Gray', 'Navy', 'Brown', 'Green', 'Yellow', 'Orange'],
    variants: ['Size 6', 'Size 7', 'Size 8', 'Size 9', 'Size 10', 'Size 11', 'Size 12']
  },
  'Mobile Phones': {
    brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'POCO', 'Motorola', 'Google'],
    types: ['Flagship', 'Budget', 'Mid-range', 'Pro', 'Ultra'],
    colours: ['Black', 'Silver', 'Gold', 'Blue', 'Purple', 'Green', 'Red', 'White'],
    variants: ['128GB', '256GB', '512GB', '1TB']
  },
  'Laptops': {
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer'],
    types: ['Gaming', 'Business', 'Ultrabook', 'Budget', 'Workstation'],
    colours: ['Silver', 'Black', 'Space Gray', 'Gold', 'Blue', 'White'],
    variants: ['16GB RAM', '32GB RAM', '64GB RAM', '512GB SSD', '1TB SSD']
  },
  'Headphones': {
    brands: ['Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'JBL', 'Beats', 'Bang & Olufsen'],
    types: ['Wireless', 'Noise-Cancelling', 'Studio', 'Gaming', 'Bluetooth'],
    colours: ['Black', 'White', 'Blue', 'Red', 'Gray', 'Silver', 'Rose Gold'],
    variants: ['Wireless', 'Wired', 'Noise-Cancelling', 'Normal Sound']
  },
  'Tablets': {
    brands: ['Apple', 'Samsung', 'iPad', 'Huawei', 'Lenovo', 'Microsoft'],
    types: ['Premium', 'Budget', '10-inch', '12-inch', 'Pro'],
    colours: ['Silver', 'Black', 'Gold', 'Purple', 'Blue'],
    variants: ['64GB', '128GB', '256GB', '512GB']
  },
  'Cameras': {
    brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Olympus', 'Panasonic'],
    types: ['DSLR', 'Mirrorless', 'Compact', 'Action', 'Instant'],
    colours: ['Black', 'Silver', 'White', 'Gray'],
    variants: ['18MP', '24MP', '42MP', 'With Lens', 'Body Only']
  },
  'Smartwatches': {
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Fossil'],
    types: ['Fitness', 'Luxury', 'Sports', 'Budget', 'Health'],
    colours: ['Black', 'Silver', 'Gold', 'Blue', 'Red', 'Navy'],
    variants: ['38mm', '40mm', '42mm', '45mm']
  },
  'Monitors': {
    brands: ['Dell', 'LG', 'ASUS', 'BenQ', 'Samsung', 'Acer'],
    types: ['Gaming', '4K', 'Ultrawide', 'IPS', 'Curved'],
    colours: ['Black', 'Silver', 'White', 'Gray'],
    variants: ['24 inches', '27 inches', '32 inches', '34 inches']
  },
  'Keyboards': {
    brands: ['Corsair', 'Logitech', 'Razer', 'SteelSeries', 'Mechanical', 'Das'],
    types: ['Mechanical', 'Wireless', 'Gaming', 'Budget', 'Ergonomic'],
    colours: ['Black', 'White', 'Gray', 'RGB', 'Silver'],
    variants: ['Mechanical', 'Membrane', 'Wireless', 'Wired']
  },
  'Mouse': {
    brands: ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Microsoft'],
    types: ['Gaming', 'Wireless', 'Ergonomic', 'Budget', 'High-DPI'],
    colours: ['Black', 'White', 'Gray', 'Red', 'Blue'],
    variants: ['Wireless', 'Wired', '3200 DPI', '12000 DPI']
  },
  'Speakers': {
    brands: ['JBL', 'Sony', 'Bose', 'Harman Kardon', 'Beats', 'Marshall'],
    types: ['Portable', 'Bluetooth', 'Studio', 'Home', 'Party'],
    colours: ['Black', 'White', 'Blue', 'Red', 'Gray', 'Silver'],
    variants: ['Bluetooth', 'Wired', 'Portable', 'Home Theater']
  },
  'Storage': {
    brands: ['Samsung', 'Western Digital', 'Seagate', 'Kingston', 'Crucial'],
    types: ['SSD', 'HDD', 'External', 'NVMe', 'Portable'],
    colours: ['Black', 'Silver', 'White', 'Gray'],
    variants: ['256GB', '512GB', '1TB', '2TB', '4TB']
  }
};

const descriptions = [
  'High-quality product with excellent performance and durability',
  'Premium features at an affordable price point',
  'Trusted brand with outstanding customer reviews',
  'Perfect for everyday use and professional applications',
  'Engineered for superior comfort and reliability',
  'Latest technology with innovative design',
  'Exceptional value with premium build quality',
  'Ideal choice for enthusiasts and professionals alike',
  'Advanced features with user-friendly interface',
  'Sleek design combined with powerful performance',
  'Long-lasting batteries and reliable operation',
  'Industry-leading innovation and quality',
  'Best-in-class features at competitive pricing',
  'Superior build quality with modern aesthetics',
  'Perfect balance of performance and affordability'
];

const vendors = ['Amazon', 'Flipkart', 'eBay', 'Myntra', 'Best Buy', 'Walmart', 'TataCliq', 'Snapdeal', 'zon.com', 'retail.shop'];

// Generate realistic image URLs
function generateImageUrl(category, brand, productType) {
  const imageIds = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/400/300?random=${imageIds}&product=${productType}`;
}

// Generate a single product with all fields
function generateProduct(categoryName, index) {
  const categoryData = categories[categoryName];
  const brand = categoryData.brands[Math.floor(Math.random() * categoryData.brands.length)];
  const type = categoryData.types[Math.floor(Math.random() * categoryData.types.length)];
  const colour = categoryData.colours[Math.floor(Math.random() * categoryData.colours.length)];
  const variant = categoryData.variants[Math.floor(Math.random() * categoryData.variants.length)];
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  
  const productName = `${brand} ${type} ${categoryName.replace(/s$/, '')} - ${colour} - Model ${Math.floor(Math.random() * 9000) + 1000}`;
  const basePrice = Math.random() * 50000 + 50; // Between ₹50 and ₹50,050
  const discount = Math.floor(Math.random() * 40); // 0-40% discount
  const finalPrice = Math.floor(basePrice * (1 - discount / 100));
  const rating = (Math.random() * 1.0 + 3.5).toFixed(1); // 3.5-4.5 stars
  const reviews = Math.floor(Math.random() * 5000 + 50); // 50-5050 reviews
  const stars = parseFloat(rating);
  
  // Generate history and datehistory
  const history = [];
  const datehistory = [];
  const historyCount = Math.floor(Math.random() * 5) + 1; // 1-5 history entries
  
  for (let i = 0; i < historyCount; i++) {
    const daysAgo = Math.floor(Math.random() * 365) + 1;
    const historyPrice = Math.floor(basePrice * (1 - Math.random() * 0.3)); // Price variations
    history.push(historyPrice);
    const historyDate = new Date();
    historyDate.setDate(historyDate.getDate() - daysAgo);
    datehistory.push(historyDate);
  }
  
  return {
    name: productName,
    price: finalPrice,
    description: descriptions[Math.floor(Math.random() * descriptions.length)] + ` - ${colour} variant with ${variant}`,
    url: generateImageUrl(categoryName, brand, type),
    stars: stars,
    count: reviews,
    cat: categoryName,
    vendor: `${vendor.toLowerCase().replace(/\s/g, '')}@retailer.com`,
    discount: discount,
    rating: stars,
    reviews: reviews,
    brand: brand,
    colour: colour,
    variant: {
      type: type,
      colour: colour,
      variant: variant,
      availability: Math.random() > 0.1 ? 'In Stock' : 'Out of Stock'
    },
    history: history,
    datehistory: datehistory
  };
}

// Generate all products
async function generateProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected\n');
    
    // Get existing products count
    const existingCount = await Product.countDocuments();
    console.log(`📊 Existing products: ${existingCount}`);
    console.log('🔄 Generating 1000 new products with all fields...\n');
    
    const productsToAdd = [];
    const categoryNames = Object.keys(categories);
    
    // Generate products evenly across categories
    const productsPerCategory = Math.floor(1000 / categoryNames.length);
    let productCount = 0;
    
    for (const categoryName of categoryNames) {
      const leftover = 1000 % categoryNames.length;
      const categoryProducts = productsPerCategory + (productCount < leftover ? 1 : 0);
      
      for (let i = 0; i < categoryProducts; i++) {
        if (productCount >= 1000) break;
        productsToAdd.push(generateProduct(categoryName, i));
        productCount++;
      }
    }
    
    console.log(`✓ Generated ${productsToAdd.length} products\n`);
    console.log('📥 Inserting into database in batches...\n');
    
    // Insert in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < productsToAdd.length; i += batchSize) {
      const batch = productsToAdd.slice(i, i + batchSize);
      await Product.insertMany(batch);
      const inserted = Math.min(i + batchSize, productsToAdd.length);
      console.log(`  ✓ Inserted ${inserted} / 1000 products`);
    }
    
    const finalCount = await Product.countDocuments();
    console.log(`\n✅ GENERATION COMPLETE!`);
    console.log(`📈 Total products in database: ${finalCount}`);
    console.log(`🆕 New products added: ${finalCount - existingCount}\n`);
    
    // Show category breakdown
    console.log('📊 PRODUCTS BY CATEGORY:');
    let totalByCategory = 0;
    for (const categoryName of categoryNames) {
      const count = await Product.countDocuments({ cat: categoryName });
      console.log(`  • ${categoryName}: ${count}`);
      totalByCategory += count;
    }
    console.log(`  ───────────────────`);
    console.log(`  Total: ${totalByCategory}`);
    
    // Show sample product
    console.log('\n📦 SAMPLE PRODUCT:');
    const sampleProduct = await Product.findOne().lean();
    if (sampleProduct) {
      console.log(JSON.stringify(sampleProduct, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

generateProducts();
