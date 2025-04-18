#!/bin/bash

# DeFAI Sentinel Development Environment Startup Script

echo "Starting DeFAI Sentinel Development Environment..."

# Define terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variable to track if we've installed dependencies
DEPS_INSTALLED=false

# Install dependencies if needed
check_and_install_deps() {
  local dir=$1
  local name=$2
  
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo -e "${BLUE}Checking dependencies for $name...${NC}"
    
    if [ ! -d "$dir/node_modules" ] || [ "$(find "$dir/node_modules" -maxdepth 0 -empty 2>/dev/null)" ]; then
      echo -e "${YELLOW}Installing dependencies for $name...${NC}"
      (cd "$dir" && npm install)
      DEPS_INSTALLED=true
    else
      echo -e "${GREEN}Dependencies already installed for $name.${NC}"
    fi
  fi
}

# Start frontend server
start_frontend() {
  echo -e "${YELLOW}Starting Frontend...${NC}"
  
  if [ -d "./frontend" ]; then
    # Check if we need to install dependencies
    check_and_install_deps "./frontend" "Frontend"
    
    # Start the frontend
    (cd ./frontend && npm start) &
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
  else
    echo -e "${RED}Error: Frontend directory not found.${NC}"
  fi
}

# Start backend server
start_backend() {
  echo -e "${YELLOW}Starting Backend...${NC}"
  
  if [ -d "./backend" ]; then
    # Check if we need to install dependencies
    check_and_install_deps "./backend" "Backend"
    
    # Start the backend
    (cd ./backend && npm start) &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
  else
    echo -e "${RED}Error: Backend directory not found.${NC}"
  fi
}

# Start ML model server
start_ml_server() {
  echo -e "${YELLOW}Starting ML Model Server...${NC}"
  
  if [ -d "./ml-models" ]; then
    if [ -f "./ml-models/requirements.txt" ]; then
      echo -e "${BLUE}Checking Python dependencies...${NC}"
      
      # Check if virtualenv exists, if not create it
      if [ ! -d "./ml-models/venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv ./ml-models/venv
        echo -e "${GREEN}Virtual environment created.${NC}"
      fi
      
      # Activate virtualenv and install dependencies
      echo -e "${YELLOW}Installing Python dependencies...${NC}"
      (cd ./ml-models && . ./venv/bin/activate && pip install -r requirements.txt)
      
      # Start the server - check for server.py
      if [ -f "./ml-models/server.py" ]; then
        (cd ./ml-models && . ./venv/bin/activate && python server.py) &
        ML_PID=$!
        echo -e "${GREEN}ML server started with PID: $ML_PID${NC}"
      elif [ -f "./ml-models/src/server.py" ]; then
        (cd ./ml-models && . ./venv/bin/activate && python src/server.py) &
        ML_PID=$!
        echo -e "${GREEN}ML server started with PID: $ML_PID${NC}"
      else
        echo -e "${RED}Error: Cannot find server.py in ML models directory.${NC}"
        echo -e "${YELLOW}Note: You'll need to start the ML server manually.${NC}"
      fi
    else
      echo -e "${RED}Error: No requirements.txt found in ML models directory.${NC}"
    fi
  else
    echo -e "${RED}Error: ML models directory not found.${NC}"
  fi
}

# Start indexer
start_indexer() {
  echo -e "${YELLOW}Starting Indexer...${NC}"
  
  if [ -d "./indexer" ]; then
    # Check if we need to install dependencies
    check_and_install_deps "./indexer" "Indexer"
    
    # Start the indexer
    if [ -f "./indexer/package.json" ]; then
      (cd ./indexer && npm start) &
      INDEXER_PID=$!
      echo -e "${GREEN}Indexer started with PID: $INDEXER_PID${NC}"
    else
      echo -e "${RED}Error: No package.json found in Indexer directory.${NC}"
      echo -e "${YELLOW}Note: You'll need to start the Indexer manually.${NC}"
    fi
  else
    echo -e "${RED}Error: Indexer directory not found.${NC}"
  fi
}

# Trap to kill all processes on exit
trap_exit() {
  echo -e "${RED}Shutting down all services...${NC}"
  # Kill all processes
  if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
  if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
  if [ ! -z "$ML_PID" ]; then kill $ML_PID 2>/dev/null; fi
  if [ ! -z "$INDEXER_PID" ]; then kill $INDEXER_PID 2>/dev/null; fi
  exit 0
}

# Set up trap
trap trap_exit INT TERM

# Start all services
start_backend
sleep 2
start_ml_server
sleep 2
start_indexer
sleep 2
start_frontend

echo -e "${GREEN}All services started!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"

# Keep script running
wait 