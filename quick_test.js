const http = require('http');

console.log('\n📊 TESTING BOTH BACKENDS...\n');

// Test 1: Node backend
const test1 = new Promise((resolve) => {
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
        const json = JSON.parse(data);
        console.log('✅ NODE.JS BACKEND (Port 5000): WORKING');
        console.log(`   Query: "best shoe under 2000"`);
        console.log(`   Parsed: ${JSON.stringify(json.parsed)}`);
        console.log(`   Found: ${json.totalProducts} products`);
        resolve(true);
      } catch (e) {
        console.log('❌ NODE.JS: Parse error');
        resolve(false);
      }
    });
  }).on('error', () => {
    console.log('❌ NODE.JS BACKEND: NOT RESPONDING');
    resolve(false);
  });
  
  req.setTimeout(3000);
  req.write(JSON.stringify({ searchText: 'best shoe under 2000' }));
  req.end();
});

// Test 2: Python backend
const test2 = new Promise((resolve) => {
  const products = [{
    productId: '1',
    productName: 'Shoe A',
    price: 1200,
    discountPercentage: 10,
    averageRating: 4.5,
    brandReputationScore: 8,
    totalReviews: 150,
    budgetMin: 1000,
    budgetMax: 2000
  }];
  
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
        const json = JSON.parse(data);
        console.log('\n✅ PYTHON ML BACKEND (Port 8000): WORKING');
        console.log(`   Ranked ${json.totalProducts} product(s)`);
        if (json.rankedProducts && json.rankedProducts.length > 0) {
          console.log(`   Top: ${json.rankedProducts[0].productName} (Score: ${json.rankedProducts[0].rankingScore.toFixed(3)})`);
        }
        resolve(true);
      } catch (e) {
        console.log('\n❌ PYTHON: Parse error', e.message);
        resolve(false);
      }
    });
  }).on('error', () => {
    console.log('\n❌ PYTHON ML BACKEND: NOT RESPONDING');
    resolve(false);
  });
  
  req.setTimeout(3000);
  req.write(JSON.stringify({ products }));
  req.end();
});

Promise.all([test1, test2]).then(([n, p]) => {
  console.log('\n' + '='.repeat(50));
  if (n && p) {
    console.log('✅ ALL SYSTEMS OPERATIONAL!');
  } else {
    console.log('⚠️  Some systems not ready');
  }
  console.log('='.repeat(50) + '\n');
  process.exit(0);
});
