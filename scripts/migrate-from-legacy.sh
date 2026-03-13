#!/bin/bash
set -e

LEGACY_DIR="../kaven-boilerplate"
TARGET_DIR="."

echo "📄 Starting framework migration..."

# 1. Copy apps
echo "Copying apps..."
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.next' \
  --exclude '.turbo' \
  "$LEGACY_DIR/apps/" "$TARGET_DIR/apps/"

# 2. Copy packages
echo "Copying packages..."
rsync -av --progress \
  --exclude 'node_modules' \
  "$LEGACY_DIR/packages/" "$TARGET_DIR/packages/"

# 3. Copy configs
echo "Copying configs..."
cp "$LEGACY_DIR/package.json" "$TARGET_DIR/"
cp "$LEGACY_DIR/pnpm-workspace.yaml" "$TARGET_DIR/"
cp "$LEGACY_DIR/turbo.json" "$TARGET_DIR/"
cp "$LEGACY_DIR/.env.example" "$TARGET_DIR/"

# 4. Update versions
echo "Updating versions..."
find . -name "package.json" -type f -exec sed -i 's/"version": ".*"/"version": "0.1.0-alpha.0"/g' {} \;

echo "✅ Migration complete"
