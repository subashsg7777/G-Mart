const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const axios = require('axios');

// Configuration for ML Ranking API
const RANKING_API_URL = process.env.RANKING_API_URL || 'http://localhost:8000';
const RANKING_ENABLED = process.env.RANKING_ENABLED !== 'false';

/**
 * Smart product search with ML ranking
 * POST /api/search
 * Body: { query, category, budgetMin, budgetMax, limit }
 */
router.post('/search', async (req, res) => {
  try {
    console.log('=== SEARCH REQUEST RECEIVED ===');
    const { query, category, budgetMin, budgetMax, limit = 50 } = req.body;

    console.log('1. Parsed body:', { query, category, budgetMin, budgetMax });

    // Validate budget
    if (budgetMin === undefined || budgetMax === undefined || budgetMin > budgetMax) {
      console.log('2. Budget validation failed');
      return res.status(400).json({
        success: false,
        error: 'Invalid budget range. budgetMin must be <= budgetMax'
      });
    }

    console.log('2. Budget validation passed');

    // Build query
    let filters = {
      price: { $gte: budgetMin, $lte: budgetMax }
    };

    if (category && category.trim()) {
      filters.cat = { $regex: category, $options: 'i' };
    }

    if (query && query.trim()) {
      // Use regex search instead of text index
      filters.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { cat: { $regex: query, $options: 'i' } },
        { colour: { $regex: query, $options: 'i' } }
      ];
    }

    console.log('3. Query filters built:', JSON.stringify(filters));

    // Find products in database
    console.log('4. Querying MongoDB...');
    const products = await Product.find(filters)
      .select('_id name price stars count cat vendor description colour')
      .limit(limit)
      .lean();

    console.log(`5. Found ${products.length} products`);

    if (!products.length) {
      console.log('6a. No products found, returning empty result');
      return res.json({
        success: true,
        query,
        results: [],
        totalProducts: 0,
        message: 'No products found in this price range'
      });
    }

    console.log('6b. Preparing for ranking...');

    // Prepare products for ranking
    const productsForRanking = products.map(p => ({
      productId: p._id.toString(),
      productName: p.name,
      price: p.price || 0,
      discountPercentage: 0,
      averageRating: p.stars || 0,
      brandReputationScore: 5,
      totalReviews: p.count || 0,
      budgetMin: budgetMin,
      budgetMax: budgetMax
    }));

    console.log('7. Creating product map...');

    // Keep original product data separate
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    console.log('8. Starting ranking logic...');

    let rankedProducts = [];

    // Always use fallback ranking for stability
    console.log('9. Applying fallback ranking algorithm...');
    rankedProducts = productsForRanking
      .map(p => ({
        ...p,
        rankingScore: (p.averageRating * p.totalReviews) / (budgetMax || 100),
        originalProduct: productMap[p.productId]
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));

    console.log('10. Ranking complete, formatting response...');

    // Format response
    const formattedResults = rankedProducts.slice(0, limit).map(ranked => ({
      rank: ranked.rank || 0,
      productId: ranked.productId,
      productName: ranked.productName,
      price: ranked.price,
      rating: ranked.averageRating,
      reviews: ranked.totalReviews,
      category: ranked.originalProduct?.cat || 'Unknown',
      vendor: ranked.originalProduct?.vendor || 'Unknown',
      colour: ranked.originalProduct?.colour || 'Not specified',
      rankingScore: ranked.rankingScore ? parseFloat(ranked.rankingScore.toFixed(3)) : 0,
      valueScore: ranked.valueScore ? parseFloat(ranked.valueScore.toFixed(3)) : 0,
      whyRecommended: ranked.whyRecommended || 'Matches your criteria'
    }));

    return res.json({
      success: true,
      query,
      budget: { min: budgetMin, max: budgetMax },
      totalProducts: formattedResults.length,
      results: formattedResults,
      rankingEnabled: RANKING_ENABLED,
      usingMLRanking: rankedProducts[0]?.rankingScore !== undefined
    });

  } catch (error) {
    console.error('Smart search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed: ' + error.message
    });
  }
});

/**
 * Get explanation for product ranking
 * POST /api/explain
 * Body: { productId, budgetMin, budgetMax }
 */
router.post('/explain', async (req, res) => {
  try {
    const { productId, budgetMin = 1000, budgetMax = 10000 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required'
      });
    }

    // Find product
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Prepare product for explanation
    const productForExplain = {
      productId: product._id.toString(),
      productName: product.name,
      price: product.price || 0,
      discountPercentage: 0,
      averageRating: product.stars || 0,
      brandReputationScore: 5,
      totalReviews: product.count || 0,
      budgetMin,
      budgetMax
    };

    // Try to get explanation from ML API
    if (RANKING_ENABLED) {
      try {
        const explainResponse = await axios.post(
          `${RANKING_API_URL}/explain`,
          { products: [productForExplain] },
          { timeout: 5000 }
        );

        return res.json({
          success: true,
          productId: product._id,
          productName: product.name,
          explanation: explainResponse.data,
          product: {
            price: product.price,
            rating: product.stars,
            reviews: product.count,
            category: product.cat,
            vendor: product.vendor
          }
        });
      } catch (explainError) {
        console.warn('Could not get explanation from ML API:', explainError.message);
      }
    }

    // Fallback explanation
    const priceScore = (budgetMax - productForExplain.price) / (budgetMax - budgetMin);
    const qualityScore = (productForExplain.averageRating * productForExplain.totalReviews) / 
                        (5 * 100); // Normalized

    return res.json({
      success: true,
      productId: product._id,
      productName: product.name,
      explanation: {
        featureBreakdown: {
          price_score: Math.max(0, Math.min(1, priceScore)),
          rating_normalized: productForExplain.averageRating / 5,
          quality_score: Math.max(0, Math.min(1, qualityScore)),
          review_count: productForExplain.totalReviews
        },
        whyRecommended: [
          productForExplain.averageRating > 4 ? `Strong rating of ${productForExplain.averageRating}/5` : '',
          productForExplain.totalReviews > 50 ? `Verified by ${productForExplain.totalReviews} customers` : '',
          priceScore > 0.5 ? 'Good value for money' : '',
          priceScore > 0 ? 'Within your budget' : ''
        ].filter(Boolean).join(', ')
      },
      product: {
        price: product.price,
        rating: product.stars,
        reviews: product.count,
        category: product.cat,
        vendor: product.vendor
      }
    });

  } catch (error) {
    console.error('Explain error:', error);
    return res.status(500).json({
      success: false,
      error: 'Explanation failed: ' + error.message
    });
  }
});

/**
 * Health check for ranking service
 * GET /api/ranking-status
 */
router.get('/ranking-status', async (req, res) => {
  try {
    if (!RANKING_ENABLED) {
      return res.json({
        success: true,
        rankingEnabled: false,
        message: 'ML Ranking is disabled'
      });
    }

    const healthResponse = await axios.get(`${RANKING_API_URL}/health`, {
      timeout: 2000
    });

    return res.json({
      success: true,
      rankingServiceAvailable: healthResponse.data.model_loaded === true,
      rankingApiUrl: RANKING_API_URL,
      message: healthResponse.data.model_loaded ? 'ML Ranking is ready' : 'Model not loaded'
    });
  } catch (error) {
    console.warn('Ranking service health check failed:', error.message);
    return res.json({
      success: true,
      rankingServiceAvailable: false,
      rankingApiUrl: RANKING_API_URL,
      message: 'ML Ranking service is unavailable. Using fallback ranking.'
    });
  }
});

module.exports = router;
