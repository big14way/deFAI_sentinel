#!/bin/bash

# Start all DeFAI Sentinel services

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Function to kill process on port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid 2>/dev/null
    fi
}

# Clear all ports we'll be using
echo "Checking for processes using required ports..."
kill_process_on_port 5001  # ML server
kill_process_on_port 3000  # Backend
kill_process_on_port 3001  # Frontend
kill_process_on_port 3002  # Indexer

# Check if start-services.sh exists
if [ -f "./start-services.sh" ]; then
    echo "Starting all DeFAI Sentinel services using start-services.sh..."
    # Make sure the script is executable
    chmod +x ./start-services.sh
    # Execute the script
    ./start-services.sh
else
    echo "Error: start-services.sh not found. Starting services individually..."
    
    # Stop any running processes
    echo "Stopping any running processes..."
    pkill -f "python.*server.py" 2>/dev/null
    pkill -f "node.*backend" 2>/dev/null
    pkill -f "node.*frontend" 2>/dev/null
    pkill -f "node.*indexer" 2>/dev/null
    
    # Start the ML server
    echo "Starting ML server..."
    cd ml-models || handle_error "Could not find ml-models directory"
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        echo "Activating virtual environment..."
        source venv/bin/activate
        
        # Fix the setuptools issue before installing other packages
        pip install --upgrade pip setuptools wheel
        sleep 1
    fi
    export PORT=5001
    export ENABLE_CORS=True
    python3 server.py &
    ML_PID=$!
    cd ..
    
    echo "ML server started with PID: $ML_PID"
    
    # Start the backend server
    echo "Starting backend server..."
    if [ -d "backend" ]; then
        cd backend || handle_error "Could not navigate to backend directory"
        npm start &
        BACKEND_PID=$!
        cd ..
        echo "Backend server started with PID: $BACKEND_PID"
    else
        echo "Warning: Backend directory not found"
    fi
    
    # Start the indexer
    echo "Starting indexer..."
    if [ -d "indexer" ]; then
        cd indexer || handle_error "Could not navigate to indexer directory"
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing indexer dependencies..."
            npm install
        fi
        npm start &
        INDEXER_PID=$!
        cd ..
        echo "Indexer started with PID: $INDEXER_PID"
    else
        echo "Warning: Indexer directory not found"
    fi
    
    # Start the frontend
    echo "Starting frontend..."
    if [ -d "frontend" ]; then
        cd frontend || handle_error "Could not navigate to frontend directory"
        # Increase memory limit for TypeScript checking
        export NODE_OPTIONS="--max_old_space_size=4096"
        npm start &
        FRONTEND_PID=$!
        cd ..
        echo "Frontend started with PID: $FRONTEND_PID"
    else
        echo "Warning: Frontend directory not found"
    fi
    
    echo "All components started!"
    echo "Services running on:"
    echo "- ML server: http://localhost:5000"
    echo "- Backend: http://localhost:3000"
    echo "- Frontend: http://localhost:3001"
    echo "- Indexer: http://localhost:3002"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Wait for Ctrl+C
    wait
fi 