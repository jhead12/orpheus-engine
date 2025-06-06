#!/bin/bash

# Setup X11 environment for containerized environments

# Check if we already have a DISPLAY variable set
if [ -z "$DISPLAY" ]; then
  echo "No DISPLAY environment variable set. Setting up virtual X server..."
  
  # Check if Xvfb is installed
  if ! command -v Xvfb &> /dev/null; then
    echo "Xvfb not found. Attempting to install..."
    if command -v apt-get &> /dev/null; then
      sudo apt-get update -qq && sudo apt-get install -y xvfb
    elif command -v yum &> /dev/null; then
      sudo yum install -y xorg-x11-server-Xvfb
    else
      echo "Error: Package manager not found. Please install Xvfb manually."
      exit 1
    fi
  fi
  
  # Kill any existing Xvfb process
  pkill Xvfb || true
  
  # Start Xvfb
  Xvfb :99 -screen 0 1024x768x24 -ac &
  
  # Export the display
  export DISPLAY=:99
  
  echo "Virtual X server started on display :99"
else
  echo "DISPLAY environment variable is already set to: $DISPLAY"
fi

# Check for other X11 dependencies
if ! command -v xauth &> /dev/null; then
  echo "xauth not found. Some X11 operations may fail."
fi

# Return success
echo "X11 environment setup complete."
exit 0
