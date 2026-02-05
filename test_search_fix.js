const http = require('http');

const queries = [
  'i need an best shoe in 1200-2000 budget and look for best offers from big brands',
  'best shoe under 500',
  'shoe'
];

console.log('\n🧪 TESTING SEARCH QUERIES\n');

queries.forEach((q, i) => {
  setTimeout(() => {
    console.log(`TEST ${i+1}: "${q}"`);
    const payload = JSON.stringify({ searchText: q });
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
          console.log(`  Parsed: ${JSON.stringify(result.parsed)}`);
          console.log(`  Found: ${result.totalProducts} products`);
          result.products.slice(0, 2).forEach(p => {
            console.log(`    - ${p.name}: $${p.price}`);
          });
        } catch (e) {
          console.log('  Error:', e.message);
        }
        console.log('');
      });
    });
    req.on('error', e => console.log('  ❌', e.message));
    req.write(payload);
    req.end();
  }, i * 1500);
});
