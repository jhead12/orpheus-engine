#!/bin/bash
set -e

# Function to cleanup background processes
cleanup() {
  echo "Cleaning up..."
  # Only attempt to kill processes that exist
  if [[ -n "$VITE_PID" && -e /proc/$VITE_PID ]]; then
    echo "Stopping Vite server (PID: $VITE_PID)"
    kill $VITE_PID 2>/dev/null || true
  fi
  if [[ -n "$XVFB_PID" && -e /proc/$XVFB_PID ]]; then
    echo "Stopping Xvfb (PID: $XVFB_PID)"
    kill $XVFB_PID 2>/dev/null || true
  fi
  if [[ -n "$DBUS_PID" && -e /proc/$DBUS_PID ]]; then
    echo "Stopping D-Bus daemon (PID: $DBUS_PID)"
    kill $DBUS_PID 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Setting up display..."
export DISPLAY=:99
if command -v Xvfb &> /dev/null; then
  Xvfb $DISPLAY -screen 0 1024x768x24 > /dev/null 2>&1 &
  XVFB_PID=$!
  sleep 1
  echo "Xvfb started with PID: $XVFB_PID"
else
  echo "Warning: Xvfb not found, display setup may not work correctly"
fi

# Set up D-Bus session without relying on system services
export DBUS_SESSION_BUS_ADDRESS=unix:path=/tmp/dbus-session-bus-socket
mkdir -p /tmp/dbus-session
if command -v dbus-daemon &> /dev/null; then
  dbus-daemon --session --address=$DBUS_SESSION_BUS_ADDRESS --nofork --print-address > /dev/null 2>&1 &
  DBUS_PID=$!
  sleep 1
  echo "D-Bus daemon started with PID: $DBUS_PID"
else
  echo "Warning: dbus-daemon not found, some features may not work correctly"
fi

# Check if workstation/frontend directory exists
if [ ! -d "workstation/frontend" ]; then
  echo "Error: workstation/frontend directory not found"
  echo "Current directory: $(pwd)"
  echo "Please ensure you're running this script from the project root"
  exit 1
fi

cd /Volumes/PRO-BLADE/Github/orpheus-engine/workstation/frontend

echo "Installing dependencies..."
# Fix npm cache permissions if needed
if [ -d "$HOME/.npm" ]; then
  echo "Checking npm cache permissions..."
  # Only try to fix permissions if we have access or if we're running as a user who can use sudo
  if [ ! -w "$HOME/.npm" ] && command -v sudo &> /dev/null && sudo -n true 2>/dev/null; then
    echo "Fixing npm cache permissions..."
    sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
  fi
fi

# Install with less verbose output and better error handling
npm install --legacy-peer-deps --no-fund --no-audit || {
  echo "Error: npm install failed"
  echo "Trying with --force flag..."
  npm install --legacy-peer-deps --force --no-fund --no-audit || {
    echo "Fatal: npm installation failed even with --force"
    exit 1
  }
}

echo "Starting development server..."
# Start the app in dev mode (this will start Vite)
npm run dev &
VITE_PID=$!
awescapes start &

# Wait for Vite server to be available
echo "Waiting for Vite server to start (timeout: 60s)..."
timeout=60
counter=0
while ! curl -s http://localhost:5174 > /dev/null; do
  sleep 1
  counter=$((counter + 1))
  if [ $counter -ge $timeout ]; then
    echo "Timed out waiting for Vite server to start"
    exit 1
  fi
done
echo "Vite server started successfully!"

echo "Application is running. Press Ctrl+C to stop."

# Start Electron with the provided arguments
cd workstation/frontend
npm run electron-dev -- $args

# Keep the script running until user presses Ctrl+C
wait $VITE_PID
