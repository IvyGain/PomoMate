#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Copy icon assets to public directory
echo "Copying assets to public directory..."

# Copy main icon
if [ -f "assets/images/icon.png" ]; then
  cp assets/images/icon.png public/icon.png
  echo "✓ Copied icon.png"
fi

# Copy favicon
if [ -f "assets/images/favicon.png" ]; then
  cp assets/images/favicon.png public/favicon.png
  echo "✓ Copied favicon.png"
fi

# Copy adaptive icon (you can use this as icon-192.png)
if [ -f "assets/images/adaptive-icon.png" ]; then
  cp assets/images/adaptive-icon.png public/icon-192.png
  echo "✓ Copied icon-192.png"
fi

# Copy main icon as icon-512.png (you may want to create a proper 512x512 version)
if [ -f "assets/images/icon.png" ]; then
  cp assets/images/icon.png public/icon-512.png
  echo "✓ Copied icon-512.png"
fi

echo "Done! Assets copied to public directory."
echo ""
echo "Note: For production, please create proper sized icons:"
echo "  - icon-192.png: 192x192px"
echo "  - icon-512.png: 512x512px"
