#!/bin/bash

# Start virtual framebuffer
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
export DISPLAY=:99

# Setup D-Bus session
export $(dbus-launch)

# Start the application
cd OEW-main
ELECTRON_DISABLE_SANDBOX=1 \
ELECTRON_ENABLE_LOGGING=1 \
ELECTRON_NO_ATTACH_CONSOLE=1 \
NODE_ENV=development \
electron . \
  --no-sandbox \
  --headless \
  --disable-gpu \
  --disable-dev-shm-usage
