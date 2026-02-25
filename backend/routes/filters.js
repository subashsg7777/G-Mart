const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const axios = require('axios');
const queryParser = require('../utils/queryParser');

function getAiParserConfig() {
  return {
    url: process.env.AI_PARSER_URL || 'http://127.0.0.1:8010',
    enabled: String(process.env.AI_PARSER_ENABLED).toLowerCase() === 'true'
  };
}

const categoryMap = {
  shoe: 'Shoes',
  phone: 'Mobile Phones',
  laptop: 'Laptops',
  tablet: 'Tablets',
  headphone: 'Headphones',
  watch: 'Smartwatches',
  camera: 'Cameras',
  monitor: 'Monitors',
  keyboard: 'Keyboards',
  mouse: 'Mouse',
  speaker: 'Speakers',
  storage: 'Storage'
};

function mapParsedSortToFilterSort(sortBy) {
  const s = String(sortBy || '').toLowerCase();
  if (!s) return null;
  if (s.includes('price_low') || s.includes('low') || s.includes('cheap') || s.includes('budget')) return 'price_asc';
  if (s.includes('price_high') || s.includes('high') || s.includes('expensive') || s.includes('premium')) return 'price_desc';
  if (s.includes('rating') || s.includes('review') || s.includes('best')) return 'rating_desc';
  if (s.includes('new')) return 'newest';
  if (s.includes('relevance')) return 'relevance';
  if (s.includes('ranking') || s.includes('popular') || s.includes('value')) return 'relevance';
  return null;
}

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get all available filter values from the database
 * GET /api/filters/values
 * Returns: { categories, brands, colors, priceRange }
 */
router.get('/values', async (req, res) => {
  try {
    const { category } = req.query;
    const match = {};
    if (category && String(category).trim()) {
      // Case-insensitive exact match on category name
      match.cat = { $regex: `^${escapeRegex(String(category).trim())}$`, $options: 'i' };
    }

    // Get all unique categories
    const categories = await Product.distinct('cat');
    
    // Get all unique brands
    const brands = await Product.distinct('brand', match);
    
    // Get all unique colors
    const coloursField = await Product.distinct('colour', match);
    const variantColorsField = await Product.distinct('variant.color', match);
    const colors = Array.from(
      new Set([...(coloursField || []), ...(variantColorsField || [])].filter(Boolean))
    );
    
    // Get price range
    const priceStats = await Product.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const priceRange = priceStats[0] ? {
      min: Math.floor(priceStats[0].minPrice),
      max: Math.ceil(priceStats[0].maxPrice)
    } : { min: 0, max: 100000 };

    // Get all available ratings
    const ratings = [5, 4, 3, 2, 1];
    
    // Get sort options
    const sortOptions = [
      { label: 'Relevance', value: 'relevance' },
      { label: 'Price: Low to High', value: 'price_asc' },
      { label: 'Price: High to Low', value: 'price_desc' },
      { label: 'Rating: High to Low', value: 'rating_desc' },
      { label: 'Newest', value: 'newest' }
    ];

    res.json({
      success: true,
      filters: {
        categories: categories.filter(c => c && c.trim()).sort(),
        brands: brands.filter(b => b && b.trim()).sort(),
        colors: colors.filter(c => c && String(c).trim()).map(c => String(c).trim()).sort(),
        ratings: ratings,
        priceRange: priceRange,
        sortOptions: sortOptions
      }
    });

  } catch (error) {
    console.error('Error fetching filter values:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter values',
      message: error.message
    });
  }
});

/**
 * Filter products based on multiple criteria
 * POST /api/filters/products
 * Body: {
 *   categories: [],
 *   brands: [],
 *   colors: [],
 *   minPrice: 0,
 *   maxPrice: 100000,
 *   minRating: 0,
 *   searchText: '',
 *   sortBy: 'relevance',
 *   limit: 50
 * }
 */
