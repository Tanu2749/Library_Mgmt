#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "      🏛️  ATHENAEUM — Local Setup Script (No Docker)      "
echo "=========================================================="
echo ""

# 1. Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ or 20+."
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# 2. Setup .env file
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    # Generate random secret if openssl exists
    if command -v openssl &> /dev/null; then
        RANDOM_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/change-me-to-a-random-string-at-least-32-chars/$RANDOM_SECRET/g" .env && rm -f .env.bak
        echo "✓ Generated fresh NEXTAUTH_SECRET"
    fi
else
    echo "✓ .env file already exists"
fi

# 3. Install dependencies
echo "📦 Installing npm dependencies..."
npm install --legacy-peer-deps

# 4. Optional Database Setup
echo ""
echo "----------------------------------------------------------"
echo "💡 DATABASE CONFIGURATION:"
echo "   Default: postgresql://athenaeum:athenaeum@localhost:5432/athenaeum"
echo "   If your PostgreSQL is running, run:"
echo "     npm run db:push && npm run db:seed"
echo ""
echo "   Or start everything via Docker with one command:"
echo "     docker compose up --build"
echo "----------------------------------------------------------"
echo ""

# 5. Start dev server
echo "🚀 Starting development server at http://localhost:3000..."
npm run dev
