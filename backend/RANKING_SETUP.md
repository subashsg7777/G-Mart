═══════════════════════════════════════════════════════════════════════════════
                ML RANKING INTEGRATION - G-MART BACKEND SETUP
═══════════════════════════════════════════════════════════════════════════════

✅ WHAT'S BEEN DONE:
═══════════════════════════════════════════════════════════════════════════════

1. Created: backend/routes/smartSearch.js (290 lines)
   • Implements /api/search endpoint
   • Integrates with ML ranking system
   • Fallback ranking when ML unavailable
   • Uses existing Product database

2. Fixed: Node.js module error
   • Added missing smartSearch route file
   • Configured to use ML Ranking API
   • Ready for integration testing


🚀 NEXT STEPS TO GET IT WORKING:
═══════════════════════════════════════════════════════════════════════════════

STEP 1: Start the Python ML API (in one terminal)
────────────────────────────────────────────────────
cd ml-ranking-system
python train.py                    (one-time: trains the model)
python -m uvicorn api:app --reload

Expected output:
  ✓ Uvicorn running on http://0.0.0.0:8000
  ✓ Application startup complete

STEP 2: Configure Backend Environment
──────────────────────────────────────
Create/Update: backend/.env

Add these lines:
  RANKING_API_URL=http://localhost:8000
  RANKING_ENABLED=true

Optional:
  NODE_ENV=development
  PORT=5000


STEP 3: Start the Node.js Backend (in new terminal)
─────────────────────────────────────────────────────
cd backend
npm install    (if not already done)
node server

Expected output:
  ✓ Users File is Running!...
  ✓ MongoDB Database Connected!
  ✓ Backend running on http://localhost:5000


STEP 4: Test the Smart Search API
──────────────────────────────────
In a new terminal, run:

curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "shoe",
    "budgetMin": 1000,
    "budgetMax": 1500,
    "limit": 10
  }'

Or use Postman/Insomnia with:
  POST http://localhost:5000/api/search
  Body (JSON):
  {
    "query": "shirt",
    "category": "clothing",
    "budgetMin": 500,
    "budgetMax": 2000
  }


STEP 5: Check Ranking Service Status
─────────────────────────────────────
curl http://localhost:5000/api/ranking-status

Expected response:
  {
    "success": true,
    "rankingServiceAvailable": true,
    "rankingApiUrl": "http://localhost:8000",
    "message": "ML Ranking is ready"
  }


═══════════════════════════════════════════════════════════════════════════════
                              API ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

1. POST /api/search
   ─────────────────
   Purpose: Search and rank products
   
   Request Body:
   {
     "query": "shoe",                 // optional: search term
     "category": "footwear",          // optional: product category
     "budgetMin": 1000,               // required: minimum price
     "budgetMax": 1500,               // required: maximum price
     "limit": 50                      // optional: max results (default: 50)
   }
   
   Response:
   {
     "success": true,
     "query": "shoe",
     "budget": { "min": 1000, "max": 1500 },
     "totalProducts": 12,
     "results": [
       {
         "rank": 1,
         "productId": "60d5ec49c1234...",
         "productName": "Nike Running Shoe",
         "price": 1200,
         "rating": 4.5,
         "reviews": 450,
         "rankingScore": 0.78,
         "valueScore": 0.75
       }
     ],
     "usingMLRanking": true
   }


2. POST /api/explain
   ──────────────────
   Purpose: Get explanation for product ranking
   
   Request Body:
   {
     "productId": "60d5ec49c1234...",
     "budgetMin": 1000,
     "budgetMax": 1500
   }
   
   Response:
   {
     "success": true,
     "productId": "60d5ec49c1234...",
     "productName": "Nike Running Shoe",
     "explanation": {
       "featureBreakdown": {
         "price_score": 0.8,
         "rating_normalized": 0.9,
         "quality_score": 0.85
       },
       "whyRecommended": "Strong rating of 4.5/5, Verified by 450 customers"
     }
   }


