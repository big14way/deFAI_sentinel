import { ethers } from 'ethers';
import contractABI from '../abi/DeFiSentinel.json';
import { Protocol } from '../types';

// Contract address on Base network
const CONTRACT_ADDRESS = '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';

// Get provider and contract instance
const getContract = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not available');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
  return { provider, signer, contract };
};

// Get all registered protocols
export const getAllProtocols = async (): Promise<Protocol[]> => {
  try {
    const { contract } = getContract();
    
    // Get all protocol addresses
    const addresses = await contract.getAllProtocols();
    
    // Get details for each protocol
    const protocols: Protocol[] = await Promise.all(
      addresses.map(async (address: string) => {
        const details = await contract.getProtocolDetails(address);
        
        // Get anomaly count for this protocol
        let anomalyCount = 0;
        const totalAnomalies = await contract.getAnomalyCount();
        
        for (let i = 0; i < totalAnomalies.toNumber(); i++) {
          const anomaly = await contract.anomalies(i);
          if (anomaly.protocol.toLowerCase() === address.toLowerCase()) {
            anomalyCount++;
          }
        }
        
        return {
          address,
          name: details.name,
          riskScore: details.riskScore.toNumber(),
          isActive: details.isActive,
          lastUpdateTime: details.lastUpdateTime.toNumber() * 1000, // Convert to ms
          anomalyCount,
          lastAnomalyTime: 0, // Would need to calculate from anomalies
          tvl: 0 // This would need to be fetched from elsewhere
        };
      })
    );
    
    return protocols;
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return [];
  }
};

// Calculate user risk score
export const getUserRiskScore = async (userAddress: string): Promise<number> => {
  try {
    const { contract } = getContract();
    const riskScore = await contract.calculateUserRiskScore(userAddress);
    return riskScore.toNumber();
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return 0;
  }
};

// Get user exposures
export const getUserExposures = async (userAddress: string): Promise<string[]> => {
  try {
    const { contract } = getContract();
    return await contract.getUserExposures(userAddress);
  } catch (error) {
    console.error('Error fetching user exposures:', error);
    return [];
  }
};

// Record user exposure to a protocol
export const recordUserExposure = async (userAddress: string, protocolAddress: string): Promise<boolean> => {
  try {
    const { contract } = getContract();
    const tx = await contract.recordUserExposure(userAddress, protocolAddress);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error recording user exposure:', error);
    return false;
  }
};

// Listen for alerts
export const setupAlertListeners = (callback: (alert: any) => void) => {
  try {
    const { contract } = getContract();
    
    // Listen for alert events
    contract.on('AlertRaised', (protocol, caller, alertType, riskScore, timestamp, event) => {
      callback({
        protocol,
        caller,
        alertType,
        riskScore: riskScore.toNumber(),
        timestamp: timestamp.toNumber() * 1000,
        transactionHash: event.transactionHash
      });
    });
    
    // Listen for anomaly events
    contract.on('AnomalyDetected', (protocol, anomalyType, severity, event) => {
      callback({
        protocol,
        anomalyType,
        severity: severity.toNumber(),
        timestamp: Date.now(),
        transactionHash: event.transactionHash
      });
    });
    
    return () => {
      contract.removeAllListeners();
    };
  } catch (error) {
    console.error('Error setting up event listeners:', error);
    return () => {};
  }
}; 