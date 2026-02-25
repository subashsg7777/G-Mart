/**
 * Generate training data from MongoDB for ML model retraining
 * Outputs CSV with all required features including brandReputationScore
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/GmartDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Product schema locally to match backend
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  image: String,
  brand: String,
  variant: {
    color: String,
    capacity: String
  },
  discount: Number,
  rating: Number,
  reviews: [Object],
  productReviews: [Object],
  averageRating: Number,
  totalReviews: Number
});

const brandReputationSchema = new mongoose.Schema({
  brand: String,
  reputationScore: Number,
  meta: {
    colorPopularity: Object,
    avgRating: Number
  }
});

const Product = mongoose.model('Product', productSchema);
const BrandReputation = mongoose.model('BrandReputation', brandReputationSchema);

async function generateTrainingData() {
  try {
    console.log('Fetching products and brand reputations...');
    
    // Fetch all products
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products`);
    
    // Fetch brand reputations
    const brandReps = await BrandReputation.find({}).lean();
    const brandRepMap = {};
    brandReps.forEach(br => {
      brandRepMap[br.brand] = br.reputationScore || 5;
    });
    console.log(`Fetched ${Object.keys(brandRepMap).length} brand reputations`);
    
    // Generate training data rows
    const rows = [];
    
    // Add header
    rows.push('price,discountPercentage,averageRating,brandReputationScore,totalReviews,budgetMin,budgetMax,label');
    
    products.forEach((product, idx) => {
      // Assign random budget ranges (training samples)
      const budgetMin = Math.max(0, product.price - 500);
      const budgetMax = product.price + 500;
      
      // Assign random quality label (0-4 = ranks from worst to best)
      // Higher rating + higher reviews + higher brand rep + lower price = higher quality
      const ratingScore = (product.averageRating || 3) / 5;  // 0-1
      const reviewScore = Math.min(product.totalReviews || 0, 100) / 100;  // 0-1
      const brandScore = (brandRepMap[product.brand] || 5) / 10;  // 0-1
      const priceScore = Math.max(0, 1 - (product.price / 10000));  // 0-1, lower price better
      
      // Weighted quality label
      const qualityScore = (ratingScore * 0.3 + reviewScore * 0.25 + brandScore * 0.25 + priceScore * 0.2);
      const label = Math.min(4, Math.floor(qualityScore * 5));  // 0-4 scale
      
      const row = [
        product.price || 1000,
        product.discount || 0,
        product.averageRating || 3,
        brandRepMap[product.brand] || 5,
        product.totalReviews || 0,
        budgetMin,
        budgetMax,
        label
      ].join(',');
      
      rows.push(row);
    });
    
    // Write CSV file
    const outputPath = path.join(__dirname, 'data', 'training_data.csv');
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, rows.join('\n'));
    console.log(`\nTraining data generated: ${outputPath}`);
    console.log(`Total training samples: ${rows.length - 1}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateTrainingData();
