# Quick Reference Card - Intelligent Search

## 🚀 Quick Start (30 seconds)

### Backend Already Running?
```bash
cd backend
node Server.js
# Server runs on http://localhost:5000
```

### Frontend Search Bar Works?
- User types: `"best shoe under 1500"`
- Frontend sends to backend API
- Backend returns sorted results
- ✅ Done!

---

## 📝 Common Search Examples

| User Input | Parsed As | Result |
|-----------|-----------|--------|
| `best shoe under 1500` | shoe, 0-1500, best | Top shoes by rating×reviews |
| `shoe reviews 1200-2000` | shoe, 1200-2000, reviews | Highest rated shoes |
| `affordable phone under 30k` | phone, 0-30000, value | Best value phones |
| `laptop between 50k-100k` | laptop, 50000-100000, best | Top ranked laptops |

---

## 🔌 API Reference

### Single Search
```
POST /api/search/natural
{ "searchText": "best shoe under 1500" }

Response:
{
  "success": true,
  "parsed": {
    "query": "shoe",
    "budgetMin": 0,
    "budgetMax": 1500,
    "intent": "best",
    "sortBy": "ranking"
  },
  "totalProducts": 5,
  "products": [...]
}
```

### Batch Search
```
POST /api/search/batch
{ "searchTexts": ["query1", "query2"] }

Response:
{
  "success": true,
  "totalQueries": 2,
  "results": [...]
}
```

---

## ⚙️ Component Usage

### Navbar (Search Input)
```javascript
import { useNaturalSearch } from './hooks/useNaturalSearch';

function Navbar() {
  const { performSearch } = useNaturalSearch();
  
  const handleSearch = () => {
    performSearch(searchterm);
  };
  
  return (
    <input onChange={e => setSearchterm(e.target.value)} />
    <button onClick={handleSearch}>Search</button>
  );
}
```

### Results (Display)
```javascript
function Results() {
  const { performSearch, results, parsed } = useNaturalSearch();
  
  useEffect(() => {
    performSearch(searchterm);
  }, [searchterm]);
  
  return (
    <div>
      <p>Category: {parsed?.query}</p>
      <p>Budget: ₹{parsed?.budgetMin}-₹{parsed?.budgetMax}</p>
      {results.map(product => (...))}
    </div>
  );
}
```

---

## 🎯 Intent Detection (Quick Reference)

| Contains | Intent | Sort By |
|----------|--------|---------|
| best, pick, recommend | `best` | popularity |
| reviews, top-rated | `reviews` | rating |
| value, affordable | `value` | value ratio |
| other | `normal` | popularity |

---

## 💰 Budget Formats (Quick Reference)

| Pattern | Example | Result |
|---------|---------|--------|
| under | "under 1500" | 0-1500 |
| below | "below 2000" | 0-2000 |
| between | "between 1200-2000" | 1200-2000 |
| range | "1000-1200" | 1000-1200 |
| starting from | "starting from 1200-2000" | 1200-2000 |

---

## 🧪 Testing

### Test Backend
```bash
cd backend
node test_queryParser.js        # Test parser
node searchIntegration.js       # Test full flow
```

### Test Frontend
```javascript
// In browser console
import { useNaturalSearch } from './hooks/useNaturalSearch';
const { performSearch } = useNaturalSearch();
await performSearch('best shoe under 1500');
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `backend/utils/queryParser.js` | Parse natural language |
| `backend/routes/smartSearchEnhanced.js` | Search API |
| `g-mart/src/hooks/useNaturalSearch.js` | React hook |
| `g-mart/src/Navbar.js` | Search bar UI |
| `g-mart/src/Results.js` | Results display |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 on API | Check Server.js has smartSearchEnhanced route |
| Empty results | Verify DB has products with matching category |
| Wrong sorting | Check product.rating and product.reviews exist |
| No smart info shown | Ensure Results.js imports useNaturalSearch |

---

## 📊 Sorting Formulas

### Best (ranking)
```
score = rating × reviewCount
highest score = best product
```

### Reviews
```
1. Sort by rating DESC
2. Then by reviewCount DESC
```

### Value
```
score = rating / price
highest score = best value
```

---

## 🔄 Data Flow

```
User Input
   ↓
Navbar.js (useNaturalSearch)
   ↓
POST /api/search/natural
   ↓
Backend: queryParser.parse()
   ↓
MongoDB filter + sort
   ↓
Results.js display
```

---

## ✅ What Works

- ✅ Natural language parsing
- ✅ Budget range extraction
- ✅ Intent detection
- ✅ Smart sorting
- ✅ Product filtering
- ✅ Error handling
- ✅ Fallback search

---

## 📝 Notes

- Backend server must be running (port 5000)
- Database needs `rating` and `reviews` fields
- Frontend assumes `http://localhost:5000` API
- All parsing happens on backend (scalable)
- Results limited to 50 products per query

---

## 🎓 Learn More

- Full guide: `INTELLIGENT_SEARCH_GUIDE.md`
- Code examples: `SEARCH_EXAMPLES.jsx`
- Architecture: `ARCHITECTURE.md`
- This summary: `IMPLEMENTATION_SUMMARY.md`

---

## 💡 Pro Tips

1. **Better Results**: Keep product ratings & reviews updated
2. **Performance**: Create MongoDB index on `(cat, price)`
3. **User Experience**: Show parsed info to users (shown in Results)
4. **Testing**: Use test files to verify functionality
5. **Debug**: Check browser console for API responses

---

## 📞 Support

For issues:
1. Check test files for working examples
2. Verify backend is running
3. Check MongoDB connection
4. Review INTELLIGENT_SEARCH_GUIDE.md
5. Check ARCHITECTURE.md for flow diagrams
