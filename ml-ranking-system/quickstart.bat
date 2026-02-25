@echo off
REM Quick start script for Windows users
REM Run this from: ml-ranking-system folder

echo ===============================================
echo E-Commerce Ranking System - Quick Start
echo ===============================================

echo.
echo 1. Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not installed!
    echo Download from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo OK - Python found

echo.
echo 2. Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK - Dependencies installed

echo.
echo 3. Training model...
python train.py
if errorlevel 1 (
    echo ERROR: Training failed
    pause
    exit /b 1
)
echo OK - Model trained

echo.
echo ===============================================
echo SETUP COMPLETE!
echo ===============================================
echo.
echo Next steps:
echo.
echo 1. Start the API server:
echo    python -m uvicorn api:app --reload
echo.
echo 2. In another terminal, test the API:
echo    python test_api.py
echo.
echo 3. API will be available at:
echo    http://localhost:8000
echo    Docs: http://localhost:8000/docs
echo.
echo ===============================================
pause
