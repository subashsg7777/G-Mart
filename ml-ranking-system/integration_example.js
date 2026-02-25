"""
Integration with Node.js Backend
Example code for calling the ranking API from Node.js
"""

// ============================================
// rankingService.js (Node.js)
// ============================================

const axios = require('axios');

const RANKING_API_URL = 'http://localhost:8000';

class RankingService {
  /**
   * Rank products based on user search intent
   * @param {Array} products - List of products to rank
   * @returns {Promise} Ranked products
   */
  static async rankProducts(products) {
    try {
      const response = await axios.post(`${RANKING_API_URL}/rank`, {
        products: products.map(p => ({
          productId: p.id || p.productId,
          productName: p.name || p.productName,
          price: p.price,
          discountPercentage: p.discountPercentage || 0,
          averageRating: p.rating || p.averageRating || 0,
          brandReputationScore: p.brandScore || p.brandReputationScore || 5,
          totalReviews: p.reviews || p.totalReviews || 0,
          budgetMin: p.budgetMin || 0,
          budgetMax: p.budgetMax || Infinity,
        }))
      });
      
      return response.data.rankedProducts;
    } catch (error) {
      console.error('Ranking API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Explain ranking score for a product
   * @param {Object} product - Product to explain
   * @returns {Promise} Feature breakdown
   */
  static async explainRanking(product) {
    try {
      const response = await axios.post(`${RANKING_API_URL}/explain`, {
        products: [{
          productId: product.id || product.productId,
          productName: product.name || product.productName,
          price: product.price,
          discountPercentage: product.discountPercentage || 0,
          averageRating: product.rating || product.averageRating || 0,
          brandReputationScore: product.brandScore || product.brandReputationScore || 5,
          totalReviews: product.reviews || product.totalReviews || 0,
          budgetMin: product.budgetMin || 0,
          budgetMax: product.budgetMax || Infinity,
        }]
      });
      
      return response.data;
    } catch (error) {
      console.error('Explain API Error:', error.message);
      throw error;
    }
  }

  /**
   * Check if ranking service is healthy
   * @returns {Promise<Boolean>}
   */
  static async isHealthy() {
    try {
      const response = await axios.get(`${RANKING_API_URL}/health`);
      return response.data.model_loaded;
    } catch (error) {
      return false;
    }
  }
}

module.exports = RankingService;


// ============================================
// Example Usage in Express Backend
// ============================================

// In your routes/products.js or similar:

const express = require('express');
const RankingService = require('../services/rankingService');
const router = express.Router();

/**
 * POST /api/search
 * Body: { query: "best shoes", budgetMin: 1000, budgetMax: 1500 }
 */
router.post('/search', async (req, res) => {
  try {
    const { query, budgetMin, budgetMax } = req.body;

    // 1. Find products in category/database
    const products = await Product.find({
      price: { $gte: budgetMin, $lte: budgetMax }
    }).limit(50);

    if (!products.length) {
      return res.status(404).json({ error: 'No products found' });
    }

    // 2. Add budget to products
    const productsWithBudget = products.map(p => ({
      ...p.toObject(),
      budgetMin,
      budgetMax
    }));

    // 3. Rank using ML model
    const rankedProducts = await RankingService.rankProducts(productsWithBudget);

    // 4. Return ranked results
    res.json({
      query,
      budget: { min: budgetMin, max: budgetMax },
      totalProducts: rankedProducts.length,
      results: rankedProducts
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/explain/:productId
 * Get explanation for why a product is ranked high
 */
router.get('/explain/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const explanation = await RankingService.explainRanking(product);
    res.json(explanation);

  } catch (error) {
    res.status(500).json({ error: 'Explanation failed' });
  }
});

module.exports = router;


// ============================================
// Frontend Usage (React)
// ============================================

// In your React component (e.g., Search.js):

import { useState } from 'react';
import axios from 'axios';

function SearchProducts() {
  const [query, setQuery] = useState('');
  const [budgetMin, setBudgetMin] = useState(1000);
  const [budgetMax, setBudgetMax] = useState(1500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/search', {
        query,
        budgetMin: parseInt(budgetMin),
        budgetMax: parseInt(budgetMax)
      });

      setResults(response.data.results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Is ranking service running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Budget"
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Budget"
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="results">
        {results.map((product, idx) => (
          <div key={product.productId} className="product-card">
            <h3>#{product.rank} - {product.productName}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Rating: {product.averageRating}/5</p>
            <p>Score: {product.rankingScore.toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchProducts;
