#!/bin/bash

# Netlify Build Script with Enhanced Debugging
set -e  # Exit on any error

echo "🚀 Starting Netlify build process..."

# Print environment info
echo "📋 Environment Information:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"

# Check if video file exists
echo "🎥 Checking video assets..."
if [ -f "src/assets/videos/header.mp4" ]; then
    echo "✅ Video file found: src/assets/videos/header.mp4"
    ls -la src/assets/videos/header.mp4
else
    echo "❌ Video file NOT found: src/assets/videos/header.mp4"
    echo "📁 Contents of src/assets/videos/:"
    ls -la src/assets/videos/ || echo "Directory doesn't exist"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clear any potential cache issues
echo "🧹 Clearing caches..."
rm -rf node_modules/.vite || true
rm -rf dist || true

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

# Build the project
echo "🏗️ Building project..."
npm run build

echo "✅ Build completed successfully!"
echo "📊 Build output:"
ls -la dist/ 