#!/usr/bin/env bash
set -e

# Directory of the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_ZIP="$PROJECT_ROOT/library-ai.zip"

echo "📦 Packaging Athenaeum into clean distribution zip..."
echo "Project Root: $PROJECT_ROOT"
echo "Output: $OUTPUT_ZIP"

cd "$PROJECT_ROOT"

# Remove existing zip if any
rm -f "$OUTPUT_ZIP"

# Zip while excluding .git, node_modules, .next, .env, and caches
zip -r "$OUTPUT_ZIP" . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.next*" \
  -x "*.env" \
  -x "*.env.local" \
  -x "*.DS_Store" \
  -x "*coverage*" \
  -x "*test-results*" \
  -x "*playwright-report*" \
  -x "*.zip"

echo ""
echo "✅ Clean package created successfully at:"
echo "   $OUTPUT_ZIP"
ls -lh "$OUTPUT_ZIP"
