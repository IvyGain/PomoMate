# PomoMate Makefile for automated tasks

.PHONY: help start deploy test clean install update check

# Default target
help:
	@echo "PomoMate Automation Commands:"
	@echo "  make start    - Start development server"
	@echo "  make deploy   - Deploy to production"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean build files"
	@echo "  make install  - Install dependencies"
	@echo "  make update   - Update dependencies"
	@echo "  make check    - Check if app is running"
	@echo "  make quick    - Quick deploy (auto commit & push)"

# Start development server
start:
	@echo "🚀 Starting development server..."
	@npm run auto:start

# Deploy to production
deploy:
	@echo "📦 Deploying to production..."
	@npm run auto:deploy

# Run tests
test:
	@echo "🧪 Running tests..."
	@npm test
	@npm run test:e2e

# Clean build files
clean:
	@echo "🧹 Cleaning build files..."
	@rm -rf dist/
	@rm -rf web-build/
	@rm -rf .expo/
	@echo "✅ Clean complete"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@cd backend && npm install
	@echo "✅ Dependencies installed"

# Update dependencies
update:
	@echo "🔄 Updating dependencies..."
	@npm update
	@cd backend && npm update
	@echo "✅ Dependencies updated"

# Check if app is running
check:
	@npm run auto:check

# Quick deploy with auto commit
quick:
	@echo "⚡ Quick deploy..."
	@git add .
	@git commit -m "Quick update: $(shell date +%Y-%m-%d\ %H:%M:%S)" || true
	@git push
	@vercel --prod