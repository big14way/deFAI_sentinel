# DeFAI Sentinel

Real-time DeFi security monitoring platform that tracks protocol risks, detects anomalies, and provides cross-chain risk assessment to protect user investments.

## Project Overview

DeFAI Sentinel is a comprehensive security monitoring system for DeFi protocols on the Base network. It uses smart contracts to track protocol risk metrics and a modern React frontend to visualize risk data, anomalies, and cross-chain exposures.

### Key Features

- Real-time protocol risk monitoring and scoring
- Anomaly detection and alerting system
- Cross-chain protocol tracking
- User exposure assessment
- Interactive dashboards for risk visualization

## Project Structure

The project is divided into several main components:

1. **Smart Contracts**: On-chain components deployed on Base Sepolia that track protocols, risk scores, and anomalies
2. **Frontend**: React-based dashboard using Tailwind CSS for responsive UI
3. **Backend**: Node.js services for API integrations and data processing
4. **ML Models**: Risk assessment models for enhanced protocol monitoring

## Smart Contracts

The main contract, `DeFiSentinel`, provides:

- Protocol registration and monitoring
- Risk score tracking and updates
- Anomaly detection and resolution
- User exposure tracking

### Setup

```bash
cd smart-contracts
npm install
```

### Configuration

Create a `.env` file with the following variables:

```
BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc_url
PRIVATE_KEY=your_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

### Compile and Deploy

```bash
npm run compile
npm run deploy -- --network base
```

### Verify Contract

```bash
npx hardhat verify --network base 0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6
```

## Frontend

The frontend provides a comprehensive dashboard to visualize protocol risks, alerts, and user exposures.

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Setup

```bash
cd frontend
npm install
```

### Environment Configuration

Create a `.env.local` file in the frontend directory with the following variables:

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
REACT_APP_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# UI Configuration
REACT_APP_RISK_THRESHOLD=0.7
REACT_APP_REFRESH_INTERVAL=30000
```

### Run Development Server

```bash
cd frontend
npm run start
```

The app will be available at http://localhost:3000

### Build for Production

```bash
cd frontend
npm run build
```

## Running the Full Stack Locally

For the complete experience, you can run all components together:

```bash
# From project root
./start-services.sh
```

This script starts:
- Frontend development server
- Backend API server
- ML model services (if configured)

## GitHub Setup and Deployment

### Push to GitHub

1. Initialize Git repository (if not already done):
   ```bash
   git init
   ```

2. Add all files to Git:
   ```bash
   git add .
   ```

3. Create first commit:
   ```bash
   git commit -m "Initial commit of DeFAI Sentinel"
   ```

4. Add GitHub remote (replace with your repository URL):
   ```bash
   git remote add origin https://github.com/yourusername/deFAI_sentinel.git
   ```

5. Push to GitHub:
   ```bash
   git push -u origin main
   ```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Run Vercel deployment:
   ```bash
   vercel
   ```

4. Follow the prompts to link your GitHub repository and configure the project.

5. For subsequent deployments, use:
   ```bash
   vercel --prod
   ```

## Connecting to Base Sepolia

The application is configured to connect to Base Sepolia testnet. To interact with the smart contracts:

1. Add Base Sepolia to your wallet (MetaMask, Coinbase Wallet, etc.)
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

2. Obtain Base Sepolia testnet ETH from:
   - https://www.coinbase.com/faucets/base-sepolia-faucet

3. Connect your wallet in the DeFAI Sentinel app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 