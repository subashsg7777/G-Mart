"""
Model Training Module
Trains XGBoost ranking model and saves it to disk
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
from pathlib import Path
from feature_engineering import FeatureEngineer


class RankingModelTrainer:
    """Train and manage XGBoost ranking model"""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        self.model = None
        self.feature_names = None
        self.scaler_stats = {}
    
    def train(self, csv_path: str) -> dict:
        """
        Train XGBoost ranker model
        
        Args:
            csv_path: Path to training_data.csv
            
        Returns:
            Dictionary with training metrics
        """
        print("Loading and preparing data...")
        features_df, labels, feature_names = FeatureEngineer.prepare_training_data(csv_path)
        
        self.feature_names = feature_names
        
        # Extract feature matrix
        X = features_df[feature_names].values
        y = labels.astype(int)
        
        print(f"Dataset shape: {X.shape}")
        print(f"Class distribution: {np.bincount(y)}")
        
        # Create DMatrix for XGBoost
        dtrain = xgb.DMatrix(X, label=y)
        
        # XGBoost parameters for ranking
        params = {
            'objective': 'rank:pairwise',  # Pairwise ranking loss
            'eval_metric': 'ndcg',          # Normalized DCG metric
            'max_depth': 5,
            'eta': 0.1,                     # Learning rate
            'gamma': 1.0,
            'min_child_weight': 1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': 42,
            'verbosity': 1
        }
        
        # Train model
        print("\nTraining XGBoost Ranker...")
        self.model = xgb.train(
            params,
            dtrain,
            num_boost_round=100,
            verbose_eval=10
        )
        
        # Save model
        model_path = self.model_dir / "ranking_model.pkl"
        joblib.dump(self.model, model_path)
        print(f"\nModel saved to {model_path}")
        
        # Save feature names
        feature_path = self.model_dir / "feature_names.pkl"
        joblib.dump(self.feature_names, feature_path)
        print(f"Feature names saved to {feature_path}")
        
        return {
            "status": "success",
            "model_path": str(model_path),
            "features_path": str(feature_path),
            "feature_count": len(feature_names),
            "training_samples": len(y)
        }
    
    def load_model(self):
        """Load trained model from disk"""
        model_path = self.model_dir / "ranking_model.pkl"
        features_path = self.model_dir / "feature_names.pkl"
        
        if not model_path.exists() or not features_path.exists():
            raise FileNotFoundError("Model files not found. Train model first.")
        
        self.model = joblib.load(model_path)
        self.feature_names = joblib.load(features_path)
        print(f"Model loaded from {model_path}")
        return self.model, self.feature_names
    
    def predict(self, features_df: pd.DataFrame) -> np.ndarray:
        """
        Predict ranking scores for products
        
        Args:
            features_df: DataFrame with engineered features
            
        Returns:
            Array of ranking scores
        """
        if self.model is None:
            self.load_model()
        
        X = features_df[self.feature_names].values
        dmatrix = xgb.DMatrix(X)
        scores = self.model.predict(dmatrix)
        
        return scores


def main():
    """Main training script"""
    trainer = RankingModelTrainer()
    
    # Train on sample data
    result = trainer.train("data/training_data.csv")
    
    print("\n" + "="*50)
    print("Training Complete!")
    print("="*50)
    print(f"Result: {result}")


if __name__ == "__main__":
    main()
