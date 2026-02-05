"""
INTEGRATION GUIDE - Connecting with G-Mart Backend
===================================================

This guide shows how to integrate the ML ranking system with your existing 
Node.js/Express backend in the G-Mart project.
"""

# ============================================================
# FILE: backend/services/rankingService.js (NEW)
# ============================================================

const axios = require('axios');

const RANKING_API_BASE = process.env.RANKING_API_URL || 'http://localhost:8000';

class RankingService {
  /**
   * Rank products based on budget and search intent
   * @param {Array} products - Products from database
   * @param {number} budgetMin - Minimum budget
   * @param {number} budgetMax - Maximum budget
   * @returns {Promise<Array>} Ranked products
   */
  static async rankProducts(products, budgetMin, budgetMax) {
    if (!products || products.length === 0) {
      return [];
    }

    const rankingPayload = {
      products: products.map(p => ({
        productId: p._id.toString(),
        productName: p.name,
        price: p.price,
        discountPercentage: p.discount || 0,
        averageRating: p.rating || 0,
        brandReputationScore: p.brandScore || 5,
        totalReviews: p.reviewCount || 0,
        budgetMin: budgetMin,
        budgetMax: budgetMax,
      }))
    };

    try {
      const response = await axios.post(
        `${RANKING_API_BASE}/rank`,
        rankingPayload,
        { timeout: 5000 }
      );
      
      return response.data.rankedProducts;
    } catch (error) {
      console.error('Ranking service error:', error.message);
      // Fallback: return products sorted by rating if ranking fails
      return rankingPayload.products.sort((a, b) => b.averageRating - a.averageRating);
    }
  }

