# DeFiSentinel Contract Integration Guide

This guide explains how to integrate with the DeFiSentinel contract deployed on the Base Sepolia testnet.

## Contract Details

- **Contract Address**: `0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6`
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Explorer Link**: [BaseScan](https://sepolia.basescan.org/address/0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6)

## Contract ABI

The complete ABI for the DeFiSentinel contract is available in the `/frontend/src/abi/DeFiSentinel.json` file. Copy this file to your project to interact with the contract.

## Integration Methods

### 1. Web3.js Integration

```javascript
const Web3 = require('web3');
const contractABI = require('./DeFiSentinel.json');

// Set up Web3 provider
const web3 = new Web3('https://sepolia.base.org'); // Replace with your RPC URL
const contractAddress = '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';

// Initialize contract
const sentinelContract = new web3.eth.Contract(contractABI, contractAddress);

// Example: Get all protocols
async function getAllProtocols() {
  try {
    const protocols = await sentinelContract.methods.getAllProtocols().call();
    console.log('Protocols:', protocols);
    return protocols;
  } catch (error) {
    console.error('Error fetching protocols:', error);
  }
}

// Example: Get protocol details
async function getProtocolDetails(protocolAddress) {
  try {
    const details = await sentinelContract.methods.getProtocolDetails(protocolAddress).call();
    console.log('Protocol Details:', {
      name: details.name,
      isActive: details.isActive,
      riskScore: details.riskScore,
      lastUpdateTime: new Date(details.lastUpdateTime * 1000)
    });
    return details;
  } catch (error) {
    console.error('Error fetching protocol details:', error);
  }
}
```

### 2. Ethers.js Integration

```typescript
import { ethers } from 'ethers';
import contractABI from './DeFiSentinel.json';

// Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org'); // Replace with your RPC URL
const privateKey = 'your_private_key'; // Replace with your private key
const signer = new ethers.Wallet(privateKey, provider);

// Initialize contract
const contractAddress = '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';
const sentinelContract = new ethers.Contract(contractAddress, contractABI, signer);

// Example: Record user exposure
async function recordUserExposure(userAddress: string, protocolAddress: string) {
  try {
    const tx = await sentinelContract.recordUserExposure(userAddress, protocolAddress);
    await tx.wait();
    console.log('User exposure recorded successfully');
    return true;
  } catch (error) {
    console.error('Error recording user exposure:', error);
    return false;
  }
}

// Example: Calculate user risk score
async function getUserRiskScore(userAddress: string) {
  try {
    const riskScore = await sentinelContract.calculateUserRiskScore(userAddress);
    console.log('User Risk Score:', riskScore.toString());
    return riskScore.toNumber();
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return 0;
  }
}
```

### 3. React Integration with Hooks

We've provided custom React hooks for easy integration with your React applications. These can be found in `/frontend/src/hooks/useContract.ts`:

```typescript
// Example usage in a React component
import React from 'react';
import { useProtocols, useUserRiskScore } from '../hooks/useContract';

const DashboardComponent = () => {
  const { protocols, loading, error, refetch } = useProtocols();
  const userAddress = '0xYourUserAddress';
  const { riskScore } = useUserRiskScore(userAddress);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>DeFi Protocols</h1>
      <p>Your Risk Score: {riskScore || 'N/A'}</p>
      <button onClick={refetch}>Refresh</button>
      
      <ul>
        {protocols.map(protocol => (
          <li key={protocol.address}>
            {protocol.name} - Risk Score: {protocol.riskScore}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Available Contract Functions

### Read Functions

1. **getProtocolDetails(address _protocol)** - Get details about a registered protocol
2. **getAllProtocols()** - Get addresses of all registered protocols
3. **getAnomalyCount()** - Get the total number of anomalies recorded
4. **getUserExposures(address _user)** - Get the protocols a user is exposed to
5. **calculateUserRiskScore(address _user)** - Calculate a user's overall risk score

### Write Functions (Requires Signing)

1. **registerProtocol(address _protocol, string _name, uint256 _initialRiskScore)** - Register a new protocol (owner only)
2. **updateRiskScore(address _protocol, uint256 _riskScore)** - Update a protocol's risk score (owner only)
3. **recordAnomaly(address _protocol, string _anomalyType, string _description, uint256 _severity)** - Record a new anomaly (owner only)
4. **resolveAnomaly(uint256 _anomalyId)** - Resolve an existing anomaly (owner only)
5. **recordUserExposure(address _user, address _protocol)** - Record a user's exposure to a protocol (anyone can call)

## Events to Listen For

1. **AlertRaised** - Emitted when a protocol's risk score exceeds the threshold
2. **ProtocolRegistered** - Emitted when a new protocol is registered
3. **AnomalyDetected** - Emitted when a new anomaly is recorded
4. **AnomalyResolved** - Emitted when an anomaly is resolved
5. **UserExposureRecorded** - Emitted when a user's exposure to a protocol is recorded

Example of setting up event listeners:

```javascript
// Using ethers.js
sentinelContract.on("AlertRaised", (protocol, caller, alertType, riskScore, timestamp) => {
  console.log(`Alert raised for protocol ${protocol}`);
  console.log(`Alert type: ${alertType}`);
  console.log(`Risk score: ${riskScore}`);
  console.log(`Timestamp: ${new Date(timestamp * 1000)}`);
});

// Using web3.js
sentinelContract.events.AlertRaised({})
  .on('data', (event) => {
    const { protocol, caller, alertType, riskScore, timestamp } = event.returnValues;
    console.log(`Alert raised for protocol ${protocol}`);
    console.log(`Alert type: ${alertType}`);
    console.log(`Risk score: ${riskScore}`);
    console.log(`Timestamp: ${new Date(timestamp * 1000)}`);
  })
  .on('error', console.error);
```

## Best Practices

1. Always handle errors when interacting with the contract
2. Use async/await or promises to handle asynchronous contract calls
3. Implement proper UI feedback during transaction processing
4. Cache results when appropriate to reduce RPC calls
5. Consider implementing a retry mechanism for failed transactions

## Support

If you encounter any issues with the contract integration, please create an issue in the GitHub repository or contact the project maintainers. 