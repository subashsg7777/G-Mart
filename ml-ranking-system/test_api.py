"""
QUICK START GUIDE - Product Ranking System
============================================
"""

# Step 1: Navigate to the project
# cd ml-ranking-system

# Step 2: Install dependencies
# pip install -r requirements.txt

# Step 3: Train the model (one-time setup)
# python train.py

# Step 4: Start the API
# python -m uvicorn api:app --reload

# Step 5: Test the API

import requests
import json

BASE_URL = "http://localhost:8000"

def test_ranking():
    """Test the ranking endpoint"""
    
    # Sample products to rank
    payload = {
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
            },
            {
                "productId": "2",
                "productName": "Adidas Running Shoe",
                "price": 1100,
                "discountPercentage": 20,
                "averageRating": 4.4,
                "brandReputationScore": 8.7,
                "totalReviews": 420,
                "budgetMin": 1000,
                "budgetMax": 1500
            },
            {
                "productId": "3",
                "productName": "Generic Budget Shoe",
                "price": 650,
                "discountPercentage": 30,
                "averageRating": 3.7,
                "brandReputationScore": 5.0,
                "totalReviews": 160,
                "budgetMin": 1000,
                "budgetMax": 1500
            }
        ]
    }
    
    print("📤 Sending ranking request...")
    print(json.dumps(payload, indent=2))
    
    response = requests.post(f"{BASE_URL}/rank", json=payload)
    
    print("\n📥 Response:")
    print(json.dumps(response.json(), indent=2))
    
    return response.json()


def test_explain():
    """Test the explain endpoint"""
    
    payload = {
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
    
    print("📤 Requesting explanation...")
    response = requests.post(f"{BASE_URL}/explain", json=payload)
    
    print("\n📥 Explanation:")
    result = response.json()
    print(json.dumps(result, indent=2))
    
    print("\nFeature Importance:")
    for feature, value in result['featureBreakdown'].items():
        print(f"  {feature}: {value:.3f}")


def test_health():
    """Test health check"""
    response = requests.get(f"{BASE_URL}/health")
    print("API Health:", response.json())


if __name__ == "__main__":
    print("="*60)
    print("TESTING RANKING API")
    print("="*60)
    
    try:
        print("\n1️⃣  Health Check:")
        test_health()
        
        print("\n" + "="*60)
        print("2️⃣  Ranking Products:")
        print("="*60)
        test_ranking()
        
        print("\n" + "="*60)
        print("3️⃣  Explaining Ranking:")
        print("="*60)
        test_explain()
        
        print("\n✅ All tests passed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Is it running?")
        print("   Run: python -m uvicorn api:app --reload")
