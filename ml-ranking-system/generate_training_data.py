"""
Generate training data from MongoDB for ML model retraining
"""

import pandas as pd
import numpy as np
from pymongo import MongoClient
from pathlib import Path


def generate_training_data():
    """Connect to MongoDB and generate training data CSV"""
    
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['GmartDb']
    products_collection = db['products']
    brands_collection = db['brandreputations']
    
    print("Fetching products from MongoDB...")
    products = list(products_collection.find({}))
    print(f"Found {len(products)} products")
    
    # Build brand reputation map
    print("Fetching brand reputations...")
    brand_reps = list(brands_collection.find({}))
    brand_rep_map = {}
    for br in brand_reps:
        brand_rep_map[br['brand']] = br.get('reputationScore', 5)
    print(f"Fetched {len(brand_rep_map)} brand reputations")
    
    # Generate training data
    rows = []
    for product in products:
        brand = product.get('brand', 'Unknown')
        price = product.get('price', 1000)
        
        # Create random budget ranges for training
        budget_min = max(0, price - 500)
        budget_max = price + 500
        
        # Create quality label based on product attributes
        rating = product.get('averageRating', 3) / 5.0  # Normalize to 0-1
        reviews = min(product.get('totalReviews', 0), 100) / 100.0  # Normalize
        brand_score = brand_rep_map.get(brand, 5) / 10.0  # Normalize to 0-1
        price_score = max(0, 1 - (price / 10000))  # Lower price = higher score
        
        # Calculate quality label (0-4 scale)
        quality = rating * 0.3 + reviews * 0.25 + brand_score * 0.25 + price_score * 0.2
        label = min(4, int(quality * 5))
        
        row = {
            'price': price,
            'discountPercentage': product.get('discount', 0),
            'averageRating': product.get('averageRating', 3),
            'brandReputationScore': brand_rep_map.get(brand, 5),
            'totalReviews': product.get('totalReviews', 0),
            'budgetMin': budget_min,
            'budgetMax': budget_max,
            'label': label
        }
        rows.append(row)
    
    # Create DataFrame and save CSV
    df = pd.DataFrame(rows)
    output_dir = Path('data')
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / 'training_data.csv'
    
    df.to_csv(output_path, index=False)
    print(f"\nTraining data saved to {output_path}")
    print(f"Total samples: {len(df)}")
    print(f"Label distribution:\n{df['label'].value_counts().sort_index()}")
    
    client.close()


if __name__ == '__main__':
    generate_training_data()
