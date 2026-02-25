const mongoose = require('mongoose');
const Product = require('./models/Product');

// Product data generator
const categories = {
  'Shoes': [
    { brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Asics', 'New Balance', 'Saucony', 'Brooks'], types: ['Running', 'Basketball', 'Casual', 'Formal', 'Sports', 'Sneaker'] },
  ],
  'Mobile Phones': [
    { brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'POCO', 'Motorola', 'Google'], types: ['Flagship', 'Budget', 'Mid-range', 'Pro', 'Ultra'] },
  ],
  'Laptops': [
    { brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer'], types: ['Gaming', 'Business', 'Ultrabook', 'Budget', 'Workstation'] },
  ],
  'Headphones': [
    { brands: ['Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'JBL', 'Beats', 'Bang & Olufsen'], types: ['Wireless', 'Noise-Cancelling', 'Studio', 'Gaming', 'Bluetooth'] },
  ],
  'Tablets': [
    { brands: ['Apple', 'Samsung', 'iPad', 'Huawei', 'Lenovo', 'Microsoft'], types: ['Premium', 'Budget', '10-inch', '12-inch', 'Pro'] },
  ],
  'Cameras': [
    { brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Olympus', 'Panasonic'], types: ['DSLR', 'Mirrorless', 'Compact', 'Action', 'Instant'] },
  ],
  'Smartwatches': [
    { brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Fossil'], types: ['Fitness', 'Luxury', 'Sports', 'Budget', 'Health'] },
  ],
  'Monitors': [
    { brands: ['Dell', 'LG', 'ASUS', 'BenQ', 'Samsung', 'Acer'], types: ['Gaming', '4K', 'Ultrawide', 'IPS', 'Curved'] },
  ],
  'Keyboards': [
    { brands: ['Corsair', 'Logitech', 'Razer', 'SteelSeries', 'Mechanical', 'Das'], types: ['Mechanical', 'Wireless', 'Gaming', 'Budget', 'Ergonomic'] },
  ],
  'Mouse': [
    { brands: ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Microsoft'], types: ['Gaming', 'Wireless', 'Ergonomic', 'Budget', 'High-DPI'] },
  ],
  'Speakers': [
    { brands: ['JBL', 'Sony', 'Bose', 'Harman Kardon', 'Beats', 'Marshall'], types: ['Portable', 'Bluetooth', 'Studio', 'Home', 'Party'] },
  ],
  'Storage': [
    { brands: ['Samsung', 'Western Digital', 'Seagate', 'Kingston', 'Crucial'], types: ['SSD', 'HDD', 'External', 'NVMe', 'Portable'] },
  ],
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
];

const vendors = ['Amazon', 'Flipkart', 'eBay', 'Myntra', 'Best Buy', 'Walmart', 'TataCliq', 'Snapdeal'];

// Generate realistic image URLs (using placeholder service that works globally)
function generateImageUrl(category, brand, productType) {
  const imageIds = Math.floor(Math.random() * 1000);
  // Using Lorem Picsum for product images (free service)
  return `https://picsum.photos/400/300?random=${imageIds}&product=${productType}`;
}

// Generate a single product
function generateProduct(categoryName, index) {
  const categoryData = categories[categoryName];
  const brand = categoryData[0].brands[Math.floor(Math.random() * categoryData[0].brands.length)];
  const type = categoryData[0].types[Math.floor(Math.random() * categoryData[0].types.length)];
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  
  const productName = `${brand} ${type} ${categoryName.replace(/s$/, '')} - Model ${Math.floor(Math.random() * 9000) + 1000}`;
  const basePrice = Math.random() * 50000 + 50; // Between $50 and $50,050
  const discount = Math.floor(Math.random() * 40); // 0-40% discount
  const finalPrice = Math.floor(basePrice * (1 - discount / 100));
  const rating = (Math.random() * 0.8 + 3.5).toFixed(1); // 3.5-4.3 stars
  const reviews = Math.floor(Math.random() * 5000 + 50); // 50-5050 reviews
  
  return {
    name: productName,
    price: finalPrice,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    url: generateImageUrl(categoryName, brand, type),
    stars: parseFloat(rating),
    count: reviews,
    cat: categoryName,
    vendor: vendor,
    discount: discount,
    rating: parseFloat(rating),
    reviews: reviews,
    brand: brand,
    type: type,
    dateCreated: new Date()
  };
}

// Generate all products
async function importProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/GmartDb', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB Connected\n');
    
    // Get existing products count
    const existingCount = await Product.countDocuments();
    console.log(`Existing products: ${existingCount}`);
    console.log('Generating 1000 new products...\n');
    
    const productsToAdd = [];
    const categoryNames = Object.keys(categories);
    
    // Generate products evenly across categories
    const productsPerCategory = Math.floor(1000 / categoryNames.length);
    let productCount = 0;
    
    for (const categoryName of categoryNames) {
      const categoryProducts = productsPerCategory + (productCount < 1000 % categoryNames.length ? 1 : 0);
      
      for (let i = 0; i < categoryProducts; i++) {
        if (productCount >= 1000) break;
        productsToAdd.push(generateProduct(categoryName, i));
        productCount++;
      }
    }
    
    // Insert in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < productsToAdd.length; i += batchSize) {
      const batch = productsToAdd.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`✓ Inserted ${Math.min(i + batchSize, productsToAdd.length)} / 1000 products`);
    }
    
    const finalCount = await Product.countDocuments();
    console.log(`\n✅ IMPORT COMPLETE!`);
    console.log(`Total products in database: ${finalCount}`);
    
    // Show category breakdown
    console.log('\n📊 PRODUCTS BY CATEGORY:');
    for (const categoryName of categoryNames) {
      const count = await Product.countDocuments({ cat: categoryName });
      console.log(`  ${categoryName}: ${count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importProducts();
