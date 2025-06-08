#!/bin/bash

# Check if D-Bus is running
if [ ! -e "/tmp/dbus-session-bus-socket" ]; then
  echo "Setting up D-Bus session..."
  
  # Start D-Bus session daemon
  eval $(dbus-launch --sh-syntax)
  
  # Export the D-Bus session address and PID
  export DBUS_SESSION_BUS_ADDRESS
  export DBUS_SESSION_BUS_PID
  
  echo "D-Bus session started with PID $DBUS_SESSION_BUS_PID"
  echo "D-Bus address: $DBUS_SESSION_BUS_ADDRESS"
else
  echo "D-Bus session already running"
fi
