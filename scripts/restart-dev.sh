#!/bin/bash
# scripts/restart-dev.sh
# PerfectZenkai Development Server Restart Script (Cross-platform)

echo "🔄 Restarting PerfectZenkai Development Server..."
echo "============================================="

# Kill all Node.js processes
echo "🛑 Stopping all Node.js processes..."
if pkill -f "node" 2>/dev/null; then
    echo "✅ Node.js processes stopped"
else
    echo "ℹ️  No Node.js processes were running"
fi

# Kill processes on common development ports
echo "🔌 Freeing up development ports..."
for port in {5173..5190}; do
    if lsof -ti:$port >/dev/null 2>&1; then
        kill -9 $(lsof -ti:$port) 2>/dev/null && echo "✅ Freed port $port"
    fi
done

# Wait for processes to terminate
echo "⏳ Waiting for processes to terminate..."
sleep 2

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR" || exit 1

echo "📁 Changed to project directory: $PROJECT_DIR"

# Set consistent port
export PORT=5173
echo "🌐 Starting development server on port 5173..."

# Start the development server
echo "🚀 Launching PerfectZenkai..."
echo "============================================="

if npm run dev; then
    echo "✅ Development server started successfully"
else
    echo "❌ Failed to start development server"
    echo "Please ensure you're in the project directory and dependencies are installed"
    exit 1
fi 