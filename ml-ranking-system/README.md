# E-Commerce Product Ranking System

Production-ready ML-based ranking system using XGBoost learning-to-rank.

## Architecture

```
ml-ranking-system/
├── data/
│   └── training_data.csv          # Training dataset with labels
├── models/
│   ├── ranking_model.pkl          # Trained XGBoost model
│   └── feature_names.pkl          # Feature column names
├── feature_engineering.py         # Feature transformation
├── train.py                       # Model training script
├── api.py                         # FastAPI service
├── integration_example.js         # Node.js integration
├── requirements.txt               # Python dependencies
└── README.md
```

## Setup

### 1. Install Dependencies
```bash
cd ml-ranking-system
pip install -r requirements.txt
```

### 2. Prepare Training Data
The `data/training_data.csv` contains:
- **productId**: Unique identifier
- **productName**: Product name
- **price**: Price in currency
- **discountPercentage**: Discount %
- **averageRating**: 0-5 star rating
- **brandReputationScore**: 0-10 brand score
- **totalReviews**: Number of reviews
- **budgetMin/budgetMax**: User budget range
- **label**: 1 = clicked/bought, 0 = ignored

### 3. Train the Model
```bash
python train.py
```

This will:
- Load training data
- Engineer 8 features per product
- Train XGBoost ranker with rank:pairwise objective
- Save model to `models/ranking_model.pkl`

### 4. Start API Server
```bash
python api.py
```

Server runs on `http://localhost:8000`

## API Endpoints

### POST /rank
Rank a list of products

**Request:**
```json
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
```

**Response:**
```json
{
  "totalProducts": 1,
  "rankedProducts": [
    {
      "productId": "1",
      "productName": "Nike Running Shoe",
      "price": 1200,
      "averageRating": 4.5,
      "discountPercentage": 15,
      "brandReputationScore": 8.5,
      "rankingScore": 0.75,
      "rank": 1
    }
  ]
}
```

### POST /explain
Explain ranking score breakdown

**Request:**
```json
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
```

**Response:**
```json
{
  "productId": "1",
  "productName": "Nike Running Shoe",
  "featureBreakdown": {
    "price_score": 0.8,
    "rating_normalized": 0.9,
    "discount_normalized": 0.6,
    "brand_score_normalized": 0.85,
    "reviews_normalized": 0.7,
    "quality_popularity": 0.63,
    "value_per_price": 0.75,
    "budget_fit": 0.6
  }
}
```

### GET /health
Check if service is running

## Feature Engineering

The model uses 8 engineered features:

1. **price_score**: How well price fits budget (0-1)
2. **rating_normalized**: Product rating normalized (0-1)
3. **discount_normalized**: Discount % normalized (0-1)
4. **brand_score_normalized**: Brand reputation (0-1)
5. **reviews_normalized**: Review count popularity (0-1)
6. **quality_popularity**: Rating × Reviews (0-1)
7. **value_per_price**: Rating per unit price (0-1)
8. **budget_fit**: How centered in budget range (0-1)

## Training Details

**XGBoost Configuration:**
- **Objective**: rank:pairwise (learns preference between pairs)
- **Metric**: NDCG (Normalized Discounted Cumulative Gain)
- **Max Depth**: 5
- **Learning Rate**: 0.1
- **Iterations**: 100

**Training Logic:**
- Model learns which products users prefer
- Label=1: User clicked/bought (positive signal)
- Label=0: User ignored (negative signal)
- Pairwise ranking learns relative ordering

## Integration with Node.js

See `integration_example.js` for:
1. RankingService class
2. Express route integration
3. React component usage

Quick example:
```javascript
const RankingService = require('./rankingService');

const rankedProducts = await RankingService.rankProducts([
  {
    productId: '1',
    productName: 'Nike Shoe',
    price: 1200,
    rating: 4.5,
    discountPercentage: 15,
    brandReputationScore: 8.5,
    totalReviews: 450,
    budgetMin: 1000,
    budgetMax: 1500
  }
]);
```

## Production Deployment

1. **Train on real data**: Replace `training_data.csv` with production data
2. **Monitor model**: Track ranking quality with A/B tests
3. **Retrain**: Periodic retraining (weekly/monthly) with new data
4. **Scale API**: Use Gunicorn + Nginx for high traffic
5. **Cache predictions**: Redis for frequently ranked product sets

## Troubleshooting

**Model not found error:**
```bash
# Retrain the model
python train.py
```

**API connection error from Node.js:**
- Ensure Python API is running on port 8000
- Check firewall settings
- Verify CORS is enabled (it is by default)

**Poor ranking results:**
- Train with more labeled data
- Adjust feature weights in feature_engineering.py
- Use different XGBoost parameters in train.py

## Next Steps

1. Integrate with your MongoDB/PostgreSQL for real product data
2. Collect user interaction data (clicks, purchases) as labels
3. Set up automated retraining pipeline
4. Add A/B testing to measure ranking quality
5. Deploy to production server (AWS, Azure, etc.)
