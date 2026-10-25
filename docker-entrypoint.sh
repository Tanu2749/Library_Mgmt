#!/bin/sh
set -e

echo "🚀 Athenaeum — Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
npx drizzle-kit push --force 2>&1 || echo "⚠️  Migration warning (may be OK on first run)"

# Run seed (idempotent — only seeds if DB is empty)
echo "🌱 Running seed (if needed)..."
npx tsx src/lib/db/seed.ts 2>&1 || echo "⚠️  Seed warning (may be OK if already seeded)"

echo "✅ Startup tasks complete. Launching server..."

# Execute the CMD
exec "$@"
