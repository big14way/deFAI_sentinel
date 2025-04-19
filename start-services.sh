#!/bin/bash

# Start DeFi Sentinel Services

echo "Starting DeFi Sentinel Services..."

# Function to kill process on port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid using port $port"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Clear all ports we'll be using
echo "Checking for processes using required ports..."
kill_process_on_port 5001  # ML server
kill_process_on_port 3000  # Backend
kill_process_on_port 3001  # Frontend
kill_process_on_port 3002  # Indexer

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
  
  # Create Python virtual environment if it doesn't exist
  create_venv
  
  # Start the server with virtual environment
  echo -e "${YELLOW}Starting ML server with virtual environment...${NC}"
  (cd "$BASE_DIR/ml-models" && . ./venv/bin/activate && python3 server.py) &
  
  ML_PID=$!
  echo -e "${GREEN}ML model server started with PID: $ML_PID${NC}"
  
  # Check if the server started successfully
  sleep 2
  if ! ps -p $ML_PID > /dev/null; then
    echo -e "${RED}Warning: ML server process exited. Check logs for errors.${NC}"
  fi
}

# Create Python virtual environment if it doesn't exist
create_venv() {
  echo -e "${YELLOW}Checking Python virtual environment...${NC}"
  if [ ! -d "$BASE_DIR/ml-models/venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    (cd "$BASE_DIR/ml-models" && python3 -m venv venv) || {
      echo -e "${RED}Failed to create Python virtual environment. Please make sure venv is installed.${NC}"
      echo -e "${YELLOW}Attempting to install venv...${NC}"
      python3 -m pip install --user virtualenv
      (cd "$BASE_DIR/ml-models" && python3 -m venv venv) || {
        echo -e "${RED}Failed to create virtual environment after installing venv. Exiting.${NC}"
        exit 1
      }
    }
  fi
  
  # Activate virtual environment and install dependencies
  echo -e "${YELLOW}Installing Python dependencies...${NC}"
  (cd "$BASE_DIR/ml-models" && \
    . ./venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -q setuptools wheel && \
    pip install -q -r requirements.txt) || {
    echo -e "${RED}Failed to install dependencies. ML server may not work correctly.${NC}"
  }
}

# Start indexer service
start_indexer() {
  echo -e "${YELLOW}Starting indexer service...${NC}"
  
  # Check if package.json exists in indexer directory, create if not
  if [ ! -f "$BASE_DIR/indexer/package.json" ]; then
    echo -e "${YELLOW}Creating package.json for indexer...${NC}"
    mkdir -p "$BASE_DIR/indexer"
    cat > "$BASE_DIR/indexer/package.json" << EOF
{
  "name": "defai-sentinel-indexer",
  "version": "1.0.0",
  "description": "Blockchain indexer for DeFAI Sentinel",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.17.1",
    "ethers": "^5.5.1",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "winston": "^3.3.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
EOF
  fi
  
  # Create src directory and app.js if they don't exist
  mkdir -p "$BASE_DIR/indexer/src"
  if [ ! -f "$BASE_DIR/indexer/src/app.js" ]; then
    echo -e "${YELLOW}Creating app.js for indexer...${NC}"
    cat > "$BASE_DIR/indexer/src/app.js" << EOF
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.INDEXER_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'defai-sentinel-indexer' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Indexer service running on port \${PORT}\`);
});
EOF
  fi
  
  # Check for node_modules and install if needed
  if [ ! -d "$BASE_DIR/indexer/node_modules" ]; then
    echo -e "${YELLOW}Installing indexer dependencies...${NC}"
    (cd "$BASE_DIR/indexer" && npm install) || {
      echo -e "${RED}Failed to install indexer dependencies. Indexer may not work correctly.${NC}"
    }
  fi
  
  # Start the indexer service
  echo -e "${YELLOW}Starting indexer service...${NC}"
  (cd "$BASE_DIR/indexer" && npm start) &
  INDEXER_PID=$!
  echo -e "${GREEN}Indexer service started with PID: $INDEXER_PID${NC}"
  
  # Add to the list of services
  SERVICES+=("Indexer:$INDEXER_PID")
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