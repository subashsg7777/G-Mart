const express = require('express');
const router = express.Router();
const axios = require('axios');

// AI parser service config
const AI_PARSER_URL = process.env.AI_PARSER_URL || 'http://127.0.0.1:8010';

router.post('/search/ai-parse', async (req, res) => {
  try {
    const { searchText } = req.body;
    if (!searchText || typeof searchText !== 'string') {
      return res.status(400).json({ success: false, error: 'searchText is required and must be a string' });
    }

    const response = await axios.post(`${AI_PARSER_URL}/parse`, { searchText }, { timeout: 5000 });
    return res.json({ success: true, parsed: response.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;