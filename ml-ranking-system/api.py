"""
FastAPI Service
Exposes ranking model via REST API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
import numpy as np
from feature_engineering import FeatureEngineer
from train import RankingModelTrainer


# Pydantic models for request/response
class Product(BaseModel):
    """Single product for ranking"""
    productId: str
    productName: str
    price: float
    discountPercentage: float = Field(ge=0, le=100)
    averageRating: float = Field(ge=0, le=5)
    brandReputationScore: float = Field(ge=0, le=10)
    totalReviews: int = Field(ge=0)
    budgetMin: float = Field(gt=0)
    budgetMax: float = Field(gt=0)


class RankingRequest(BaseModel):
    """Request for ranking products"""
    products: List[Product]


class RankedProduct(BaseModel):
    """Product with ranking score"""
    productId: str
    productName: str
    price: float
    averageRating: float
    discountPercentage: float
    brandReputationScore: float
    rankingScore: float
    rank: int


class RankingResponse(BaseModel):
    """Response with ranked products"""
    totalProducts: int
    rankedProducts: List[RankedProduct]


# Initialize FastAPI app
app = FastAPI(
    title="E-Commerce Product Ranking API",
    description="ML-powered product ranking system",
    version="1.0.0"
)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally
trainer = None


@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    global trainer
    trainer = RankingModelTrainer()
    try:
        trainer.load_model()
        print("✓ Model loaded successfully")
    except FileNotFoundError:
        print("⚠ Model not found. Train with: python train.py")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": trainer.model is not None
    }


@app.post("/rank", response_model=RankingResponse)
async def rank_products(request: RankingRequest) -> RankingResponse:
    """
    Rank products using ML model
    
    Takes a list of products and returns them ranked by value.
    Higher ranking score = better product match.
    """
    
    if not trainer.model:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Try again later."
        )
    
    if not request.products:
        raise HTTPException(
            status_code=400,
            detail="Products list cannot be empty"
        )
    
    try:
        # Convert to DataFrame
        products_data = [
            {
                'productId': p.productId,
                'productName': p.productName,
                'price': p.price,
                'discountPercentage': p.discountPercentage,
                'averageRating': p.averageRating,
                'brandReputationScore': p.brandReputationScore,
                'totalReviews': p.totalReviews,
                'budgetMin': p.budgetMin,
                'budgetMax': p.budgetMax,
            }
            for p in request.products
        ]
        
        df = pd.DataFrame(products_data)
        
        # Engineer features
        df_features, feature_names = FeatureEngineer.engineer_features(df)
        
        # Get predictions
        ranking_scores = trainer.predict(df_features)
        
        # Combine results
        results = []
        for idx, (_, row) in enumerate(df.iterrows()):
            results.append({
                'productId': row['productId'],
                'productName': row['productName'],
                'price': row['price'],
                'averageRating': row['averageRating'],
                'discountPercentage': row['discountPercentage'],
                'brandReputationScore': row['brandReputationScore'],
                'rankingScore': float(ranking_scores[idx])
            })
        
        # Sort by ranking score (highest first)
        results.sort(key=lambda x: x['rankingScore'], reverse=True)
        
        # Add rank
        for rank, result in enumerate(results, 1):
            result['rank'] = rank
        
        return RankingResponse(
            totalProducts=len(results),
            rankedProducts=[RankedProduct(**r) for r in results]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error ranking products: {str(e)}"
        )


@app.post("/explain")
async def explain_ranking(request: RankingRequest):
    """
    Explain ranking scores for a single product
    """
    if not request.products:
        raise HTTPException(status_code=400, detail="No product provided")
    
    product = request.products[0]
    
    # Prepare data
    df = pd.DataFrame([{
        'productId': product.productId,
        'productName': product.productName,
        'price': product.price,
        'discountPercentage': product.discountPercentage,
        'averageRating': product.averageRating,
        'brandReputationScore': product.brandReputationScore,
        'totalReviews': product.totalReviews,
        'budgetMin': product.budgetMin,
        'budgetMax': product.budgetMax,
    }])
    
    # Engineer features
    df_features, feature_names = FeatureEngineer.engineer_features(df)
    
    # Return feature values for explainability
    return {
        "productId": product.productId,
        "productName": product.productName,
        "featureBreakdown": {
            feature: float(df_features[feature].iloc[0])
            for feature in feature_names
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
