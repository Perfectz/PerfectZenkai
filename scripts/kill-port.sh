#!/bin/bash
#
# SYNOPSIS
#   Finds and terminates the process running on a specified TCP port.
#
# DESCRIPTION
#   This script is a cross-platform (macOS/Linux) utility to free up a network port.
#
# PARAMETERS
#   $1: The TCP port number to clear.
#
# EXAMPLE
#   $ ./kill-port.sh 5173
#
set -e

PORT=$1

if [ -z "$PORT" ]; then
  echo "Error: Port number is required."
  echo "Usage: ./kill-port.sh <port>"
  exit 1
fi

echo "Searching for process on port $PORT..."

# `lsof -t -i:$PORT` returns the PID of the process listening on the port.
# The command substitution is wrapped in a construct to handle the case where no process is found,
# which would otherwise cause `kill` to fail and the script to exit due to `set -e`.
PID=$(lsof -t -i:$PORT || true)

if [ -n "$PID" ]; then
  echo "Success: Found process with ID $PID on port $PORT. Terminating..."
  kill -9 $PID
  echo "Success: Process $PID terminated successfully."
else
  echo "Success: Port $PORT is already free. No action needed."
fi

echo "Success: Port cleanup complete for port $PORT." 