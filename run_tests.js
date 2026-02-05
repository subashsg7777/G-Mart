const http = require('http');

console.log('\n🚀 TESTING G-MART SYSTEM...\n');

const tests = [];

// Test 1: Node.js Search API
tests.push(new Promise((resolve) => {
  console.log('Testing Node.js Backend (Port 5000)...');
  const payload = JSON.stringify({ searchText: 'best shoe under 2000' });
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/search/natural',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('  ✅ Response received');
        console.log(`  📊 Parsed: ${JSON.stringify(result.parsed)}`);
        console.log(`  📦 Found: ${result.totalProducts} products`);
        if (result.products && result.products[0]) {
          console.log(`  🏆 Top: ${result.products[0].name} - ₹${result.products[0].price}`);
        }
        resolve(true);
      } catch (e) {
        console.log('  ❌ Failed to parse response');
        resolve(false);
      }
    });
  }).on('error', (e) => {
    console.log(`  ❌ Connection failed: ${e.message}`);
    resolve(false);
  });
  
  req.setTimeout(3000);
  req.write(payload);
  req.end();
}));

// Test 2: Python ML API
tests.push(new Promise((resolve) => {
  console.log('\nTesting Python ML Backend (Port 8000)...');
  const payload = JSON.stringify({
    products: [
      {
        productId: '1', productName: 'Nike Shoes A',
        price: 1200, discountPercentage: 10,
        averageRating: 4.5, brandReputationScore: 8,
        totalReviews: 150, budgetMin: 1000, budgetMax: 2000
      },
      {
        productId: '2', productName: 'Adidas Shoes B',
        price: 1500, discountPercentage: 20,
        averageRating: 4.2, brandReputationScore: 7,
        totalReviews: 80, budgetMin: 1000, budgetMax: 2000
      }
    ]
  });
  
  const req = http.request({
    hostname: 'localhost',
    port: 8000,
    path: '/rank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('  ✅ Response received');
        console.log(`  🤖 ML Ranked: ${result.totalProducts} products`);
        if (result.rankedProducts && result.rankedProducts[0]) {
          const top = result.rankedProducts[0];
          console.log(`  🏆 Top: ${top.productName} (Score: ${top.rankingScore.toFixed(3)})`);
        }
        resolve(true);
      } catch (e) {
        console.log(`  ❌ Failed: ${e.message}`);
        resolve(false);
      }
    });
  }).on('error', (e) => {
    console.log(`  ❌ Connection failed: ${e.message}`);
    resolve(false);
  });
  
  req.setTimeout(3000);
  req.write(payload);
  req.end();
}));

// Run all tests
Promise.all(tests).then((results) => {
  console.log('\n' + '='.repeat(60));
  if (results.every(r => r)) {
    console.log('✅ ALL TESTS PASSED - SYSTEM READY!');
  } else {
    console.log('⚠️ Some tests failed');
  }
  console.log('='.repeat(60) + '\n');
  process.exit(results.every(r => r) ? 0 : 1);
});
