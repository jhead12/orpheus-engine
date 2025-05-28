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
Xvfb $DISPLAY -screen 0 1024x768x24 > /dev/null 2>&1 &
XVFB_PID=$!
sleep 1

# Set up D-Bus session without relying on system services
export DBUS_SESSION_BUS_ADDRESS=unix:path=/tmp/dbus-session-bus-socket
mkdir -p /tmp/dbus-session
dbus-daemon --session --address=$DBUS_SESSION_BUS_ADDRESS --nofork --print-address > /dev/null 2>&1 &
DBUS_PID=$!
sleep 1

cd OEW-main

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Starting development server..."
# Start the app in dev mode (this will start Vite)
npm run dev &
VITE_PID=$!

# Wait for Vite with better timeout handling
echo "Waiting for Vite server to start (timeout: 60s)..."
MAX_ATTEMPTS=60
ATTEMPTS=0

# Use the port specified in Vite config (5174)
while ! curl -s http://localhost:5174 >/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "ERROR: Timed out waiting for Vite server to start"
    exit 1
  fi
  echo "Waiting for Vite server... (${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 1
done

echo "Vite server started successfully!"
echo "Application is running. Press Ctrl+C to stop."

# Keep the script running until user presses Ctrl+C
wait $VITE_PID
