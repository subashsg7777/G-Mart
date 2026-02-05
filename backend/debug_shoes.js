const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/gmartdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const shoes = await Product.find({ cat: /shoe/i }).lean();
  console.log('\n📦 SHOES IN DATABASE:\n');
  shoes.forEach(p => {
    console.log(`Name: ${p.name}`);
    console.log(`Price: ${p.price}`);
    console.log(`Rating: ${p.rating}, Reviews: ${p.reviews}`);
    console.log(`Discount: ${p.discount}%`);
    console.log('---');
  });
  
  // Now test the complex query
  console.log('\n🔍 TESTING COMPLEX QUERY PARSING:\n');
  const queryParser = require('./utils/queryParser');
  
  const query1 = 'i need an best shoe in 1200-2000 budget and look for best offers from big brands';
  const parsed1 = queryParser.parse(query1);
  console.log(`Query: "${query1}"`);
  console.log(`Parsed:`, parsed1);
  
  console.log('\n');
  
  const query2 = 'shoe';
  const parsed2 = queryParser.parse(query2);
  console.log(`Query: "${query2}"`);
  console.log(`Parsed:`, parsed2);
  
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
