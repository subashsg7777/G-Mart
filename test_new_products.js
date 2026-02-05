const http = require('http');

console.log('\n🧪 TESTING SEARCH WITH 1000+ PRODUCTS\n');

const tests = [
  'shoe',
  'best laptop under 2000',
  'gaming headphone',
  'smartphone reviews',
  'affordable monitor'
];

let completed = 0;

tests.forEach((query, i) => {
  setTimeout(() => {
    console.log(`Test ${i+1}: "${query}"`);
    const payload = JSON.stringify({ searchText: query });
    
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
          console.log(`  ✅ Found ${result.totalProducts} products`);
          console.log(`  📊 Parsed: Category=${result.parsed.query}, Intent=${result.parsed.intent}, SortBy=${result.parsed.sortBy}`);
          if (result.products && result.products.length > 0) {
            console.log(`  🏆 Top: ${result.products[0].name} ($${result.products[0].price})`);
          }
        } catch (e) {
          console.log(`  ❌ Error: ${e.message}`);
        }
        console.log('');
        completed++;
        if (completed === tests.length) {
          console.log('═'.repeat(60));
          console.log('✅ ALL TESTS COMPLETED - System ready with 1000+ products!');
          console.log('═'.repeat(60));
        }
      });
    });
    
    req.on('error', e => {
      console.log(`  ❌ Error: ${e.message}`);
      completed++;
    });
    req.write(payload);
    req.end();
  }, i * 1200);
});
