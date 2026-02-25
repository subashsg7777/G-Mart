"""
Feature Engineering Module
Handles data preprocessing and feature transformation
"""

import pandas as pd
import numpy as np
from typing import Tuple


class FeatureEngineer:
    """Transform raw product data into ML-ready features"""
    
    @staticmethod
    def calculate_price_score(price: float, budget_min: float, budget_max: float) -> float:
        """
        Calculate price score (0-1)
        Higher score = price closer to budget min
        """
        if budget_max == budget_min:
            return 0.5
        price_score = (budget_max - price) / (budget_max - budget_min)
        # Clamp to [0, 1]
        return max(0, min(1, price_score))
    
    @staticmethod
    def normalize_feature(values: pd.Series) -> pd.Series:
        """Normalize feature to [0, 1] range"""
        min_val = values.min()
        max_val = values.max()
        if max_val == min_val:
            return pd.Series([0.5] * len(values))
        return (values - min_val) / (max_val - min_val)
    
    @staticmethod
    def engineer_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, list]:
        """
        Create features for XGBoost ranking model
        
        Args:
            df: DataFrame with raw product data
            
        Returns:
            Tuple of (features_df, feature_names)
        """
        df_features = df.copy()
        
        # 1. Price Score (how well it fits the budget)
        df_features['price_score'] = df_features.apply(
            lambda row: FeatureEngineer.calculate_price_score(
                row['price'], row['budgetMin'], row['budgetMax']
            ),
            axis=1
        )
        
        # 2. Rating normalized (0-1)
        df_features['rating_normalized'] = FeatureEngineer.normalize_feature(
            df_features['averageRating']
        )
        
        # 3. Discount normalized (0-1)
        df_features['discount_normalized'] = FeatureEngineer.normalize_feature(
            df_features['discountPercentage']
        )
        
        # 4. Brand reputation normalized (0-1)
        df_features['brand_score_normalized'] = FeatureEngineer.normalize_feature(
            df_features['brandReputationScore']
        )
        
        # 5. Review count normalized (popularity signal)
        df_features['reviews_normalized'] = FeatureEngineer.normalize_feature(
            df_features['totalReviews']
        )
        
        # 6. Rating * Reviews (quality weighted by popularity)
        df_features['quality_popularity'] = (
            df_features['rating_normalized'] * df_features['reviews_normalized']
        )
        
        # 7. Value ratio (rating per unit price)
        df_features['value_per_price'] = df_features['averageRating'] / (
            df_features['price'] / 1000  # Normalize price in thousands
        )
        df_features['value_per_price'] = FeatureEngineer.normalize_feature(
            df_features['value_per_price']
        )
        
        # 8. Budget fit score (how well centered in budget range)
        df_features['budget_fit'] = 1 - abs(
            (df_features['price'] - df_features['budgetMin']) / 
            (df_features['budgetMax'] - df_features['budgetMin']) - 0.5
        ) * 2
        
        feature_columns = [
            'price_score',
            'rating_normalized',
            'discount_normalized',
            'brand_score_normalized',
            'reviews_normalized',
            'quality_popularity',
            'value_per_price',
            'budget_fit'
        ]
        
        return df_features, feature_columns
    
    @staticmethod
    def prepare_training_data(
        csv_path: str
    ) -> Tuple[pd.DataFrame, np.ndarray, list]:
        """
        Load and prepare training data for XGBoost
        
        Args:
            csv_path: Path to training_data.csv
            
        Returns:
            Tuple of (features_df, labels, feature_names)
        """
        df = pd.read_csv(csv_path)
        
        # Validate required columns
        required_cols = [
            'price', 'discountPercentage', 'averageRating',
            'brandReputationScore', 'totalReviews', 'budgetMin', 'budgetMax', 'label'
        ]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")
        
        # Engineer features
        features_df, feature_names = FeatureEngineer.engineer_features(df)
        
        # Extract labels
        labels = features_df['label'].values
        
        return features_df, labels, feature_names
