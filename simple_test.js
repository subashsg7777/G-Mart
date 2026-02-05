#!/usr/bin/env node
/**
 * Simple backend test - doesn't terminate the servers
 */
const http = require('http');

function testBackend(host, port, path, method = 'GET', body = null, name = 'Backend') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: path,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`✅ ${name} (${host}:${port}): RESPONDING`);
        if (body && data) {
          try {
            const json = JSON.parse(data);
            if (json.parsed) console.log(`   - Parsed: ${JSON.stringify(json.parsed)}`);
            if (json.totalProducts) console.log(`   - Found: ${json.totalProducts} products`);
            if (json.rankedProducts) console.log(`   - Ranked: ${json.rankedProducts.length} products`);
          } catch (e) {}
        }
        resolve(true);
      });
    }).on('error', () => {
      console.log(`❌ ${name} (${host}:${port}): NOT RESPONDING`);
      resolve(false);
    });
    
    req.setTimeout(2000);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('\n🚀 QUICK BACKEND TEST\n');
  
  const nodeOk = await testBackend(
    'localhost', 5000, 
    '/api/search/natural',
    'POST',
    { searchText: 'best shoe under 2000' },
    'Node.js Backend'
  );
  
  const pythonOk = await testBackend(
    'localhost', 8000,
    '/rank',
    'POST',
    {
      products: [{
        productId: '1',
        productName: 'Test Shoe',
        price: 1200,
        discountPercentage: 10,
        averageRating: 4.5,
        brandReputationScore: 8,
        totalReviews: 150,
        budgetMin: 1000,
        budgetMax: 2000
      }]
    },
    'Python ML Backend'
  );
  
  console.log('\n' + '='.repeat(45));
  if (nodeOk && pythonOk) {
    console.log('✅ ALL BACKENDS WORKING - READY TO TEST!');
  } else if (nodeOk) {
    console.log('✅ Node.js working (Python warming up)');
  } else {
    console.log('⚠️ Some backends not ready yet');
  }
  console.log('='.repeat(45) + '\n');
  
  // Don't exit so servers stay running
  setTimeout(() => {}, 100000000);
})();
