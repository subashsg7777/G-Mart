const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

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
    const colors = await Product.distinct('colour', match);
    
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
        colors: colors.filter(c => c && c.trim()).sort(),
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
    const {
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
      filters.colour = { $in: colors.map(c => new RegExp(c, 'i')) };
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

    // Add search text filter if provided
    if (searchText && searchText.trim()) {
      filters.$or = [
        { name: { $regex: searchText, $options: 'i' } },
        { description: { $regex: searchText, $options: 'i' } },
        { cat: { $regex: searchText, $options: 'i' } },
        { colour: { $regex: searchText, $options: 'i' } }
      ];
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
