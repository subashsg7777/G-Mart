const express = require('express');
const Product = require('../models/Product');
const queryParser = require('../utils/queryParser');
const router = express.Router();
const axios = require('axios');

// Configuration for ML Ranking API
const RANKING_API_URL = process.env.RANKING_API_URL || 'http://localhost:8000';
const RANKING_ENABLED = process.env.RANKING_ENABLED !== 'false';

/**
 * Natural Language Search - Parse raw search text and return results
 * POST /api/search/natural
 * Body: { searchText }
 * 
 * Example: "best shoe under 1500 with good reviews"
 */
router.post('/natural', async (req, res) => {
  try {
    const { searchText } = req.body;

    if (!searchText || typeof searchText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'searchText is required and must be a string'
      });
    }

    console.log(`\n🔍 NATURAL SEARCH: "${searchText}"`);

    // Step 1: Parse the natural language text
    const parsedQuery = queryParser.parse(searchText);
    console.log(`✓ Parsed: ${JSON.stringify(parsedQuery)}`);

    // Step 2: Build MongoDB filters
    const filters = {};

    // Map parser category names to actual database categories
    const categoryMap = {
      'shoe': 'Shoes',
      'phone': 'Mobile Phones',
      'laptop': 'Laptops',
      'tablet': 'Tablets',
      'headphone': 'Headphones',
      'watch': 'Smartwatches',
      'camera': 'Cameras',
      'monitor': 'Monitors',
      'keyboard': 'Keyboards',
      'mouse': 'Mouse',
      'speaker': 'Speakers',
      'storage': 'Storage',
    };

    if (parsedQuery.query && parsedQuery.query !== 'product') {
      const actualCategory = categoryMap[parsedQuery.query] || parsedQuery.query;
      filters.cat = { $regex: actualCategory, $options: 'i' };
    }

    // Step 3: Fetch products from database (without budget filter first)
    console.log(`✓ Using filters: ${JSON.stringify(filters)}`);
    let products = await Product.find(filters).lean();
    console.log(`✓ Found ${products.length} products in database`);
    if (products.length <= 5) {
      products.forEach(p => console.log(`  - ${p.name} (${p.cat})`));
    }
    
    // Step 4: Apply budget filter intelligently
    // If user specified budget and products exist, filter by price
    // But if budget filter results in 0 products, ignore it (prices might be in different currency)
    const hasBudgetKeyword = /\b(budget|price|under|below|between|starting|₹|\$|afford|cost|range)\b/i.test(searchText);
    if (hasBudgetKeyword && (parsedQuery.budgetMin > 0 || parsedQuery.budgetMax < 999999) && products.length > 0) {
      const filteredByBudget = products.filter(p => p.price >= parsedQuery.budgetMin && p.price <= parsedQuery.budgetMax);
      if (filteredByBudget.length > 0) {
        products = filteredByBudget;
        console.log(`✓ Filtered by budget: ${products.length} products match`);
      }
    }

    // Step 4: Apply sorting based on user intent
    products = applyIntelligentSort(products, parsedQuery.sortBy);
    console.log(`✓ Sorted by: ${parsedQuery.sortBy}`);

    // Step 5: Apply ML ranking if enabled
    let rankedProducts = products;
    if (RANKING_ENABLED && products.length > 0) {
      try {
        rankedProducts = await rankProductsML(products, searchText);
        console.log(`✓ ML ranking applied`);
      } catch (mlError) {
        console.log(`⚠️ ML ranking failed, using basic sorting`);
      }
    }

    const result = {
      success: true,
      searchText,
      parsed: parsedQuery,
      totalProducts: rankedProducts.length,
      products: rankedProducts.slice(0, 50) // Return top 50
    };

    return res.json(result);
  } catch (error) {
    console.error('Natural search error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Batch Natural Language Search - Process multiple search queries
 * POST /api/search/batch
 * Body: { searchTexts: ["query1", "query2", ...] }
 */
router.post('/batch', async (req, res) => {
  try {
    const { searchTexts } = req.body;

    if (!Array.isArray(searchTexts) || searchTexts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'searchTexts must be a non-empty array'
      });
    }

    console.log(`\n🔍 BATCH SEARCH: ${searchTexts.length} queries`);

    const results = [];

    for (const searchText of searchTexts) {
      try {
        const parsedQuery = queryParser.parse(searchText);
        
        const filters = {
          price: { $gte: parsedQuery.budgetMin, $lte: parsedQuery.budgetMax }
        };

        if (parsedQuery.query && parsedQuery.query !== 'product') {
          filters.cat = { $regex: parsedQuery.query, $options: 'i' };
        }

        let products = await Product.find(filters).lean();
        products = applyIntelligentSort(products, parsedQuery.sortBy);

        results.push({
          searchText,
          parsed: parsedQuery,
          totalFound: products.length,
          topResults: products.slice(0, 5)
        });
      } catch (err) {
        results.push({
          searchText,
          error: err.message
        });
      }
    }

    return res.json({
      success: true,
      totalQueries: searchTexts.length,
      results
    });
  } catch (error) {
    console.error('Batch search error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Apply intelligent sorting based on user intent
 */
function applyIntelligentSort(products, sortBy) {
  const sorted = [...products];

  if (sortBy === 'reviews') {
    // Sort by rating (highest), then by review count
    sorted.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.reviews || 0) - (a.reviews || 0);
    });
  } else if (sortBy === 'value') {
    // Sort by value for money (rating/price ratio)
    sorted.sort((a, b) => {
      const valueA = (a.rating || 0) / Math.max(a.price || 1, 1);
      const valueB = (b.rating || 0) / Math.max(b.price || 1, 1);
      return valueB - valueA;
    });
  } else {
    // Default: sort by overall ranking (rating * reviews)
    sorted.sort((a, b) => {
      const rankA = (a.rating || 0) * (a.reviews || 0);
      const rankB = (b.rating || 0) * (b.reviews || 0);
      return rankB - rankA;
    });
  }

  return sorted;
}

/**
 * Call ML ranking API if available
 */
async function rankProductsML(products, query) {
  try {
    // Get budget from query parser to pass to ML model
    const parsedQuery = queryParser.parse(query);
    
    const response = await axios.post(`${RANKING_API_URL}/rank`, {
      products: products.map(p => ({
        productId: (p._id || p.id).toString(),
        productName: p.name || '',
        price: p.price || 0,
        discountPercentage: p.discount || 0,
        averageRating: p.rating || 0,
        brandReputationScore: p.brandReputation || 5,
        totalReviews: p.reviews || 0,
        budgetMin: parsedQuery.budgetMin || 0,
        budgetMax: parsedQuery.budgetMax || 100000
      }))
    }, { timeout: 5000 });

    if (response.data.rankedProducts && Array.isArray(response.data.rankedProducts)) {
      // Create map of ranked product IDs
      const rankMap = new Map(
        response.data.rankedProducts.map((p, idx) => [p.productId, idx])
      );

      // Sort original products by rank
      return products.sort((a, b) => {
        const rankA = rankMap.get((a._id || a.id).toString()) ?? Infinity;
        const rankB = rankMap.get((b._id || b.id).toString()) ?? Infinity;
        return rankA - rankB;
      });
    }
  } catch (err) {
    console.log('ML ranking unavailable:', err.message);
  }

  return products;
}

module.exports = router;
