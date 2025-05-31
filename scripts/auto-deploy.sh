#!/bin/bash

# Auto Deploy Script for PomoMate
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting PomoMate Auto Deploy..."

# Function to check if there are uncommitted changes
check_git_status() {
    if [[ -n $(git status -s) ]]; then
        echo "📝 Uncommitted changes detected"
        return 0
    else
        echo "✅ No uncommitted changes"
        return 1
    fi
}

# Function to deploy
deploy() {
    echo "📦 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment complete!"
}

# Main execution
cd "$(dirname "$0")/.."

# Check for changes
if check_git_status; then
    echo "📋 Files with changes:"
    git status -s
    
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed"
        
        read -p "Push to GitHub? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            echo "✅ Pushed to GitHub"
        fi
    fi
fi

# Deploy
read -p "Deploy to production? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    deploy
fi

echo "🎉 Auto deploy process complete!"