const axios = require('axios');

async function testRanking() {
  const productsForRanking = [
    {
      productId: "id1",
      productName: "Dell XPS 15",
      price: 1599,
      averageRating: 4.7,
      totalReviews: 88,
      budgetMax: 2000,
      budgetMin: 1500
    },
    {
      productId: "id2",
      productName: "ASUS ROG Strix G16",
      price: 1899,
      averageRating: 4.6,
      totalReviews: 85,
      budgetMax: 2000,
      budgetMin: 1500
    }
  ];

  const productMap = {
    id1: { name: "Dell XPS 15", price: 1599, stars: 4.7, count: 88, cat: "Laptops" },
    id2: { name: "ASUS ROG Strix G16", price: 1899, stars: 4.6, count: 85, cat: "Laptops" }
  };

  try {
    console.log('Test 1: Creating product map...');
    const productMap2 = {};
    productsForRanking.forEach(p => {
      productMap2[p.productId] = productMap[p.productId];
    });
    console.log('✓ Product map created');

    console.log('\nTest 2: Ranking products...');
    const rankedProducts = productsForRanking
      .map(p => ({
        ...p,
        rankingScore: (p.averageRating * p.totalReviews) / (p.budgetMax || 100),
        originalProduct: productMap2[p.productId]
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
    console.log('✓ Products ranked');

    console.log('\nTest 3: Formatting results...');
    const formattedResults = rankedProducts.slice(0, 50).map(ranked => ({
      rank: ranked.rank || 0,
      productId: ranked.productId,
      productName: ranked.productName,
      price: ranked.price,
      rating: ranked.averageRating,
      reviews: ranked.totalReviews,
      category: ranked.originalProduct?.cat || 'Unknown',
      vendor: ranked.originalProduct?.vendor || 'Unknown',
      rankingScore: ranked.rankingScore ? parseFloat(ranked.rankingScore.toFixed(3)) : 0
    }));
    console.log('✓ Results formatted');

    console.log('\nFormatted Results:');
    console.log(JSON.stringify(formattedResults, null, 2));

  } catch (err) {
    console.error('✗ Error:', err.message);
    console.error('Stack:', err.stack);
  }
}

testRanking();