3. GET /api/ranking-status
   ───────────────────────
   Purpose: Check if ML ranking service is available
   
   Response:
   {
     "success": true,
     "rankingServiceAvailable": true,
     "rankingApiUrl": "http://localhost:8000"
   }


═══════════════════════════════════════════════════════════════════════════════
                         INTEGRATION WITH FRONTEND
═══════════════════════════════════════════════════════════════════════════════

In your React component (e.g., Search.js):

import axios from 'axios';

async function searchProducts() {
  try {
    const response = await axios.post('/api/search', {
      query: 'shoes',
      budgetMin: 1000,
      budgetMax: 1500
    });

    console.log('Ranked Products:', response.data.results);
    // response.data.results is already sorted by ranking score
  } catch (error) {
    console.error('Search failed:', error);
  }
}


═══════════════════════════════════════════════════════════════════════════════
                           TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Problem: "Cannot find module './routes/smartSearch'"
Solution: ✅ FIXED - smartSearch.js file is now created

Problem: Backend won't start
Steps:
  1. Delete node_modules folder
  2. Run: npm install
  3. Run: node server

Problem: Search returns 0 products
Check:
  • MongoDB is running
  • Database has products
  • Budget range is correct
  • Try: curl http://localhost:5000/api/products

Problem: ML Ranking not working (fallback ranking used)
Check:
  • Python API running: http://localhost:8000/health
  • RANKING_API_URL in .env is correct
  • Model trained: models/ranking_model.pkl exists
  • No network firewall blocking port 8000

Problem: "axios not found"
Solution: npm install axios

Problem: MongoDB connection error
Solution:
  • Start MongoDB: mongod
  • Check connection string in server.js
  • Default: mongodb://localhost:27017/G-Mart


═══════════════════════════════════════════════════════════════════════════════
                         QUICK TESTING SEQUENCE
═══════════════════════════════════════════════════════════════════════════════

TERMINAL 1 - Start Python ML API:
  cd ml-ranking-system
  python -m uvicorn api:app --reload

TERMINAL 2 - Start Node.js Backend:
  cd backend
  node server

TERMINAL 3 - Test the Endpoints:
  
  1. Check ML API Health:
     curl http://localhost:8000/health
  
  2. Check Backend Health:
     curl http://localhost:5000/api/ranking-status
  
  3. Search Products:
     curl -X POST http://localhost:5000/api/search \
       -H "Content-Type: application/json" \
       -d '{"query":"shoe","budgetMin":1000,"budgetMax":1500}'
  
  4. Get Product Explanation:
     curl -X POST http://localhost:5000/api/explain \
       -H "Content-Type: application/json" \
       -d '{"productId":"YOUR_PRODUCT_ID","budgetMin":1000,"budgetMax":1500}'


═══════════════════════════════════════════════════════════════════════════════
                          FILE STRUCTURE RECAP
═══════════════════════════════════════════════════════════════════════════════

G-Mart-master/
├── ml-ranking-system/              ← ML Python API
│   ├── train.py
│   ├── api.py
│   ├── feature_engineering.py
│   └── models/
│       ├── ranking_model.pkl       ← Created after python train.py
│       └── feature_names.pkl
│
├── backend/                        ← Node.js Express Server
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── razorpay.js
│   │   └── smartSearch.js          ← ✅ NEW FILE (CREATED)
│   ├── models/
│   │   ├── Product.js
│   │   ├── Users.js
│   │   └── ...
│   └── package.json
│
└── g-mart/                         ← React Frontend
    ├── src/
    │   ├── Search.js (or similar)
    │   └── ...
    └── package.json


═══════════════════════════════════════════════════════════════════════════════

✅ You're all set! Follow the "NEXT STEPS" section above to get everything running.

═══════════════════════════════════════════════════════════════════════════════