router.post('/products', async (req, res) => {
  try {
    const aiCfg = getAiParserConfig();
    let {
      categories = [],
      brands = [],
      colors = [],
      minPrice = 0,
      maxPrice = 999999,
      minRating = 0,
      searchText = '',
      sortBy = 'relevance',
      limit = 50
    } = req.body;

    // If searchText is provided, use AI (or rule-parser) to infer missing filter fields.
    let parserSource = 'none';
    let parsed = null;
    let textSearchApplied = false;
    const hasSearchText = Boolean(searchText && String(searchText).trim());
    if (hasSearchText) {
      parserSource = 'rule-parser';
      if (aiCfg.enabled) {
        try {
          const aiResp = await axios.post(`${aiCfg.url}/parse`, { searchText }, { timeout: 4000 });
          parsed = aiResp.data;
          parserSource = 'ai-parser';
        } catch (aiErr) {
          // fall back below
        }
      }

      if (!parsed) {
        parsed = queryParser.parse(searchText);
      }

      // Fill missing fields conservatively (never broaden user-selected constraints)
      if (Array.isArray(parsed?.brands) && parsed.brands.length > 0 && (!Array.isArray(brands) || brands.length === 0)) {
        brands = parsed.brands;
      }

      const parsedColor = parsed?.variants?.color;
      if (parsedColor && (!Array.isArray(colors) || colors.length === 0)) {
        colors = [String(parsedColor)];
      }

      const parsedQuery = parsed?.query;
      if (parsedQuery && parsedQuery !== 'product' && (!Array.isArray(categories) || categories.length === 0)) {
        const mappedCategory = categoryMap[String(parsedQuery).toLowerCase()] || parsedQuery;
        categories = [mappedCategory];
      }

      // Budget: intersect parsed budget with user range
      if (typeof parsed?.budgetMin === 'number' && typeof parsed?.budgetMax === 'number') {
        const nextMin = Math.max(Number(minPrice) || 0, parsed.budgetMin);
        const nextMax = Math.min(Number(maxPrice) || 999999, parsed.budgetMax);
        if (Number.isFinite(nextMin) && Number.isFinite(nextMax) && nextMax >= nextMin) {
          minPrice = nextMin;
          maxPrice = nextMax;
        }
      }

      // Sort: only override default
      if (sortBy === 'relevance') {
        const mappedSort = mapParsedSortToFilterSort(parsed?.sortBy);
        if (mappedSort) sortBy = mappedSort;
      }
    }

    const andConditions = [];

    // Build filter query
    const filters = {
      price: { $gte: minPrice, $lte: maxPrice }
    };

    // Add category filter if provided
    if (categories.length > 0) {
      filters.cat = { $in: categories.map(c => new RegExp(c, 'i')) };
    }

    // Add brand filter if provided
    if (brands.length > 0) {
      filters.brand = { $in: brands };
    }

    // Add color filter if provided
    if (colors.length > 0) {
      const colorRegexes = colors.map(c => new RegExp(String(c), 'i'));
      andConditions.push({
        $or: [
          { colour: { $in: colorRegexes } },
          { 'variant.color': { $in: colorRegexes } }
        ]
      });
    }

    // Rating: in this codebase, Product.stars accumulates star values and Product.count is #ratings.
    // Filter by average rating = stars/count.
    const needsAvgRating = minRating > 0 || sortBy === 'rating_desc';
    if (minRating > 0) {
      filters.$expr = {
        $gte: [
          {
            $cond: [
              { $gt: ['$count', 0] },
              { $divide: ['$stars', '$count'] },
              0
            ]
          },
          minRating
        ]
      };
    }

    // Add search text filter if provided.
    // Important: If AI/rule parsing inferred structured filters from a natural-language sentence,
    // applying the full raw phrase as regex will often match nothing.
    if (searchText && searchText.trim()) {
      const inferredStructured = Boolean(
        (parsed && parsed.query && parsed.query !== 'product') ||
        (parsed?.variants && Object.keys(parsed.variants).length > 0) ||
        (Array.isArray(parsed?.brands) && parsed.brands.length > 0) ||
        (typeof parsed?.budgetMin === 'number' && typeof parsed?.budgetMax === 'number' && (parsed.budgetMin > 0 || parsed.budgetMax < 999999))
      );

      if (!inferredStructured) {
        textSearchApplied = true;
        andConditions.push({
          $or: [
            { name: { $regex: searchText, $options: 'i' } },
            { description: { $regex: searchText, $options: 'i' } },
            { cat: { $regex: searchText, $options: 'i' } },
            { colour: { $regex: searchText, $options: 'i' } },
            { 'variant.color': { $regex: searchText, $options: 'i' } },
            { brand: { $regex: searchText, $options: 'i' } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      filters.$and = andConditions;
    }

    // Apply sorting
    let sortQuery = {};
    switch (sortBy) {
      case 'price_asc':
        sortQuery = { price: 1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1 };
        break;
      case 'newest':
        sortQuery = { _id: -1 };
        break;
      case 'relevance':
      default:
        sortQuery = { count: -1, stars: -1 }; // Sort by #ratings then total stars
    }

    // Execute query
    let products;
    if (needsAvgRating) {
      // Use aggregation so we can sort/filter by computed average rating
      const pipeline = [
        { $match: filters },
        {
          $addFields: {
            avgRating: {
              $cond: [
                { $gt: ['$count', 0] },
                { $divide: ['$stars', '$count'] },
                0
              ]
            }
          }
        },
      ];

      if (sortBy === 'rating_desc') {
        pipeline.push({ $sort: { avgRating: -1, count: -1 } });
      } else {
        pipeline.push({ $sort: sortQuery });
      }

      pipeline.push(
        { $limit: limit },
        { $project: { _id: 1, name: 1, price: 1, stars: 1, count: 1, cat: 1, vendor: 1, description: 1, url: 1, colour: 1, brand: 1, discount: 1 } }
      );

      products = await Product.aggregate(pipeline);
    } else {
      products = await Product.find(filters)
        .select('_id name price stars count cat vendor description url colour brand discount')
        .sort(sortQuery)
        .limit(limit)
        .lean();
    }

    res.json({
      success: true,
      parserSource,
      ai: { enabled: aiCfg.enabled, url: aiCfg.url },
      parsed,
      textSearchApplied,
      filters: { categories, brands, colors, minPrice, maxPrice, minRating, searchText, sortBy },
      totalProducts: products.length,
      products: products
    });

  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter products',
      message: error.message
    });
  }
});

module.exports = router;
