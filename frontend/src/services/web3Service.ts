import { ethers } from 'ethers';
import DeFiSentinelABI from '../contracts/DeFiSentinel.json';

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS;
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
    DEFI_SENTINEL_ADDRESS || '',
    DeFiSentinelABI.abi,
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
    DEFI_SENTINEL_ADDRESS || '',
    DeFiSentinelABI.abi,
    signer
  );
};

// Read functions
export const getProtocolCount = async (): Promise<number> => {
  try {
    const count = await deFiSentinelContract.getProtocolCount();
    return count.toNumber();
  } catch (error) {
    console.error('Error getting protocol count:', error);
    throw error;
  }
};

export const getProtocolByAddress = async (address: string) => {
  try {
    const protocol = await deFiSentinelContract.getProtocolByAddress(address);
    return {
      address: protocol.addr,
      name: protocol.name,
      riskScore: protocol.riskScore.toNumber(),
      isActive: protocol.isActive,
      lastUpdateTime: protocol.lastUpdateTime.toNumber(),
      anomalyCount: protocol.anomalyCount.toNumber(),
      lastAnomalyTime: protocol.lastAnomalyTime.toNumber() || null
    };
  } catch (error) {
    console.error(`Error getting protocol with address ${address}:`, error);
    throw error;
  }
};

export const getAllProtocols = async () => {
  try {
    const count = await getProtocolCount();
    const protocols = [];
    
    for (let i = 0; i < count; i++) {
      const address = await deFiSentinelContract.protocols(i);
      const protocol = await getProtocolByAddress(address);
      protocols.push(protocol);
    }
    
    return protocols;
  } catch (error) {
    console.error('Error getting all protocols:', error);
    throw error;
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
      id: anomaly.id.toString(),
      protocolAddress: anomaly.protocolAddr,
      timestamp: anomaly.timestamp.toNumber(),
      description: anomaly.description,
      severity: anomaly.severity.toNumber()
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
export const registerProtocol = async (address: string, name: string) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.registerProtocol(address, name);
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
  description: string, 
  severity: number
) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.recordAnomaly(protocolAddress, description, severity);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error recording anomaly:', error);
    throw error;
  }
};

export const toggleProtocolStatus = async (protocolAddress: string) => {
  try {
    const signedContract = await getSignedContract();
    const tx = await signedContract.toggleProtocolStatus(protocolAddress);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error toggling protocol status:', error);
    throw error;
  }
};

export default {
  getSigner,
  getSignedContract,
  getProtocolCount,
  getProtocolByAddress,
  getAllProtocols,
  getAnomalyCount,
  getAnomalyByIndex,
  getAllAnomalies,
  registerProtocol,
  updateRiskScore,
  recordAnomaly,
  toggleProtocolStatus
}; 