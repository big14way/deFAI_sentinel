#!/bin/bash

# Start DeFi Sentinel Services

echo "Starting DeFi Sentinel Services..."

# Define base directory
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BASE_DIR"

# Function to check if a directory exists
check_dir() {
  if [ ! -d "$1" ]; then
    echo "Error: Directory $1 does not exist."
    exit 1
  fi
}

# Check all required directories
check_dir "$BASE_DIR/backend"
check_dir "$BASE_DIR/frontend"
check_dir "$BASE_DIR/ml-models"
check_dir "$BASE_DIR/indexer"
check_dir "$BASE_DIR/smart-contracts"

# Define terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Start backend server
start_backend() {
  echo -e "${YELLOW}Starting backend server...${NC}"
  cd "$BASE_DIR/backend" && npm start &
  BACKEND_PID=$!
  echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"
  cd "$BASE_DIR"
}

# Start ML model server
start_ml_model() {
  echo -e "${YELLOW}Starting ML model server...${NC}"
  
  # Check if virtual environment exists
  if [ ! -d "$BASE_DIR/ml-models/venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv "$BASE_DIR/ml-models/venv" || {
      echo -e "${RED}Failed to create virtual environment. Using system Python instead.${NC}"
    }
  fi
  
  if [ -d "$BASE_DIR/ml-models/venv" ]; then
    # Activate virtual environment and install dependencies
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    (cd "$BASE_DIR/ml-models" && \
      . ./venv/bin/activate && \
      pip install -q -r requirements.txt) || {
      echo -e "${RED}Failed to install dependencies. ML server may not work correctly.${NC}"
    }
    
    # Start the server with virtual environment
    echo -e "${YELLOW}Starting ML server with virtual environment...${NC}"
    (cd "$BASE_DIR/ml-models" && . ./venv/bin/activate && python3 server.py) &
  else
    # Fallback to system Python if venv creation failed
    echo -e "${YELLOW}Starting ML server with system Python...${NC}"
    (cd "$BASE_DIR/ml-models" && python3 server.py) &
  fi
  
  ML_PID=$!
  echo -e "${GREEN}ML model server started with PID: $ML_PID${NC}"
  
  # Check if the server started successfully
  sleep 2
  if ! ps -p $ML_PID > /dev/null; then
    echo -e "${RED}Warning: ML server process exited. Check logs for errors.${NC}"
  fi
}

# Start indexer service
start_indexer() {
  echo -e "${YELLOW}Starting indexer service...${NC}"
  cd "$BASE_DIR/indexer" && npm start &
  INDEXER_PID=$!
  echo -e "${GREEN}Indexer service started with PID: $INDEXER_PID${NC}"
  cd "$BASE_DIR"
}

# Start frontend
start_frontend() {
  echo -e "${YELLOW}Starting frontend...${NC}"
  cd "$BASE_DIR/frontend" && npm start &
  FRONTEND_PID=$!
  echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
  cd "$BASE_DIR"
}

# Trap to kill all processes on exit
trap_exit() {
  echo -e "${RED}Shutting down all services...${NC}"
  if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
  if [ ! -z "$ML_PID" ]; then kill $ML_PID 2>/dev/null; fi
  if [ ! -z "$INDEXER_PID" ]; then kill $INDEXER_PID 2>/dev/null; fi
  if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
  exit 0
}

# Set up trap
trap trap_exit INT TERM

# Start all services
start_backend
sleep 2
start_ml_model
sleep 2
start_indexer
sleep 2
start_frontend

echo -e "${GREEN}All services started successfully!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait 

# Command to start all services
# chmod +x start-services.sh
# ./start-services.sh