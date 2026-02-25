"""
╔═══════════════════════════════════════════════════════════════════╗
║     COMPLETE PRODUCT RANKING SYSTEM - DEPLOYMENT READY           ║
║            Machine Learning for E-Commerce Search                ║
╚═══════════════════════════════════════════════════════════════════╝

PROJECT OVERVIEW
================

A production-ready ML-powered product ranking system that intelligently
ranks products based on user search intent, budget constraints, and
product characteristics.

WHAT IT DOES:
- User searches: "I need best shoe at budget 1000-1500"
- System ranks 50+ products by value for money (not just price)
- Returns ranked products with confidence scores
- Explains why each product is ranked high


ARCHITECTURE
============

                    ┌─────────────────────┐
                    │   Frontend (React)   │
                    │  G-Mart Application  │
                    └──────────┬───────────┘
                               │
                               │ HTTP POST /api/products/search
                               │
                    ┌──────────▼──────────┐
                    │  Node.js Backend    │
                    │  Express + MongoDB  │
                    └──────────┬──────────┘
                               │
                               │ axios.post('/rank')
                               │
                    ┌──────────▼──────────┐
                    │   Python FastAPI    │
                    │   ML Ranking API    │
                    │   (NEW - This!)     │
                    └──────────┬──────────┘
                               │
                               │ Model Prediction
                               │
                    ┌──────────▼──────────┐
                    │  XGBoost Ranker     │
                    │  8-Feature ML Model │
                    └─────────────────────┘


FILES CREATED (12 total)
========================

Core ML System:
✓ feature_engineering.py    - Feature transformation (8 features)
✓ train.py                  - Model training with XGBoost
✓ api.py                    - FastAPI REST service
✓ requirements.txt          - Python dependencies (8 packages)

Data & Models:
✓ data/training_data.csv    - 30 sample products with labels
✓ models/                   - (Created after training)

Integration & Testing:
✓ integration_example.js    - Node.js integration code
✓ test_api.py              - API testing examples

Setup & Quick Start:
✓ quickstart.bat           - Windows setup script
✓ quickstart.sh            - Unix/Linux/macOS setup script
✓ setup.py                 - Alternative Python setup

Documentation:
✓ README.md                - Complete documentation
✓ INTEGRATION.md           - Step-by-step integration guide
✓ SUMMARY.md               - Project summary
✓ This file                - Architecture & deployment guide


FEATURE ENGINEERING (8 Engineered Features)
============================================

Each product gets 8 normalized features (0-1 range):

1. price_score
   └─ How well product price fits within budget
   └─ Formula: (budgetMax - price) / (budgetMax - budgetMin)
   └─ Higher = better value within budget

2. rating_normalized
   └─ Product rating normalized to 0-1
   └─ Input: 0-5 star rating
   └─ Higher = better rated product

3. discount_normalized
   └─ Discount percentage normalized
   └─ Input: 0-100% discount
   └─ Higher = bigger discount

4. brand_score_normalized
   └─ Brand reputation score normalized
   └─ Input: 0-10 brand reputation
   └─ Higher = trusted brand

5. reviews_normalized
   └─ Review count popularity signal
   └─ More reviews = more validated quality
   └─ Higher = more trusted by users

6. quality_popularity
   └─ Combined rating × reviews
   └─ Balances quality with popularity
   └─ Higher = consistent quality with proof

7. value_per_price
   └─ Rating per unit price
   └─ How much quality per rupee
   └─ Higher = better value

8. budget_fit
   └─ How centered in budget range
   └─ Penalizes extremes
   └─ Higher = mid-range positioning


MODEL TRAINING (XGBoost Ranker)
===============================

Algorithm: XGBoost with rank:pairwise objective

How it learns:
  Training Data:
    Product A: rating=4.5, price=1200, label=1 (clicked)
    Product B: rating=4.0, price=1500, label=0 (ignored)
  
  Model learns: A should rank higher than B
  (because user preferred it)

Configuration:
  - Objective: rank:pairwise (pairwise learning-to-rank)
  - Eval Metric: NDCG (Normalized Discounted Cumulative Gain)
  - Max Depth: 5 (prevent overfitting)
  - Learning Rate: 0.1 (smooth training)
  - Iterations: 100 boosting rounds
  - Subsample: 80% (reduce variance)


API ENDPOINTS
=============

1. POST /rank
   ─────────────
   Purpose: Rank a list of products
   
   Request:
     {
       "products": [
         {
           "productId": "1",
           "productName": "Nike Running Shoe",
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
   
   Response:
     {
       "totalProducts": 1,
       "rankedProducts": [
         {
           "productId": "1",
           "productName": "Nike Running Shoe",
           "price": 1200,
           "averageRating": 4.5,
           "rankingScore": 0.75,
           "rank": 1
         }
       ]
     }
   
   Status: 200 OK

2. POST /explain
   ────────────────
   Purpose: Explain why a product got its ranking
   
   Returns feature breakdown showing contribution of each factor
   
   Status: 200 OK

3. GET /health
   ─────────────
   Purpose: Check if service is running
   
   Response:
     {
       "status": "healthy",
       "model_loaded": true
     }
   
   Status: 200 OK


INTEGRATION WITH G-MART
=======================

Current Setup:
  • Frontend: React (g-mart/)
  • Backend: Node.js/Express (backend/)
  • Database: MongoDB

New Integration:
  • Add RankingService class (Node.js)
  • Update /api/products/search route
  • Call Python API for ranking
  • Return ranked results to frontend

Steps:
  1. Copy integration_example.js code
  2. Create backend/services/rankingService.js
  3. Update backend/routes/products.js
  4. Set RANKING_API_URL in .env
  5. Test integration


DEPLOYMENT OPTIONS
===================

Option 1: LOCAL DEVELOPMENT (Quick Start)
─────────────────────────────────────────
Platform: Your Windows/Mac/Linux machine
Steps:
  1. python train.py
  2. python -m uvicorn api:app --reload
  3. Runs on http://localhost:8000

Option 2: DOCKER CONTAINER
──────────────────────────
Platform: Any platform with Docker
File: Dockerfile (provided in INTEGRATION.md)
Steps:
  1. docker build -t gmart-ranking .
  2. docker run -p 8000:8000 gmart-ranking
  3. Runs on http://localhost:8000

Option 3: HEROKU CLOUD
──────────────────────
Platform: Heroku (free tier available)
Cost: Free (5-15 dyno hours) or paid ($5/month)
Steps:
  1. heroku create gmart-ranking-api
  2. git push heroku main
  3. Runs on https://gmart-ranking-api.herokuapp.com

Option 4: AWS EC2
────────────────
Platform: AWS Cloud
Cost: Free tier (t2.micro) or pay-as-you-go
Setup:
  1. Launch EC2 instance (Ubuntu)
  2. SSH and install Python
  3. Run: python -m uvicorn api:app --host 0.0.0.0
  4. Use Nginx reverse proxy
  5. Use Gunicorn for ASGI

Option 5: RAILWAY / RENDER
──────────────────────────
Platform: Modern Python hosting
Cost: Free tier or $5/month
Ease: Very simple (git push deployment)


PERFORMANCE METRICS
===================

Expectations:

API Latency: <500ms
  - Feature engineering: ~10ms
  - Model prediction: ~50ms
  - Total: ~100-200ms

Memory Usage: ~100-200MB
  - Model size: ~10-20MB
  - Runtime: ~80-180MB

Throughput: 1000+ requests/hour
  - Single instance can handle typical load
  - Use load balancer for scale

Accuracy: Depends on training data
  - With 100 samples: ~75% accuracy
  - With 1000 samples: ~85% accuracy
  - With 10000 samples: ~90%+ accuracy


MONITORING & LOGGING
====================

What to monitor:

1. API Availability
   - Is /health endpoint responding?
   - Alert if down for >5 minutes

2. Latency
   - Are responses within <500ms?
   - Alert if >1000ms

3. Error Rate
   - Are <1% of requests failing?
   - Alert if >5% errors

4. Model Quality
   - Are users clicking top-ranked products?
   - Compare CTR before/after ranking
   - A/B test ranking vs. default sort

5. Training Quality
   - Recheck model after retraining
   - Validate on holdout test set


CONTINUOUS IMPROVEMENT
======================

Week 1: Setup & Integration
  ✓ Install dependencies
  ✓ Train initial model
  ✓ Integrate with backend
  ✓ Test API

Week 2-4: Data Collection
  ✓ Log user interactions (clicks)
  ✓ Accumulate 100+ labeled examples
  ✓ Create new training_data.csv

Month 2: First Retrain
  ✓ Run python train.py with new data
  ✓ Test ranking quality
  ✓ A/B test against old model
  ✓ Deploy if better results

Month 3+: Continuous Improvement
  ✓ Monthly retraining
  ✓ Weekly monitoring
  ✓ Feature experiments
  ✓ Model architecture improvements


TROUBLESHOOTING GUIDE
=====================

Problem 1: "No module named 'xgboost'"
Solution: pip install -r requirements.txt

Problem 2: Training fails with "price_score is NaN"
Solution: 
  - Check budgetMin != budgetMax in training data
  - Validate all numeric columns have values

Problem 3: API not connecting from Node.js
Debugging:
  1. Check API is running: python -m uvicorn api:app --reload
  2. Test manually: curl http://localhost:8000/health
  3. Check firewall allows port 8000
  4. Verify RANKING_API_URL in .env

Problem 4: Poor ranking results
Debugging:
  1. Check feature values: POST /explain endpoint
  2. Review training data quality (ensure realistic labels)
  3. Test with test_api.py
  4. Check if price_score makes sense

Problem 5: API too slow (>1000ms)
Solutions:
  1. Use Gunicorn: gunicorn api:app -w 4
  2. Cache predictions for common searches
  3. Profile with: python -m cProfile -s cumtime api.py


SECURITY CONSIDERATIONS
=======================

1. Input Validation
   ✓ Using Pydantic for request validation
   ✓ Type checking and bounds checking

2. CORS Configuration
   ✓ Configured for production use
   ✓ Can restrict origins: allow_origins=["https://yourdomain.com"]

3. Rate Limiting (TODO for production)
   - Implement rate limiting: 1000 requests/hour per IP
   - Use middleware like slowapi

4. Environment Variables
   ✓ Use .env for RANKING_API_URL
   ✓ Never hardcode API keys

5. Error Handling
   ✓ No stack traces in responses
   ✓ Generic error messages to clients


SUCCESS CHECKLIST
=================

Project is ready when all of these are true:

✓ python train.py completes successfully
✓ models/ranking_model.pkl file exists
✓ python api.py starts without errors
✓ http://localhost:8000/health returns {"status": "healthy"}
✓ python test_api.py shows all tests passed
✓ Ranking scores are between 0 and 1
✓ Top-ranked products have high rating and brand score
✓ API latency is <500ms
✓ Node.js can connect to API
✓ RankingService class works in Express routes
✓ React frontend receives ranked products
✓ Products with better value are ranked higher


DOCUMENTATION FILES
===================

README.md (170+ lines)
  - Complete API documentation
  - Installation steps
  - Feature explanations
  - Troubleshooting

INTEGRATION.md (300+ lines)
  - Step-by-step backend integration
  - Express route examples
  - React component example
  - Production deployment checklist
  - Docker configuration

SUMMARY.md (150+ lines)
  - Project overview
  - Success criteria
  - Next steps
  - Key metrics

This file (Architecture Guide)
  - System design
  - Component overview
  - Performance expectations
  - Troubleshooting


GETTING STARTED (RIGHT NOW)
============================

1. Quick Setup (Windows):
   - Double-click: ml-ranking-system/quickstart.bat
   - Wait for completion

2. Quick Setup (Mac/Linux):
   - chmod +x quickstart.sh
   - ./quickstart.sh

3. Manual Setup:
   - cd ml-ranking-system
   - pip install -r requirements.txt
   - python train.py
   - python -m uvicorn api:app --reload

4. Testing:
   - python test_api.py
   - Should see: ✅ All tests passed!

5. Integration:
   - Read INTEGRATION.md
   - Copy RankingService code to backend/services/
   - Update routes/products.js


ESTIMATED TIME INVESTMENT
=========================

Setup:           10 minutes
Training:        5 minutes  
Testing:         10 minutes
Integration:     30 minutes
Total:           ~1 hour

Ongoing (monthly):
  - Collect data: 30 minutes
  - Retrain model: 5 minutes
  - Test: 10 minutes
  - Deploy: 10 minutes
  - Total: ~1 hour/month


NEXT MILESTONE
==============

✓ You've built the ML system foundation
→ Next: Collect real user interaction data
→ Next: Retrain monthly with production data
→ Next: Monitor and improve continuously


═════════════════════════════════════════════════════════════════════

Questions? Check README.md for API docs or INTEGRATION.md for 
step-by-step integration instructions.

═════════════════════════════════════════════════════════════════════
"""
