#!/bin/bash

# Kill any existing Python server processes
echo "Checking for existing server processes..."
EXISTING_PROCS=$(ps aux | grep "python.*server.py" | grep -v grep | awk '{print $2}')

if [ -n "$EXISTING_PROCS" ]; then
    echo "Killing existing server processes: $EXISTING_PROCS"
    kill $EXISTING_PROCS 2>/dev/null
    sleep 2
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Set environment variables
export PORT=5001
export ENABLE_CORS=True

# Start the server
echo "Starting ML server on port $PORT..."
python3 server.py 