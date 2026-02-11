/**
 * Comprehensive integration test
 * Tests query parsing, product search, and ML ranking
 */

async function testFullFlow() {
  console.log('=== FULL INTEGRATION TEST ===\n');
  
  const queries = [
    'budget gaming laptop under 50000',
    'premium shoes under 100',
    'cheap phone with good camera',
    'affordable android mobile'
  ];
  
  for (const query of queries) {
    console.log(`\n--- Testing: "${query}" ---`);
    
    try {
      const response = await fetch('http://localhost:5000/api/search/natural', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({searchText: query})
      });
      
      const data = await response.json();
      
      if (data.success && data.products && data.products.length > 0) {
        console.log(`✓ Found ${data.products.length} products`);
        console.log(`  Parsed Query: ${data.parsed.query}`);
        console.log(`  Budget: ${data.parsed.budgetMin} - ${data.parsed.budgetMax}`);
        console.log(`  Brands: ${(data.parsed.brands || []).join(', ') || 'None specified'}`);
        
        // Show top 3 products
        console.log(`  Top products:`);
        data.products.slice(0, 3).forEach((p, idx) => {
          const score = p.rankingScore ? ` (score: ${p.rankingScore.toFixed(2)})` : '';
          console.log(`    ${idx+1}. ${p.name} - $${p.price}${score}`);
        });
      } else {
        console.log(`⚠ Found ${data.products ? data.products.length : 0} products`);
      }
    } catch (e) {
      console.log(`✗ Error: ${e.message}`);
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
  process.exit(0);
}

testFullFlow();
