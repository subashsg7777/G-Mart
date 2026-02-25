@echo off
setlocal

echo === (1/4) Generating synthetic 6500-row SmartSearch dataset ===
py "%~dp0generate_smartsearch_dataset.py"
if errorlevel 1 (
  echo Failed to generate dataset.
  exit /b 1
)

echo === (2/4) Installing Python dependencies for training + serving ===
py -m pip install -r "%~dp0requirements.txt"
if errorlevel 1 (
  echo Failed to install Python dependencies.
  exit /b 1
)

echo === (3/4) Training SmartSearch AI model ===
py "%~dp0train_smartsearch_model.py"
if errorlevel 1 (
  echo Failed to train model.
  exit /b 1
)

echo === (4/4) Starting AI Parser service on port 8010 ===
start "G-Mart AI Parser" cmd /k "cd /d \"%~dp0..\" & py -m uvicorn ai.serve_smartsearch_model:app --host 127.0.0.1 --port 8010"

echo.
echo AI Parser started. Now starting backend with AI enabled...
echo.

set AI_PARSER_ENABLED=true
set AI_PARSER_URL=http://127.0.0.1:8010

cd /d "%~dp0.."
node Server.js
