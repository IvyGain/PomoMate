#!/bin/bash

echo "🍅 Pomodoro Play - Web Server"
echo "============================="

# Kill existing processes
echo "🛑 Stopping existing processes..."
pkill -f expo 2>/dev/null
pkill -f Metro 2>/dev/null
sleep 2

# Check if port is in use
if lsof -i :8081 > /dev/null 2>&1; then
  echo "⚠️  Port 8081 is in use. Killing process..."
  lsof -t -i :8081 | xargs kill -9 2>/dev/null
  sleep 1
fi

# Clear cache
echo "🧹 Clearing cache..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Start Expo with web support
echo "🚀 Starting web server..."
echo ""
echo "📌 Access URL: http://localhost:8081"
echo ""
echo "💡 Tips:"
echo "- Use Ctrl+C to stop the server"
echo "- Check browser console for errors"
echo "- Server will auto-reload on file changes"
echo ""

# Start with error handling
exec npx expo start --web --clear 2>&1 | while read line; do
  echo "$line"
  # Check for common errors
  if [[ "$line" == *"error"* ]] || [[ "$line" == *"Error"* ]]; then
    echo "⚠️  Error detected in server output"
  fi
done