import { ethers } from 'ethers';
import DeFiSentinelABI from '../abi/DeFiSentinel.json';

// Use the any type for window.ethereum as it's already typed by wagmi
// and we're casting to any when using it

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS || '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org';

// Initialize provider and contract
let provider: ethers.providers.JsonRpcProvider;
let deFiSentinelContract: ethers.Contract;

const initializeProvider = () => {
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);
};

const initializeContracts = () => {
  if (!provider) initializeProvider();
  deFiSentinelContract = new ethers.Contract(
    DEFI_SENTINEL_ADDRESS,
    DeFiSentinelABI,
    provider
  );
};

// Initialize on first import
initializeProvider();
initializeContracts();

// Get signer from wallet
export const getSigner = async () => {
  if (window.ethereum) {
    // Force cast to any to bypass type checking
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum as any);
    return ethersProvider.getSigner();
  }
  throw new Error('No ethereum object found. Please install a wallet.');
};

// Connect contract with signer for write operations
export const getSignedContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    DEFI_SENTINEL_ADDRESS,
    DeFiSentinelABI,
    signer
  );
};

// Read functions
export const getAllProtocols = async () => {
  try {
    const addresses = await deFiSentinelContract.getAllProtocols();
    
    // Get details for each protocol
    const protocols = await Promise.all(
      addresses.map(async (address: string) => {
        const details = await deFiSentinelContract.getProtocolDetails(address);
        
        // Get anomaly count for this protocol
        let anomalyCount = 0;
        const totalAnomalies = await deFiSentinelContract.getAnomalyCount();
        
        for (let i = 0; i < totalAnomalies.toNumber(); i++) {
          const anomaly = await deFiSentinelContract.anomalies(i);
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

export const getAnomalyCount = async (): Promise<number> => {
  try {
    const count = await deFiSentinelContract.getAnomalyCount();
    return count.toNumber();
  } catch (error) {
    console.error('Error getting anomaly count:', error);
    throw error;
  }
};

export const getAnomalyByIndex = async (index: number) => {
  try {
    const anomaly = await deFiSentinelContract.anomalies(index);
    return {
      protocol: anomaly.protocol,
      anomalyType: anomaly.anomalyType,
      description: anomaly.description,
      severity: anomaly.severity.toNumber(),
      timestamp: anomaly.timestamp.toNumber() * 1000,
      resolved: anomaly.resolved
    };
  } catch (error) {
    console.error(`Error getting anomaly at index ${index}:`, error);
    throw error;
  }
};

export const getAllAnomalies = async () => {
  try {
    const count = await getAnomalyCount();
    const anomalies = [];
    
    for (let i = 0; i < count; i++) {
      const anomaly = await getAnomalyByIndex(i);
      anomalies.push(anomaly);
    }
    
    return anomalies;
  } catch (error) {
    console.error('Error getting all anomalies:', error);
    throw error;
  }
};

// Write functions
export const registerProtocol = async (address: string, name: string, initialRiskScore: number) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.registerProtocol(address, name, initialRiskScore);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error registering protocol:', error);
    throw error;
  }
};

export const updateRiskScore = async (protocolAddress: string, newScore: number) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.updateRiskScore(protocolAddress, newScore);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error updating risk score:', error);
    throw error;
  }
};

export const recordAnomaly = async (
  protocolAddress: string, 
  anomalyType: string,
  description: string, 
  severity: number
) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.recordAnomaly(protocolAddress, anomalyType, description, severity);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error recording anomaly:', error);
    throw error;
  }
};

export const resolveAnomaly = async (anomalyId: number) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.resolveAnomaly(anomalyId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    throw error;
  }
};

export const recordUserExposure = async (userAddress: string, protocolAddress: string) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.recordUserExposure(userAddress, protocolAddress);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error recording user exposure:', error);
    throw error;
  }
};

export const getUserExposures = async (userAddress: string) => {
  try {
    const exposures = await deFiSentinelContract.getUserExposures(userAddress);
    return exposures;
  } catch (error) {
    console.error('Error fetching user exposures:', error);
    return [];
  }
};

export const calculateUserRiskScore = async (userAddress: string) => {
  try {
    const score = await deFiSentinelContract.calculateUserRiskScore(userAddress);
    return score.toNumber();
  } catch (error) {
    console.error('Error calculating user risk score:', error);
    return 0;
  }
};

export default {
  getSigner,
  getSignedContract,
  getAllProtocols,
  getAnomalyCount,
  getAnomalyByIndex,
  getAllAnomalies,
  registerProtocol,
  updateRiskScore,
  recordAnomaly,
  resolveAnomaly,
  recordUserExposure,
  getUserExposures,
  calculateUserRiskScore
}; 