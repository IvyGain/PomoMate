#!/bin/bash

echo "🚀 Supabase Migration Validation Test Suite"
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with:"
    echo "EXPO_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
fi

# Start the development server in background
echo "🌐 Starting development server..."
npm run start-web > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Run the migration validation tests
echo "🧪 Running migration validation tests..."
npx playwright test e2e/supabase-migration-validation.spec.ts --reporter=list || true

# Generate detailed report
echo ""
echo "📊 Generating migration report..."
npx ts-node e2e/migration-test-runner.ts || node e2e/migration-test-runner.js

# Kill the development server
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Migration validation complete!"
echo "📄 Check migration-report.md for detailed results"
echo ""
echo "To view the HTML test report, run:"
echo "npm run test:e2e:report"