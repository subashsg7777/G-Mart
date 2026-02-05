const http = require('http');

/**
 * Test Python ML API Integration
 */

// Test 1: Health check
console.log('\n=== TEST 1: ML API Health Check ===');
const healthReq = http.request({
  hostname: 'localhost',
  port: 8000,
  path: '/health',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});
healthReq.on('error', err => console.error('Error:', err.message));
healthReq.end();

// Test 2: Rank products
setTimeout(() => {
  console.log('\n=== TEST 2: Rank Products (Direct ML API) ===');
  
  const testProducts = [
    {
      productId: "1",
      productName: "Running Shoe A",
      price: 1200,
      discountPercentage: 10,
      averageRating: 4.5,
      brandReputationScore: 8,
      totalReviews: 150,
      budgetMin: 1000,
      budgetMax: 2000
    },
    {
      productId: "2",
      productName: "Running Shoe B",
      price: 1500,
      discountPercentage: 20,
      averageRating: 4.2,
      brandReputationScore: 7,
      totalReviews: 80,
      budgetMin: 1000,
      budgetMax: 2000
    },
    {
      productId: "3",
      productName: "Running Shoe C",
      price: 1800,
      discountPercentage: 5,
      averageRating: 4.8,
      brandReputationScore: 9,
      totalReviews: 250,
      budgetMin: 1000,
      budgetMax: 2000
    }
  ];

  const payload = JSON.stringify({ products: testProducts });

  const rankReq = http.request({
    hostname: 'localhost',
    port: 8000,
    path: '/rank',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Ranked Products:');
        response.rankedProducts.forEach(p => {
          console.log(`  ${p.rank}. ${p.productName} (Score: ${p.rankingScore.toFixed(3)})`);
        });
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  rankReq.on('error', err => console.error('Error:', err.message));
  rankReq.write(payload);
  rankReq.end();
}, 500);

// Test 3: Test via Node.js backend
setTimeout(() => {
  console.log('\n=== TEST 3: Test Via Node.js Backend (Natural Search) ===');
  
  const searchPayload = JSON.stringify({ searchText: 'best shoe under 2000' });

  const searchReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/search/natural',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(searchPayload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Search Results:');
        console.log('  Parsed:', response.parsed);
        console.log(`  Total Found: ${response.totalProducts}`);
        if (response.products && response.products.length > 0) {
          console.log('  Top 3:');
          response.products.slice(0, 3).forEach((p, i) => {
            console.log(`    ${i + 1}. ${p.name} - ₹${p.price} (Rating: ${p.rating}/5, Reviews: ${p.reviews})`);
          });
        }
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  searchReq.on('error', err => console.error('Error:', err.message));
  searchReq.write(searchPayload);
  searchReq.end();
}, 1500);

console.log('🚀 Tests started... (waiting for responses)');
