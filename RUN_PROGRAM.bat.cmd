@echo off
title RPN Calculator Setup & Launch
echo ==========================================
echo 1. Checking Python Dependencies...
echo ==========================================

:: This installs the necessary libraries quietly if they are missing
pip install fastapi uvicorn --quiet

echo 2. Starting Python Backend...
:: Using 'start' opens the backend in its own window
start cmd /k "cd Backend && py main.py"

echo 3. Waiting for Backend to initialize...
timeout /t 5

echo 4. Opening Website...
:: Opens your local HTML file
start "" "index.html"

echo ==========================================
echo Setup Complete! Keep the black window open.
echo ==========================================
pause