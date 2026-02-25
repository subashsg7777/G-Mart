const express = require('express');
const router = express.Router();

// Simple test route
router.post('/search', async (req, res) => {
  console.log('ROUTE HIT - before try');
  
  try {
    console.log('Inside try block');
    
    const { query, budgetMin, budgetMax } = req.body;
    console.log('1. Parsed body');
    
    // Just return success immediately
    return res.json({
      success: true,
      message: 'Test successful',
      query,
      budgetMin,
      budgetMax
    });
    
  } catch (error) {
    console.error('Caught error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
