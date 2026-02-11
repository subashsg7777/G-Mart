/**
 * Backend Query-Parsing Engine
 * Converts raw natural-language search text into structured API parameters
 * 
 * RULES:
 * - Output ONLY valid JSON
 * - No invented products, brands, prices, or ratings
 * - Use ONLY the user's input text
 * - Product data comes from database, NOT hardcoded
 */

const queryParser = {
  /**
   * Extract product category from search text
   * Ignores brand names (Asian, Puma, Nike, etc.)
   */
  extractCategory: (text) => {
    const categoryPatterns = {
      shoe: /\b(shoe|shoes|sneaker|boot|footwear|trainer|pumps?)\b/i,
      phone: /\b(phone|phones|smartphone|mobile|iphone|android|mobile phone)\b/i,
      laptop: /\b(laptop|laptops|notebook|computer|macbook|ultrabook|pc)\b/i,
      tablet: /\b(tablet|tablets|ipad)\b/i,
      headphone: /\b(headphone|headphones|earphone|earphones|earbud|earbuds|airpod|airpods|speaker|audio)\b/i,
      watch: /\b(watch|watches|smartwatch|smartwatches)\b/i,
      camera: /\b(camera|cameras|dslr|mirrorless)\b/i,
      monitor: /\b(monitor|monitors|display|screen)\b/i,
      keyboard: /\b(keyboard|keyboards|keys)\b/i,
      mouse: /\b(mouse|mice)\b/i,
      speaker: /\b(speaker|speakers|audio)\b/i,
      storage: /\b(storage|ssd|hdd|hard drive|external)\b/i,
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(text)) {
        return category;
      }
    }
    return "product"; // fallback
  },

  /**
   * Extract budget range from search text
   */
  extractBudget: (text) => {
    let budgetMin = 0;
    let budgetMax = 999999;

    // Pattern: "between 1200 and 2000" (with "and")
    const betweenAndPattern = /between\s*₹?(\d+)\s+and\s+₹?(\d+)/i;
    const betweenAndMatch = text.match(betweenAndPattern);
    if (betweenAndMatch) {
      budgetMin = parseInt(betweenAndMatch[1]);
      budgetMax = parseInt(betweenAndMatch[2]);
      return { budgetMin, budgetMax };
    }

    // Pattern: "between 1200-2000" (with dash)
    const betweenDashPattern = /between\s*₹?(\d+)\s*-\s*₹?(\d+)/i;
    const betweenDashMatch = text.match(betweenDashPattern);
    if (betweenDashMatch) {
      budgetMin = parseInt(betweenDashMatch[1]);
      budgetMax = parseInt(betweenDashMatch[2]);
      return { budgetMin, budgetMax };
    }

    // Pattern: "starting from 1200-2000" or "starting from 1200 to 2000"
    const startingFromPattern = /starting\s+from\s*₹?(\d+)\s*[-to]?\s*₹?(\d+)/i;
    const startingMatch = text.match(startingFromPattern);
    if (startingMatch) {
      budgetMin = parseInt(startingMatch[1]);
      budgetMax = parseInt(startingMatch[2]);
      return { budgetMin, budgetMax };
    }

    // Pattern: "1200–2000" or "1200-2000" (range without keywords)
    const rangePattern = /₹?(\d+)\s*[–-]\s*₹?(\d+)/;
    const rangeMatch = text.match(rangePattern);
    if (rangeMatch) {
      budgetMin = parseInt(rangeMatch[1]);
      budgetMax = parseInt(rangeMatch[2]);
      return { budgetMin, budgetMax };
    }

    // Pattern: "under 1500" or "under ₹1500"
    const underPattern = /under\s*₹?(\d+)/i;
    const underMatch = text.match(underPattern);
    if (underMatch) {
      budgetMax = parseInt(underMatch[1]);
      return { budgetMin, budgetMax };
    }

    // Pattern: "below 2000" or "below ₹2000"
    const belowPattern = /below\s*₹?(\d+)/i;
    const belowMatch = text.match(belowPattern);
    if (belowMatch) {
      budgetMax = parseInt(belowMatch[1]);
      return { budgetMin, budgetMax };
    }

    return { budgetMin, budgetMax };
  },

  /**
   * Extract brand mentions from text (simple approach using known brand list)
   */
  extractBrands: (text) => {
    const knownBrands = ['Nike','Adidas','Puma','Reebok','Asics','New Balance','Apple','Samsung','OnePlus','Dell','HP','Lenovo','Sony','Bose','Canon','Nikon','JBL','Logitech','Razer','Corsair'];
    const found = [];
    for (const b of knownBrands) {
      const re = new RegExp('\\b' + b.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b','i');
      if (re.test(text)) found.push(b);
    }
    return found; // array of brands (may be empty)
  },

  /**
   * Extract simple variant info like colors or capacities (e.g., 128gb, blue)
   */
  extractVariants: (text) => {
    const variants = {};
    // color
    const colorMatch = text.match(/\b(black|white|red|blue|green|yellow|pink|grey|gray)\b/i);
    if (colorMatch) variants.color = colorMatch[1].toLowerCase();
    // capacity
    const capMatch = text.match(/(\d{2,4})\s*(gb|mb|tb)\b/i);
    if (capMatch) variants.capacity = `${capMatch[1]}${capMatch[2].toLowerCase()}`;
    return variants;
  },

  /**
   * Detect user intent from search text
   */
  detectIntent: (text) => {
    // Intent: value for money / worth it / affordable
    if (/\b(value.?for.?money|worth|best.*value|affordable|budget|cheap|economical)\b/i.test(text)) {
      return "value";
    }

    // Intent: top rated / reviews / ratings
    if (/\b(top.?rated|reviews|ratings|customer.*review|review.*sort|sort.*review|rated|feedback|satisfaction|positive review)\b/i.test(text)) {
      return "reviews";
    }

    // Intent: best / recommend / pick for me
    if (/\b(best|pick for me|pick me|recommend|suggest|choose|surprise me)\b/i.test(text)) {
      return "best";
    }

    // Otherwise normal search
    return "normal";
  },

  /**
   * Determine sort order based on intent
   */
  determineSortBy: (intent) => {
    const sortMap = {
      "reviews": "reviews",
      "value": "value",
      "best": "ranking",
      "normal": "ranking",
    };
    return sortMap[intent] || "ranking";
  },

  /**
   * Main parsing function
   * @param {string} searchText - Raw user search input
   * @returns {Object} Structured query parameters
   */
  parse: (searchText) => {
    if (!searchText || typeof searchText !== "string") {
      return null;
    }

    const query = queryParser.extractCategory(searchText);
    const { budgetMin, budgetMax } = queryParser.extractBudget(searchText);
    const brands = queryParser.extractBrands(searchText);
    const variants = queryParser.extractVariants(searchText);
    const intent = queryParser.detectIntent(searchText);
    const sortBy = queryParser.determineSortBy(intent);

    return {
      query,
      budgetMin,
      budgetMax,
      brands,
      variants,
      intent,
      sortBy,
    };
  },

  /**
   * Batch parse multiple search queries
   * @param {Array<string>} searchQueries - Array of search texts
   * @returns {Array<Object>} Array of parsed parameters
   */
  parseBatch: (searchQueries) => {
    if (!Array.isArray(searchQueries)) {
      return [];
    }
    return searchQueries.map(query => queryParser.parse(query)).filter(result => result !== null);
  },
};

module.exports = queryParser;
