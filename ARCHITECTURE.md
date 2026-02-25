# Intelligent Search Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Search Bar: "best shoe under 1500"                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  React Navbar Component                            │  │   │
│  │  │  - Input: searchterm state                         │  │   │
│  │  │  - Hook: useNaturalSearch()                        │  │   │
│  │  │  - Action: performSearch(searchterm)               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTPS POST
                       │ /api/search/natural
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVER (Node.js)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Route: POST /api/search/natural                        │   │
│  │  (smartSearchEnhanced.js)                               │   │
│  │                                                          │   │
│  │  Step 1: Parse Natural Language                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ queryParser.parse(searchText)                    │  │   │
│  │  │ ↓                                                 │  │   │
│  │  │ {                                                 │  │   │
│  │  │   query: "shoe"                                  │  │   │
│  │  │   budgetMin: 0                                   │  │   │
│  │  │   budgetMax: 1500                                │  │   │
│  │  │   intent: "best"                                 │  │   │
│  │  │   sortBy: "ranking"                              │  │   │
│  │  │ }                                                 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  Step 2: Query Database                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ MongoDB Find:                                    │  │   │
│  │  │ - cat: {$regex: "shoe"}                          │  │   │
│  │  │ - price: {$gte: 0, $lte: 1500}                   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  Step 3: Sort by Intent                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ if sortBy === "ranking":                         │  │   │
│  │  │   sort(rating × reviews)                         │  │   │
│  │  │ else if sortBy === "reviews":                    │  │   │
│  │  │   sort(rating) → sort(reviews)                   │  │   │
│  │  │ else if sortBy === "value":                      │  │   │
│  │  │   sort(rating/price)                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  Step 4: Return Results                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ {                                                 │  │   │
│  │  │   success: true                                  │  │   │
│  │  │   parsed: {...}                                  │  │   │
│  │  │   totalProducts: 5                               │  │   │
│  │  │   products: [{...}, {...}, ...]                  │  │   │
│  │  │ }                                                 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MongoDB (Database)                                     │   │
│  │  - products collection                                  │   │
│  │  - Fields: name, cat, price, rating, reviews, etc.     │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ JSON Response
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND DISPLAY                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Results.js Component                                   │   │
│  │                                                          │   │
│  │  🔍 Smart Search:                                        │   │
│  │  Category: shoe | Budget: ₹0-₹1500 | Sorted by: ranking│   │
│  │                                                          │   │
│  │  Product Cards:                                          │   │
│  │  1. Nike Air Max - ₹1299 | 4.5⭐ (245 reviews)           │   │
│  │  2. Puma Running - ₹1599 | 4.3⭐ (180 reviews)           │   │
│  │  3. Premium Shoe - ₹1899 | 4.6⭐ (267 reviews)           │   │
│  │  ...                                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Flow Diagram

```
┌─────────────────────┐
│   User Types:       │
│  "best shoe        │
│   under 1500"      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Navbar.js                             │
│   - handleRedirect()                    │
│   - useNaturalSearch hook               │
│   - performSearch(searchterm)           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   useNaturalSearch.js (Hook)            │
│   - Fetch to /api/search/natural        │
│   - Set results state                   │
│   - Set parsed state                    │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Backend: /api/search/natural          │
│   (smartSearchEnhanced.js)              │
│                                         │
│   1. queryParser.parse()                │
│   2. MongoDB find()                     │
│   3. applyIntelligentSort()             │
│   4. return JSON                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Results.js                            │
│   - Display parsed info                 │
│   - Display product cards               │
│   - Show sorted results                 │
│   - Add to cart buttons                 │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Input
```javascript
{
  searchText: "best shoe under 1500"
}
```

### Processing
```javascript
// Step 1: Parse
{
  query: "shoe",
  budgetMin: 0,
  budgetMax: 1500,
  intent: "best",
  sortBy: "ranking"
}

// Step 2: Filter
Database Query:
{
  cat: {$regex: "shoe", $options: 'i'},
  price: {$gte: 0, $lte: 1500}
}

