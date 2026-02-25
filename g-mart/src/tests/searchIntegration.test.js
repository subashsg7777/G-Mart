/**
 * Frontend Integration Test
 * Verifies the natural language search works correctly
 */

const API_URL = 'http://localhost:5000';

// Test queries that users would search
const testQueries = [
  "best shoe under 1500",
  "shoe between 1200 and 2000 with good reviews",
  "affordable shoe with best value for money",
  "top-rated shoe under 1700",
  "pick the best shoe for me starting from 1000-1200",
];

/**
 * Test the natural language search API
 */
async function testNaturalSearch(searchText) {
  console.log(`\n🔍 Testing: "${searchText}"`);
  
  try {
    const response = await fetch(`${API_URL}/api/search/natural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchText }),
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`✓ Found ${data.totalProducts} products`);
      console.log(`✓ Parsed: ${JSON.stringify(data.parsed)}`);
      
      if (data.products && data.products.length > 0) {
        console.log(`✓ Top result: ${data.products[0].name} (₹${data.products[0].price})`);
      }
    } else {
      console.error(`❌ ${data.error}`);
    }
  } catch (err) {
    console.error(`❌ Network error: ${err.message}`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('   FRONTEND SEARCH INTEGRATION TEST');
  console.log('═══════════════════════════════════════════');
  
  for (const query of testQueries) {
    await testNaturalSearch(query);
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('✅ INTEGRATION TEST COMPLETE');
  console.log('═══════════════════════════════════════════');
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runTests();
}

export { testNaturalSearch, runTests };
