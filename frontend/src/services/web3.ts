import { ethers } from 'ethers';
import DeFiSentinelABI from '../abi/DeFiSentinel.json';
import axios from 'axios';

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

// Sample protocol data for development/demo purposes
const mockProtocols = [
  {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    name: 'Aave',
    riskScore: 25,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    anomalyCount: 2,
    tvl: 5230000000, // $5.23B
  },
  {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    name: 'Uniswap',
    riskScore: 40,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    anomalyCount: 1,
    tvl: 7180000000, // $7.18B
  },
  {
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    name: 'Compound',
    riskScore: 35,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 120, // 2 hours ago
    anomalyCount: 3,
    tvl: 3025000000, // $3.025B
  },
  {
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    name: 'MakerDAO',
    riskScore: 30,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    anomalyCount: 0,
    tvl: 9120000000, // $9.12B
  },
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    name: 'DAI',
    riskScore: 20,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    anomalyCount: 0,
    tvl: 6240000000, // $6.24B
  },
  {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    name: 'Wrapped Bitcoin',
    riskScore: 15,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 180, // 3 hours ago
    anomalyCount: 0,
    tvl: 8430000000, // $8.43B
  },
  {
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    name: 'Chainlink',
    riskScore: 72,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    anomalyCount: 5,
    lastAnomalyTime: Date.now() - 1000 * 60 * 15,
    tvl: 1850000000, // $1.85B
  },
  {
    address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
    name: 'Yearn Finance',
    riskScore: 55,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 75, // 1.25 hours ago
    anomalyCount: 2,
    tvl: 1320000000, // $1.32B
  },
  {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    name: 'Polygon',
    riskScore: 45,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 240, // 4 hours ago
    anomalyCount: 1,
    tvl: 3760000000, // $3.76B
  },
  {
    address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    name: 'Binance USD',
    riskScore: 25,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 360, // 6 hours ago
    anomalyCount: 0,
    tvl: 5120000000, // $5.12B
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USDC',
    riskScore: 80,
    isActive: false,
    lastUpdateTime: Date.now() - 1000 * 60 * 400, // 6.67 hours ago
    anomalyCount: 8,
    lastAnomalyTime: Date.now() - 1000 * 60 * 60,
    tvl: 4280000000, // $4.28B
  }
];

// Fetch protocols from API or use mock data as fallback
export const getAllProtocols = async (): Promise<any[]> => {
  try {
    // Try to fetch from the real API
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${apiUrl}/api/protocols`);
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Fetched real protocol data from API');
      return response.data;
    } else {
      console.warn('API returned invalid data format, falling back to mock data');
      return mockProtocols;
    }
  } catch (error) {
    console.warn('Failed to fetch protocols from API, using mock data:', error);
    return mockProtocols;
  }
};

// Get a specific protocol by address
export const getProtocolByAddress = async (address: string): Promise<any> => {
  try {
    // Try to fetch from the real API
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${apiUrl}/api/protocols/${address}`);
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`Failed to fetch protocol ${address} from API, trying mock data:`, error);
  }
  
  // Fallback to mock data if API call fails
  const protocol = mockProtocols.find(p => p.address.toLowerCase() === address.toLowerCase());
  return protocol || null;
};

// Update a protocol's monitoring status (for real implementations)
export const updateProtocolMonitoring = async (address: string, isActive: boolean): Promise<boolean> => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    await axios.patch(`${apiUrl}/api/protocols/${address}/monitoring`, { isActive });
    return true;
  } catch (error) {
    console.error('Failed to update protocol monitoring status:', error);
    return false;
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