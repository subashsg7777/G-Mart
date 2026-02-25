#!/bin/bash

# Quick start script for Unix/macOS/Linux users
# Run from: ml-ranking-system folder

echo "========================================"
echo "E-Commerce Ranking System - Quick Start"
echo "========================================"
echo ""

# Check Python
echo "1. Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found"
    echo "Install: brew install python3 (macOS) or apt install python3 (Linux)"
    exit 1
fi
echo "✓ Python $(python3 --version) found"

echo ""
echo "2. Installing dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"

echo ""
echo "3. Training model..."
python3 train.py
if [ $? -ne 0 ]; then
    echo "ERROR: Training failed"
    exit 1
fi
echo "✓ Model trained"

echo ""
echo "========================================"
echo "SETUP COMPLETE!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the API server:"
echo "   python3 -m uvicorn api:app --reload"
echo ""
echo "2. In another terminal, test the API:"
echo "   python3 test_api.py"
echo ""
echo "3. API will be available at:"
echo "   http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
echo "========================================"