// Step 3: Sort
Sort by: (rating × reviews) DESC

// Step 4: Return
[
  { _id: 1, name: "Nike Air Max", price: 1299, rating: 4.5, reviews: 245 },
  { _id: 2, name: "Puma Running", price: 1599, rating: 4.3, reviews: 180 },
  ...
]
```

### Output
```javascript
{
  success: true,
  searchText: "best shoe under 1500",
  parsed: {
    query: "shoe",
    budgetMin: 0,
    budgetMax: 1500,
    intent: "best",
    sortBy: "ranking"
  },
  totalProducts: 5,
  products: [...]
}
```

---

## Intent Detection Matrix

| Keywords Detected | Intent | Sort Logic | Best For |
|------------------|--------|-----------|----------|
| best, pick, recommend, choose | `best` | rating × reviews | Finding the best products |
| top-rated, reviews, ratings, feedback | `reviews` | rating DESC, reviews DESC | Reviewing popular products |
| value, affordable, budget, economical | `value` | rating/price DESC | Finding good deals |
| Other | `normal` | rating × reviews | General search |

---

## Sorting Algorithms

### Ranking (Best)
```javascript
score = product.rating × product.reviews
// Products with high rating AND many reviews rank highest
```
Example: 4.5⭐ × 245 reviews = 1102.5 (ranks higher)

### Reviews
```javascript
Sort by rating DESC
Then by reviews DESC
// Highest rated, and if tied, most reviewed
```
Example: [4.6⭐, 4.5⭐, 4.3⭐]

### Value for Money
```javascript
score = product.rating / product.price
// High rating with low price ranks highest
```
Example: 4.5 / 1299 ≈ 0.00346 (better value than lower rating at higher price)

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│  User Search                    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Intelligent Search API         │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
    │           │
   ✓            ✗
   │            │
   │            ▼
   │    ┌──────────────────────┐
   │    │  Error Handler       │
   │    │  - Check if empty    │
   │    │  - Log error         │
   │    │  - Return error JSON │
   │    └────────┬─────────────┘
   │             │
   │             ▼
   │    ┌──────────────────────┐
   │    │  Fallback Search     │
   │    │  Traditional regex   │
   │    │  /api/product/search │
   │    └────────┬─────────────┘
   │             │
   └─────────────┤
                 │
                 ▼
         ┌──────────────────┐
         │  Display Results │
         │  (Smart or Basic)│
         └──────────────────┘
```

---

## Performance Characteristics

```
Search Time Breakdown:
├─ Query Parsing .......................... ~5ms
├─ Database Filter ........................ ~30ms
├─ Sorting ............................... ~10ms
├─ Network Latency ....................... ~100ms
└─ Total Response Time ................... ~200ms

Memory Usage:
├─ queryParser module ..................... ~50KB
├─ useNaturalSearch hook .................. ~20KB
├─ In-memory result set (50 products) .... ~500KB

Scalability:
├─ Max products returned: 50
├─ Supports up to 1000 products efficiently
├─ Batch search: up to 100 queries
└─ Recommended: Index on (cat, price, rating)
```

---

## File Dependencies

```
Frontend:
  Navbar.js
  ├── useNaturalSearch.js
  │   └── fetch /api/search/natural
  │
  Results.js
  ├── useNaturalSearch.js (for fallback context)
  └── fetch /api/search/natural (direct)

Backend:
  Server.js
  ├── smartSearchEnhanced.js
  │   ├── queryParser.js
  │   ├── Product model
  │   └── axios (optional, for ML ranking)
  │
  queryParser.js (standalone)
  └── No external dependencies
```

---

## Extension Points

```
Future Enhancements:
├─ ML Ranking (/api/rank endpoint)
├─ Search Suggestions (autocomplete)
├─ User History (saved searches)
├─ Analytics (popular searches)
├─ Voice Input (speech-to-text)
├─ Personalization (user preferences)
├─ Typo Correction (fuzzy matching)
└─ Multi-language Support (localization)
```
