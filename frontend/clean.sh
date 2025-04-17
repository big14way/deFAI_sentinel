#!/bin/bash

# Script to clean up temporary files and reset the frontend

echo "🧹 Cleaning up frontend application..."

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf build/

# Clear dependency caches
echo "Clearing dependency caches..."
rm -rf node_modules/.cache
rm -rf .npm
rm -rf .cache

# Clear React cache
echo "Clearing React cache..."
rm -rf .eslintcache

# Optionally remove node_modules (uncomment if needed)
# echo "Removing node_modules (this will require npm install after)..."
# rm -rf node_modules/

echo "✅ Cleanup complete!"
echo "You may need to run 'npm install' if you're experiencing dependency issues."
echo "To start the development server, run: npm start" 