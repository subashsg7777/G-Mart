const http = require('http');

async function testAPIs() {
  console.log('Testing ML API...');
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    console.log('✓ ML API: ' + JSON.stringify(data));
  } catch (e) {
    console.log('✗ ML API: ' + e.message);
  }
  
  console.log('\nTesting Node Backend...');
  try {
    const response = await fetch('http://localhost:5000/api/search/natural', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({searchText: 'cheap shoes'})
    });
    const data = await response.json();
    console.log('✓ Node Backend Status: ' + response.status);
    console.log('  Response: ' + JSON.stringify(data).substring(0, 100));
    if (data.products) {
      console.log('  Found ' + data.products.length + ' products');
    }
  } catch (e) {
    console.log('✗ Node Backend: ' + e.message);
  }
  
  process.exit(0);
}

testAPIs();
