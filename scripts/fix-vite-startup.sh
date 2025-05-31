#!/bin/bash

echo "Diagnosing Vite server startup issues..."

# Check if port 5173 is already in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
  echo "Port 5173 is already in use. Killing the process..."
  kill $(lsof -t -i:5173) || true
  sleep 2
fi

# Check for node_modules
if [ ! -d "node_modules" ]; then
  echo "node_modules directory not found. Running npm install..."
  npm install
fi

# Check for @vitejs/plugin-react
if ! npm list @vitejs/plugin-react >/dev/null 2>&1; then
  echo "Installing @vitejs/plugin-react..."
  npm install --save-dev @vitejs/plugin-react
fi

# Check if vite.config.ts exists
VITE_CONFIG=$(find . -name "vite.config.ts" -o -name "vite.config.js" | head -n 1)
if [ -z "$VITE_CONFIG" ]; then
  echo "No Vite config found. Creating a basic one..."
  cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
})
EOF
  VITE_CONFIG="vite.config.ts"
fi

echo "Starting Vite with verbose logging..."
echo "Using config: $VITE_CONFIG"
npx --no-install vite --config $VITE_CONFIG --debug
