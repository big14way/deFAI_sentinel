# DeFAI Sentinel

A real-time risk monitoring and alert system for DeFi protocols on Base network.

## Project Structure

The project is divided into two main parts:

1. **Smart Contracts**: The on-chain component that tracks protocols, risk scores, and anomalies.
2. **Frontend**: React-based dashboard for visualizing protocol risk data.

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

### Compile

```bash
npm run compile
```

### Deploy

```bash
npm run deploy -- --network base
```

### Verify Contract

For Base Sepolia testnet:

```bash
npx hardhat verify --network base 0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6
```

### Interact with Deployed Contract

The contract is deployed at `0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6` on Base network.

```bash
npm run verify-interact
```

### Check Contract Status

Verify that the contract is deployed and operational:

```bash
npm run check
```

### CLI Interface

For more interactive use, you can use the CLI interface:

```bash
npm run cli
```

This interactive CLI allows you to:
- List all registered protocols
- Get details for a specific protocol
- Register new protocols
- Update risk scores
- Record and resolve anomalies
- Calculate user risk scores

## Frontend

The frontend provides a dashboard to visualize:

- Protocol risk scores
- Risk analysis
- Anomaly alerts
- User exposure tracking

### Setup

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## How It Works

1. **Protocol Registration**: DeFi protocols are registered with initial risk scores
2. **Risk Monitoring**: The contract tracks risk scores that update based on various factors
3. **Anomaly Detection**: Unusual activities or patterns trigger anomaly events
4. **User Exposure**: Users can track their exposure to different protocols
5. **Dashboard Visualization**: The frontend displays all this data in an intuitive interface

## Contract Integration

To integrate with the DeFiSentinel contract in your own frontend:

1. Import the ABI from `frontend/src/abi/DeFiSentinel.json`
2. Use the utility functions in `frontend/src/utils/contractInteraction.ts`
3. Use the React hooks in `frontend/src/hooks/useContract.ts` for easy state management

## License

MIT 