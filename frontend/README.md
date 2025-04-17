# DeFi Sentinel Frontend

## Overview

The DeFi Sentinel frontend is a React-based dashboard for interacting with the DeFiSentinel smart contract on the Base Sepolia testnet. It provides real-time monitoring of protocol risk scores, anomaly detection, and protocol management.

## Prerequisites

- Node.js 16+ and npm
- MetaMask or another Ethereum wallet
- Base Sepolia testnet configured in your wallet
- Base Sepolia ETH for gas fees

## Setup

1. Clone the repository and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm start
   ```

## Configuration

The frontend is configured using environment variables in the `.env` file:

```
# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001

# Blockchain Configuration
REACT_APP_CHAIN_ID=84532
REACT_APP_CHAIN_NAME=Base Sepolia
REACT_APP_RPC_URL=https://sepolia.base.org

# Contract Addresses
REACT_APP_DEFI_SENTINEL_ADDRESS=0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6

# Feature Flags
REACT_APP_ENABLE_TESTNETS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id_here

# UI Configuration
REACT_APP_RISK_THRESHOLD=0.7
REACT_APP_REFRESH_INTERVAL=30000

# ML Integration
REACT_APP_ML_MODEL_ENDPOINT=http://localhost:5000/predict
```

## Available Pages

- **Dashboard**: Overview of all protocols and recent anomalies
- **Protocols**: Detailed view of all registered protocols
- **Anomalies**: Review detected anomalies across protocols
- **Diagnostics**: Troubleshoot connection issues and verify system status

## Contract Integration

The frontend integrates with the DeFiSentinel smart contract deployed at `0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6` on the Base Sepolia testnet. All contract interactions are handled through the services in `src/services/web3.ts`.

## Troubleshooting

### Connection Issues

If you're experiencing connection issues with the contract:

1. Verify your wallet is connected to Base Sepolia testnet (Chain ID: 84532)
2. Check that you have sufficient Base Sepolia ETH for gas
3. Clear your browser cache
4. Navigate to the Diagnostics page for detailed connection information

### Dependency Issues

If you encounter dependency issues:

1. Clean up temporary files and caches:
   ```
   npm run clean
   ```

2. Reinstall dependencies:
   ```
   npm install
   ```

### Contract Debugging

Visit the `/diagnostics` page to:
- Verify contract connection
- Check registered protocols
- Confirm wallet connection
- View environment information

## Building for Production

To build the application for production deployment:

```
npm run build
```

The build artifacts will be stored in the `build/` directory. 