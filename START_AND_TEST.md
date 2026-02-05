═══════════════════════════════════════════════════════════════════════════════
                    HOW TO START & TEST EVERYTHING
═══════════════════════════════════════════════════════════════════════════════

🚀 QUICK START (3 TERMINALS)
═════════════════════════════════════════════════════════════════════════════════

STEP 1: Open Terminal 1 - Start Python ML API
─────────────────────────────────────────────────

Command:
  cd "c:\Users\ASUS\Documents\Programming\G-Mart-master\ml-ranking-system"
  python -c "import uvicorn; uvicorn.run('api:app', host='localhost', port=8001, reload=True)"

Expected Output:
  INFO:     Uvicorn running on http://localhost:8001 (Press CTRL+C to quit)
  INFO:     Application startup complete

What it means: ✅ ML API is running and ready to receive ranking requests


STEP 2: Open Terminal 2 - Start Node.js Backend
────────────────────────────────────────────────

Command:
  cd "c:\Users\ASUS\Documents\Programming\G-Mart-master\backend"
  node server

Expected Output:
  Users File is Running!...
  Server is running on port 5000!
  MongoDB Database Connected!

What it means: ✅ Backend is connected to ML API and MongoDB


STEP 3: Open Terminal 3 - Start React Frontend
───────────────────────────────────────────────

Command:
  cd "c:\Users\ASUS\Documents\Programming\G-Mart-master\g-mart"
  npm start

Expected Output:
  webpack compiled...
  Compiled successfully!

What it means: ✅ Frontend is running and connected to backend


═════════════════════════════════════════════════════════════════════════════════
                           TESTING THE SYSTEM
═════════════════════════════════════════════════════════════════════════════════

TEST 1: Check ML API is Running
────────────────────────────────

Open Terminal 4 (or new PowerShell window):

Command:
  curl http://localhost:8001/health

Expected Response:
  {"status":"healthy","model_loaded":true}

What it means: ✅ ML model is loaded and ready


TEST 2: Check Backend is Connected to ML API
──────────────────────────────────────────────

Command:
  curl http://localhost:5000/api/ranking-status

Expected Response:
  {
    "success": true,
    "rankingServiceAvailable": true,
    "rankingApiUrl": "http://localhost:8001",
    "message": "ML Ranking is ready"
  }

What it means: ✅ Backend found the ML API


TEST 3: Search Products with ML Ranking
─────────────────────────────────────────

Command:
  curl -X POST http://localhost:5000/api/search ^
    -H "Content-Type: application/json" ^
    -d "{\"query\":\"shoe\",\"budgetMin\":1000,\"budgetMax\":1500}"

(Note: ^ is for PowerShell line continuation)

Expected Response:
  {
    "success": true,
    "query": "shoe",
    "budget": {"min": 1000, "max": 1500},
    "totalProducts": 3,
    "results": [
      {
        "rank": 1,
        "productId": "...",
        "productName": "Nike Running Shoe",
        "price": 1200,
        "rating": 4.5,
        "rankingScore": 0.78
      }
    ],
    "usingMLRanking": true
  }

What it means: ✅ Smart search is working with ML ranking!


TEST 4: View ML API Documentation (Interactive)
─────────────────────────────────────────────────

Open Browser:
  http://localhost:8001/docs

You'll see:
  • Swagger UI
  • All API endpoints
  • Test buttons for each endpoint
  • Request/response examples

How to use:
  1. Find /rank endpoint
  2. Click "Try it out"
  3. Paste your product data
  4. Click "Execute"
  5. See response instantly


TEST 5: Open Frontend in Browser
──────────────────────────────────

Open Browser:
  http://localhost:3000

You'll see:
  • Your G-Mart application
  • Search bar
  • Product listings

How to test:
  1. Search for a product (e.g., "shoe")
  2. Set budget: 1000-1500
  3. Click search
  4. Results should be ML-ranked!


═════════════════════════════════════════════════════════════════════════════════
                        DETAILED TESTING GUIDE
═════════════════════════════════════════════════════════════════════════════════

SCENARIO 1: Test with Simple Search
────────────────────────────────────

Request:
  POST http://localhost:5000/api/search
  {
    "query": "watch",
    "budgetMin": 3000,
    "budgetMax": 5000
  }

This will:
  ✓ Find all watches priced 3000-5000
  ✓ Send to ML API for ranking
  ✓ Return top-ranked watches
  ✓ Show ranking scores


SCENARIO 2: Get Explanation for Product
─────────────────────────────────────────

Request:
  POST http://localhost:5000/api/explain
  {
    "productId": "PASTE_ACTUAL_PRODUCT_ID",
    "budgetMin": 1000,
    "budgetMax": 1500
  }

This will:
  ✓ Show why product is ranked high
  ✓ Display feature breakdown
  ✓ Show rating, price fit, brand score, etc.


SCENARIO 3: Test ML API Directly (Advanced)
─────────────────────────────────────────────

Go to: http://localhost:8001/docs

Try /rank endpoint:
  Body: {
    "products": [
      {
        "productId": "1",
        "productName": "Nike Shoe",
        "price": 1200,
        "discountPercentage": 15,
        "averageRating": 4.5,
        "brandReputationScore": 8.5,
        "totalReviews": 450,
        "budgetMin": 1000,
        "budgetMax": 1500
      }
    ]
  }

Response will show:
  ✓ Ranking score (0-1)
  ✓ Product rank
  ✓ Why recommended


═════════════════════════════════════════════════════════════════════════════════
                       QUICK REFERENCE CHEATSHEET
═════════════════════════════════════════════════════════════════════════════════

URLS TO REMEMBER:
  Frontend:        http://localhost:3000
  Backend API:     http://localhost:5000/api
  ML API:          http://localhost:8001
  ML API Docs:     http://localhost:8001/docs

CURL COMMANDS (Copy-Paste):

1. Check ML API:
   curl http://localhost:8001/health

2. Check Backend:
   curl http://localhost:5000/api/ranking-status

3. Search (PowerShell):
   curl -X POST http://localhost:5000/api/search `
     -H "Content-Type: application/json" `
     -d '{\"query\":\"shoe\",\"budgetMin\":1000,\"budgetMax\":1500}'

4. Search (Command Prompt):
   curl -X POST http://localhost:5000/api/search -H "Content-Type: application/json" -d "{\"query\":\"shoe\",\"budgetMin\":1000,\"budgetMax\":1500}"


═════════════════════════════════════════════════════════════════════════════════
                      TROUBLESHOOTING TESTS
═════════════════════════════════════════════════════════════════════════════════

If ML API returns 503 error:
  → ML model not loaded
  → Solution: Check Terminal 1, restart with: python train.py first

If Backend returns 0 results:
  → No products in MongoDB
  → Solution: Add test data to database

If Frontend won't load:
  → Port 3000 in use
  → Solution: Change port: PORT=3001 npm start

If search takes >5 seconds:
  → ML API might be timing out
  → Check Terminal 1 logs


═════════════════════════════════════════════════════════════════════════════════

✅ READY TO TEST!

Just follow these steps:
  1. Open 3 PowerShell windows
  2. Run the START commands (Step 1, 2, 3)
  3. Wait for all to show "running"
  4. Run the TEST commands (in new window)
  5. Open browser to http://localhost:3000

═════════════════════════════════════════════════════════════════════════════════
