#!/usr/bin/env node
const http = require('http');

console.log('\n🚀 ===== SYSTEM CHECK =====\n');

// Check Node.js Backend
console.log('✓ Checking Node.js backend (port 5000)...');
const checkNode = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/search/natural', {
      method: 'OPTIONS'
    }, (res) => {
      console.log(`  ✅ Port 5000: Running (HTTP ${res.statusCode})`);
      resolve(true);
    }).on('error', () => {
      console.log(`  ❌ Port 5000: Not responding`);
      resolve(false);
    });
    req.end();
  });
};

// Check Python Backend
const checkPython = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8000/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`  ✅ Port 8000: Running (Model: ${json.model_loaded ? 'LOADED' : 'NOT LOADED'})`);
          resolve(true);
        } catch (e) {
          console.log(`  ✅ Port 8000: Running`);
          resolve(true);
        }
      });
    }).on('error', () => {
      console.log(`  ❌ Port 8000: Not responding`);
      resolve(false);
    });
    req.setTimeout(2000);
    req.end();
  });
};

// Test search query
const testSearch = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ searchText: 'best shoe under 2000' });
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/search/natural',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log(`\n🔍 Test Query: "best shoe under 2000"`);
            console.log(`  ✅ Parsed: ${JSON.stringify(json.parsed)}`);
            console.log(`  ✅ Found: ${json.totalProducts} products`);
            if (json.products && json.products.length > 0) {
              console.log(`  📦 Top result: ${json.products[0].name} (₹${json.products[0].price})`);
            }
            resolve(true);
          } else {
            console.log(`  ❌ Search failed: ${json.error}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`  ❌ Error parsing response: ${e.message}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`  ❌ Search error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000);
    req.write(payload);
    req.end();
  });
};

// Run checks
(async () => {
  const nodeOk = await checkNode();
  const pythonOk = await checkPython();
  
  if (nodeOk && pythonOk) {
    console.log('\n✅ All backends running!\n');
    await testSearch();
  } else {
    console.log('\n⚠️ Some backends not responding\n');
  }
  
  console.log('═══════════════════════════════════════\n');
  process.exit(0);
})();
