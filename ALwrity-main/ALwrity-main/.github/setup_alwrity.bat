@echo off
REM ALwrity Complete Setup Script for Windows
REM This script sets up both frontend and backend for local development

echo ================================
echo 🚀 ALwrity Setup Script (Windows)
echo ================================
echo.

REM Check if we're in the project root
if not exist "frontend\" (
    echo ❌ Error: frontend directory not found
    echo Please navigate to the AI-Writer directory and try again.
    exit /b 1
)
if not exist "backend\" (
    echo ❌ Error: backend directory not found
    echo Please navigate to the AI-Writer directory and try again.
    exit /b 1
)

echo 📋 Step 1: Setting up Backend
echo --------------------------------

REM Setup Backend
cd backend

echo Creating Python virtual environment...
python -m venv .venv

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy env_template.txt .env
    echo ⚠️  Please update backend\.env with your API keys
)

echo Creating subscription tables...
python scripts\create_subscription_tables.py 2>nul || echo ⚠️  Subscription tables may already exist

echo Updating subscription plans...
python scripts\cleanup_alpha_plans.py 2>nul || echo ⚠️  Plans may already be updated

cd ..

echo ✅ Backend setup complete!
echo.

echo 📋 Step 2: Setting up Frontend
echo --------------------------------

REM Setup Frontend
cd frontend

REM Clean install
if exist "node_modules\" (
    echo Cleaning old node_modules...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
)

echo Installing Node.js dependencies (this may take a few minutes)...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy env_template.txt .env
    echo ⚠️  Please update frontend\.env with your environment variables
)

echo Building frontend...
call npm run build

cd ..

echo.
echo ================================
echo 🎉 ALwrity Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Update backend\.env with your API keys (Clerk, Gemini, etc.)
echo 2. Update frontend\.env with your Clerk publishable key
echo.
echo To start the application:
echo   Backend:  cd backend ^&^& python app.py
echo   Frontend: cd frontend ^&^& npm start
echo.
echo Access points:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000/api/docs
echo.
echo Happy coding! 🚀

pause

