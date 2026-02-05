"""
Setup and Configuration Script
Quick start for the ranking system
"""

import os
import subprocess
import sys
from pathlib import Path


def check_python_version():
    """Ensure Python 3.8+"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    print(f"✓ Python {sys.version.split()[0]}")


def install_dependencies():
    """Install required packages"""
    print("\n📦 Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("✓ Dependencies installed")


def check_model_exists():
    """Check if model is trained"""
    model_path = Path("models/ranking_model.pkl")
    if model_path.exists():
        print("✓ Model already trained")
        return True
    return False


def train_model():
    """Train the model"""
    print("\n🤖 Training model...")
    subprocess.check_call([sys.executable, "train.py"])
    print("✓ Model trained successfully")


def start_api():
    """Start FastAPI server"""
    print("\n🚀 Starting API server...")
    print("📍 http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    subprocess.call([sys.executable, "-m", "uvicorn", "api:app", "--reload"])


def main():
    """Setup and run"""
    print("="*50)
    print("E-Commerce Ranking System Setup")
    print("="*50)
    
    check_python_version()
    
    try:
        install_dependencies()
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    if not check_model_exists():
        try:
            train_model()
        except subprocess.CalledProcessError:
            print("❌ Failed to train model")
            sys.exit(1)
    
    try:
        start_api()
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")


if __name__ == "__main__":
    main()
