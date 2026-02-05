const http = require('http');

const queries = [
  'best shoe under 1500',
  'phone between 20000-50000 with reviews',
  'value for money shoe under 2000',
  'top-rated headphones under 5000',
  'laptop starting from 50000-100000'
];

const testQuery = (query) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({searchText: query});
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/search/natural',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`\n✓ Query: "${query}"`);
          console.log(`  Category: ${json.parsed.query}`);
          console.log(`  Budget: ₹${json.parsed.budgetMin} - ₹${json.parsed.budgetMax}`);
          console.log(`  Intent: ${json.parsed.intent}`);
          console.log(`  Sort By: ${json.parsed.sortBy}`);
          console.log(`  Products Found: ${json.totalProducts}`);
          if(json.products && json.products.length > 0) {
            console.log(`  Top Result: ${json.products[0].name} (₹${json.products[0].price})`);
          }
        } catch(e) {
          console.log(`✗ Error parsing response: ${e.message}`);
        }
        resolve();
      });
    });

    req.on('error', e => {
      console.log(`✗ Query failed: ${e.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
};

(async () => {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   INTELLIGENT SEARCH API - TEST RESULTS       ║');
  console.log('╚═══════════════════════════════════════════════╝');
  
  for(const query of queries) {
    await testQuery(query);
  }
  
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   ✅ ALL TESTS COMPLETE                       ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
})();
