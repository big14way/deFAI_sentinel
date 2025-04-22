import { ethers } from 'ethers';
import DeFiSentinelABI from '../contracts/DeFiSentinel.json';

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS;
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org';

// Initialize provider and contract
let provider: ethers.providers.JsonRpcProvider;
let deFiSentinelContract: ethers.Contract;

const initializeProvider = () => {
  try {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  } catch (error) {
    console.error('Failed to initialize provider:', error);
    // Create a fallback minimal provider that will be replaced later
    provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
  }
};

const initializeContracts = () => {
  if (!provider) initializeProvider();
  
  if (!DEFI_SENTINEL_ADDRESS) {
    console.warn('DEFI_SENTINEL_ADDRESS is not defined. Contract functionality will be limited.');
    // Create a dummy contract that will throw helpful errors
    deFiSentinelContract = new ethers.Contract(
      '0x0000000000000000000000000000000000000000',
      DeFiSentinelABI.abi,
      provider
    );
  } else {
    deFiSentinelContract = new ethers.Contract(
      DEFI_SENTINEL_ADDRESS,
      DeFiSentinelABI.abi,
      provider
    );
  }
};

// Initialize on first import
initializeProvider();
initializeContracts();

// Get signer from wallet
export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found. Please install a wallet extension like MetaMask.');
  }
  
  try {
    // Force cast to any to bypass type checking
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum as any);
    
    // Request account access
    await ethersProvider.send('eth_requestAccounts', []);
    
    return ethersProvider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    throw new Error('Failed to connect to wallet. Please check your wallet connection and try again.');
  }
};

// Connect contract with signer for write operations
export const getSignedContract = async () => {
  if (!DEFI_SENTINEL_ADDRESS) {
    throw new Error('DeFi Sentinel contract address is not defined. Please check your environment configuration.');
  }
  
  try {
    const signer = await getSigner();
    return new ethers.Contract(
      DEFI_SENTINEL_ADDRESS,
      DeFiSentinelABI.abi,
      signer
    );
  } catch (error) {
    console.error('Error getting signed contract:', error);
    throw error;
  }
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

export interface Web3Protocol {
  address: string;
  name: string;
  riskScore: number;
  isActive: boolean;
  lastUpdateTime: number;
  anomalyCount: number;
  lastAnomalyTime: number | null;
}

export interface Web3Anomaly {
  id: string;
  protocolAddress: string;
  timestamp: number;
  description: string;
  severity: number;
}

export const getProtocolByAddress = async (address: string): Promise<Web3Protocol> => {
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

export const getAllProtocols = async (): Promise<Web3Protocol[]> => {
  try {
    const count = await getProtocolCount();
    const protocols: Web3Protocol[] = [];
    
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

export const getAnomalyByIndex = async (index: number): Promise<Web3Anomaly> => {
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

export const getAllAnomalies = async (): Promise<Web3Anomaly[]> => {
  try {
    const count = await getAnomalyCount();
    const anomalies: Web3Anomaly[] = [];
    
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