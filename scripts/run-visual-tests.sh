#!/bin/bash
# Run visual tests with virtual display support

# Set environment variable to indicate xvfb is available
export XVFB_RUN_AVAILABLE=true

# Check if xvfb-run is available
if ! command -v xvfb-run &> /dev/null; then
    echo "Warning: xvfb-run not found. Visual tests may fail."
    echo "Install it with: sudo apt-get install xvfb"
    # Fall back to regular test runner
    exec pnpm test "$@"
fi

# Use xvfb-run with appropriate settings for visual tests
echo "Running visual tests with virtual display..."
exec xvfb-run \
    --server-args="-screen 0 1024x768x24 -ac +extension GLX +render -noreset" \
    --auto-servernum \
    --server-num=1 \
    pnpm test "$@"
