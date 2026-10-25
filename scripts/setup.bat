@echo off
echo ==========================================================
echo       ATHENAEUM -- Local Setup Script (Windows)
echo ==========================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ or 20+.
    pause
    exit /b 1
)

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo Starting development server on http://localhost:3000...
call npm run dev
