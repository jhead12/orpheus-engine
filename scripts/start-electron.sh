#!/bin/bash
set -e

# Add command line arguments
args=$@

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

cd /Volumes/PRO-BLADE/Github/orpheus-engine

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Starting development server..."
# Check if port 5173 is already in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
  echo "Port 5173 is already in use. Killing the process..."
  kill $(lsof -t -i:5173) || true
  sleep 2
fi

# Locate vite executable in node_modules
VITE_PATH=$(find /workspaces/orpheus-engine -path "*/node_modules/.bin/vite" | head -n 1)

if [ -z "$VITE_PATH" ]; then
  echo "Vite executable not found in node_modules. Installing vite locally..."
  npm install --save-dev vite
  VITE_PATH=$(find /workspaces/orpheus-engine -path "*/node_modules/.bin/vite" | head -n 1)
  
  if [ -z "$VITE_PATH" ]; then
    echo "Failed to install vite. Aborting."
    exit 1
  fi
fi

echo "Using Vite executable: $VITE_PATH"

# Start Vite server independently with a timeout
echo "Starting Vite server..."
$VITE_PATH --port 5173 &
VITE_PID=$!
awescapes start &

# Wait for Vite server with a progress indicator and better timeout handling
echo "Waiting for Vite server to start (timeout: 60s)..."
timeout=60
counter=0
while ! curl -s http://localhost:5173 > /dev/null; do
  sleep 1
  counter=$((counter + 1))
  # Print a spinner character that changes each second
  printf "\r[%c] Waiting for Vite... %d/%d seconds" "-\|/"[$((counter % 4))] $counter $timeout
  
  # Check if Vite process is still running
  if ! ps -p $VITE_PID > /dev/null; then
    echo -e "\nVite server process died. Check for errors."
    exit 1
  fi
  
  if [ $counter -ge $timeout ]; then
    echo -e "\nTimed out waiting for Vite server to start"
    kill $VITE_PID 2>/dev/null
    echo "Try running the diagnostic script: bash scripts/fix-vite-startup.sh"
    exit 1
  fi
done
echo -e "\nVite server started successfully!"

echo "Application is running. Press Ctrl+C to stop."

# Find the correct frontend directory
if [ -d "/workspaces/orpheus-engine/OEW-main" ]; then
  cd /workspaces/orpheus-engine/OEW-main
elif [ -d "/workspaces/orpheus-engine/orpheus-engine-workstation/frontend" ]; then
  cd /workspaces/orpheus-engine/orpheus-engine-workstation/frontend
else
  echo "Searching for frontend directory with electron-launch.js..."
  frontend_dir=$(find /workspaces/orpheus-engine -name "electron-launch.js" -type f | head -n 1 | xargs dirname)
  if [ -n "$frontend_dir" ]; then
    cd "$frontend_dir"
  else
    echo "Error: Could not find frontend directory"
    kill $VITE_PID 2>/dev/null
    exit 1
  fi
fi

# Start Electron with the provided arguments
cd /Volumes/PRO-BLADE/Github/orpheus-engine
npm run start:electron -- $args

# Cleanup
echo "Cleaning up..."
echo "Stopping Vite server (PID: $VITE_PID)"
kill $VITE_PID 2>/dev/null

# Kill D-Bus daemon if we started it
if [ -n "$DBUS_SESSION_BUS_PID" ]; then
  echo "Stopping D-Bus daemon (PID: $DBUS_SESSION_BUS_PID)"
  kill $DBUS_SESSION_BUS_PID 2>/dev/null
fi