  /**
   * Get explanation for product ranking
   * @param {Object} product - Product object
   * @returns {Promise<Object>} Feature breakdown
   */
  static async explainProduct(product, budgetMin, budgetMax) {
    const payload = {
      products: [{
        productId: product._id.toString(),
        productName: product.name,
        price: product.price,
        discountPercentage: product.discount || 0,
        averageRating: product.rating || 0,
        brandReputationScore: product.brandScore || 5,
        totalReviews: product.reviewCount || 0,
        budgetMin: budgetMin,
        budgetMax: budgetMax,
      }]
    };

    try {
      const response = await axios.post(
        `${RANKING_API_BASE}/explain`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Explain error:', error.message);
      return null;
    }
  }

  /**
   * Check if ranking service is available
   * @returns {Promise<boolean>}
   */
  static async isAvailable() {
    try {
      const response = await axios.get(`${RANKING_API_BASE}/health`, {
        timeout: 2000
      });
      return response.data.model_loaded === true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = RankingService;


# ============================================================
# FILE: backend/routes/products.js (UPDATED)
# ============================================================

const express = require('express');
const Product = require('../models/Product');
const RankingService = require('../services/rankingService');
const router = express.Router();

/**
 * POST /api/products/search
 * Search and rank products
 * 
 * Body:
 * {
 *   "query": "running shoes",
 *   "category": "shoes",
 *   "budgetMin": 1000,
 *   "budgetMax": 1500
 * }
 */
router.post('/search', async (req, res) => {
  try {
    const { query, category, budgetMin, budgetMax, limit = 20 } = req.body;

    // Validate budget
    if (!budgetMin || !budgetMax || budgetMin > budgetMax) {
      return res.status(400).json({
        error: 'Invalid budget range'
      });
    }

    // Query products
    let filters = {
      price: { $gte: budgetMin, $lte: budgetMax }
    };

    if (category) {
      filters.category = category;
    }

    if (query) {
      filters.$text = { $search: query };
    }

    const products = await Product.find(filters)
      .limit(limit)
      .lean();

    if (!products.length) {
      return res.json({
        query,
        results: [],
        totalProducts: 0
      });
    }

    // Rank products using ML model
    const rankedProducts = await RankingService.rankProducts(
      products,
      budgetMin,
      budgetMax
    );

    return res.json({
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
 * GET /api/products/explain/:productId
 * Get ranking explanation for a product
 */
router.get('/explain/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).lean();
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { budgetMin = 1000, budgetMax = 10000 } = req.query;

    const explanation = await RankingService.explainProduct(
      product,
      parseInt(budgetMin),
      parseInt(budgetMax)
    );

    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: 'Explanation failed' });
  }
});

/**
 * GET /api/health/ranking
 * Check if ranking service is available
 */
router.get('/health/ranking', async (req, res) => {
  const isAvailable = await RankingService.isAvailable();
  res.json({
    rankingServiceAvailable: isAvailable
  });
});

module.exports = router;


# ============================================================
# FILE: .env (UPDATE WITH)
# ============================================================

RANKING_API_URL=http://localhost:8000
NODE_ENV=development


# ============================================================
# FILE: package.json (ADD TO DEPENDENCIES)
# ============================================================

// Already have axios? If not:
// npm install axios


# ============================================================
# REACT FRONTEND INTEGRATION
# FILE: g-mart/src/SearchWithRanking.js (NEW)
# ============================================================

import React, { useState } from 'react';
import axios from 'axios';
import './SearchWithRanking.css';

function SearchWithRanking() {
  const [query, setQuery] = useState('');
  const [budgetMin, setBudgetMin] = useState(1000);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/products/search', {
        query,
        budgetMin: parseInt(budgetMin),
        budgetMax: parseInt(budgetMax)
      });

      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (productId) => {
    try {
      const response = await axios.get(
        `/api/products/explain/${productId}`,
        {
          params: {
            budgetMin,
            budgetMax
          }
        }
      );
      alert(JSON.stringify(response.data.featureBreakdown, null, 2));
    } catch (err) {
      alert('Failed to get explanation');
    }
  };

  return (
    <div className="search-container">
      <h2>Smart Product Search</h2>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />

        <div className="budget-range">
          <input
            type="number"
            placeholder="Min Budget"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            min="0"
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            min={budgetMin}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search with ML Ranking'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results-list">
        {results.map((product) => (
          <div key={product.productId} className="product-item">
            <div className="rank-badge">#{product.rank}</div>
            <div className="product-info">
              <h3>{product.productName}</h3>
              <p>Price: ₹{product.price}</p>
              <p>Rating: {product.averageRating}/5</p>
              <p>Discount: {product.discountPercentage}%</p>
            </div>
            <div className="score">
              <span className="score-label">ML Score:</span>
              <span className="score-value">
                {(product.rankingScore * 100).toFixed(1)}
              </span>
            </div>
            <button
              className="explain-btn"
              onClick={() => handleExplain(product.productId)}
            >
              Why Top Ranked?
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchWithRanking;


# ============================================================
# DEPLOYMENT CHECKLIST
# ============================================================

PRODUCTION DEPLOYMENT STEPS:

1. Train model on production data:
   - Collect at least 1000 labeled examples (click/no-click)
   - Update data/training_data.csv
   - Run: python train.py

2. Deploy Python API:
   - Option A: Heroku
     heroku create gmart-ranking-api
     git push heroku main
   
   - Option B: Docker
     docker build -t gmart-ranking .
     docker run -p 8000:8000 gmart-ranking
   
   - Option C: AWS EC2
     python -m uvicorn api:app --host 0.0.0.0 --port 8000
     Use Gunicorn + Nginx for production

3. Update Backend Config:
   - Set RANKING_API_URL to production URL
   - Add error handling for API failures
   - Implement caching for frequent searches

4. Monitor & Track:
   - Monitor ranking quality with A/B tests
   - Track API latency and error rates
   - Set up logging and alerting

5. Retrain Schedule:
   - Weekly: Collect new user interaction data
   - Monthly: Retrain model with accumulated data
   - Quarterly: Evaluate model performance


# ============================================================
# DOCKER SUPPORT (OPTIONAL)
# FILE: ml-ranking-system/Dockerfile
# ============================================================

FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train model on startup
RUN python train.py

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
