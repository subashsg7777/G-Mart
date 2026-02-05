const http = require('http');

console.log('\n🔍 DEBUGGING LAPTOP SEARCH\n');

const payload = JSON.stringify({ searchText: 'best laptop under 3000' });

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
      console.log(`Query: "best laptop under 3000"`);
      console.log(`Parsed:`, result.parsed);
      console.log(`Total Found: ${result.totalProducts}`);
      console.log(`\nProducts returned:`);
      result.products.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.name}`);
        console.log(`     Category: ${p.cat}, Price: $${p.price}`);
      });
    } catch (e) {
      console.log('Error:', e.message);
      console.log('Response:', data);
    }
  });
});

req.on('error', e => console.log('Error:', e.message));
req.write(payload);
req.end();
