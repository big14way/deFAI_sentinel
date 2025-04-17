#!/bin/bash

# Start DeFi Sentinel Services

echo "Starting DeFi Sentinel Services..."

# Function to check if a directory exists
check_dir() {
  if [ ! -d "$1" ]; then
    echo "Error: Directory $1 does not exist."
    exit 1
  fi
}

# Check all required directories
check_dir "./backend"
check_dir "./frontend"
check_dir "./defi-sentinel-frontend"
check_dir "./ml-models"
check_dir "./indexer"
check_dir "./smart-contracts"

# Define terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Start backend server
start_backend() {
  echo -e "${YELLOW}Starting backend server...${NC}"
  cd backend && npm start &
  BACKEND_PID=$!
  echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"
}

# Start ML model server
start_ml_model() {
  echo -e "${YELLOW}Starting ML model server...${NC}"
  cd ml-models && python3 server.py &
  ML_PID=$!
  echo -e "${GREEN}ML model server started with PID: $ML_PID${NC}"
}

# Start indexer service
start_indexer() {
  echo -e "${YELLOW}Starting indexer service...${NC}"
  cd indexer && npm start &
  INDEXER_PID=$!
  echo -e "${GREEN}Indexer service started with PID: $INDEXER_PID${NC}"
}

# Start frontend (new one)
start_frontend() {
  echo -e "${YELLOW}Starting new frontend...${NC}"
  cd defi-sentinel-frontend && npm start &
  FRONTEND_PID=$!
  echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
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