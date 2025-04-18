import { ethers } from 'ethers';
import DeFiSentinelABI from '../abi/DeFiSentinel.json';
import axios from 'axios';
import { Protocol } from '../types/protocol';
import { Anomaly } from '../types/anomaly';

// Use the any type for window.ethereum as it's already typed by wagmi
// and we're casting to any when using it

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS || '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org';

// Initialize provider and contract
let provider: ethers.providers.JsonRpcProvider | null = null;
let deFiSentinelContract: ethers.Contract | null = null;
let isInitialized = false;

// Placeholder logo for protocols without a logo
const defaultLogoUrl = 'https://via.placeholder.com/50?text=DeFi';

// Function to check if wallet is connected
const isWalletConnected = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

// Function to initialize provider and contracts
const initialize = () => {
  if (isInitialized) return;

  try {
    // Initialize provider
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Initialize contract
    deFiSentinelContract = new ethers.Contract(
      DEFI_SENTINEL_ADDRESS,
      DeFiSentinelABI,
      provider
    );
    
    isInitialized = true;
    console.log('Web3 service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize web3 service:', error);
    provider = null;
    deFiSentinelContract = null;
  }
};

// Try to initialize on import
initialize();

// Function to ensure provider is available or throw a handled error
const ensureProvider = () => {
  if (!provider) {
    // Try to initialize again
    initialize();
    
    if (!provider) {
      throw new Error('Provider not initialized');
    }
  }
  return provider;
};

// Function to ensure contract is available or throw a handled error
const ensureContract = () => {
  if (!deFiSentinelContract) {
    // Try to initialize again
    initialize();
    
    if (!deFiSentinelContract) {
      throw new Error('Contract not initialized');
    }
  }
  return deFiSentinelContract;
};

// Get signer from wallet
export const getSigner = async () => {
  if (window.ethereum) {
    try {
      // Force cast to any to bypass type checking
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum as any);
      return ethersProvider.getSigner();
    } catch (error) {
      console.error('Error getting signer:', error);
      throw new Error('Failed to get signer. Please check your wallet connection.');
    }
  }
  throw new Error('No ethereum object found. Please install a wallet.');
};

// Connect contract with signer for write operations
export const getSignedContract = async () => {
  try {
    const signer = await getSigner();
    return new ethers.Contract(
      DEFI_SENTINEL_ADDRESS,
      DeFiSentinelABI,
      signer
    );
  } catch (error) {
    console.error('Error getting signed contract:', error);
    throw error;
  }
};

// Get contract with current provider (read-only)
export const getContract = () => {
  try {
    return ensureContract();
  } catch (error) {
    console.error('Error getting contract:', error);
    return null;
  }
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

const mockAnomalies = [
  {
    protocol: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    anomalyType: 'PRICE_DEVIATION',
    description: 'Unusual price movement detected',
    severity: 2,
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    resolved: false
  },
  {
    protocol: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    anomalyType: 'VOLUME_SPIKE',
    description: 'Sudden increase in transaction volume',
    severity: 3,
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    resolved: false
  },
  {
    protocol: '0x514910771af9ca656af840dff83e8264ecf986ca',
    anomalyType: 'SMART_CONTRACT_INTERACTION',
    description: 'Unexpected contract interaction pattern',
    severity: 4,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    resolved: false
  }
];

// Mock cross-chain links for development/demo purposes
const mockCrossChainLinks = [
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 8453, // Base
    sourceProtocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Aave on Ethereum
    targetProtocolAddress: '0x7dd703de0f5b39c5c5d05f503f587f4648414924', // Aave on Base (mock)
    bridgeAddress: '0x4200000000000000000000000000000000000010', // Base bridge
    linkType: 'bridge',
    riskScore: 35,
    lastActivity: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    volumeLast24h: 12500000 // $12.5M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 42161, // Arbitrum
    sourceProtocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Uniswap on Ethereum
    targetProtocolAddress: '0xfA7F8980b0f1E64A2062791cc3b0871572f1F7f0', // Uniswap on Arbitrum
    bridgeAddress: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', // Arbitrum bridge
    linkType: 'bridge',
    riskScore: 28,
    lastActivity: Date.now() - 1000 * 60 * 120, // 2 hours ago
    volumeLast24h: 18700000 // $18.7M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 137, // Polygon
    sourceProtocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888', // Compound on Ethereum
    targetProtocolAddress: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4', // Compound on Polygon
    bridgeAddress: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77', // Polygon bridge
    linkType: 'bridge',
    riskScore: 42,
    lastActivity: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    volumeLast24h: 9800000 // $9.8M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 10, // Optimism
    sourceProtocolAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MakerDAO on Ethereum
    targetProtocolAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // MakerDAO on Optimism
    bridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1', // Optimism bridge
    linkType: 'bridge',
    riskScore: 25,
    lastActivity: Date.now() - 1000 * 60 * 80, // 80 minutes ago
    volumeLast24h: 15300000 // $15.3M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 43114, // Avalanche
    sourceProtocolAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI on Ethereum
    targetProtocolAddress: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI on Avalanche
    bridgeAddress: '0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0', // Avalanche bridge
    linkType: 'bridge',
    riskScore: 32,
    lastActivity: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    volumeLast24h: 7400000 // $7.4M
  }
];

// Fetch protocols from API or use mock data as fallback
export const getAllProtocols = async (): Promise<Protocol[]> => {
  console.log('Getting all protocols');
  
  try {
    // Check if wallet is connected - if not, return mock data immediately
    if (!isWalletConnected()) {
      console.log('Wallet not connected, returning mock protocols');
      return mockProtocols;
    }

    const contract = await getContract();
    if (!contract) {
      console.warn('No contract available, falling back to mock data');
      return mockProtocols;
    }

    // Attempt to get protocols from contract
    try {
      console.log('Fetching protocols from contract...');
      const allProtocols = await contract.getAllProtocols();
      console.log('Protocol data from contract:', allProtocols);
      
      if (!allProtocols || allProtocols.length === 0) {
        console.log('No protocols found on contract, using mock data');
        return mockProtocols;
      }
      
      // Map contract data to Protocol objects
      return allProtocols.map((protocolData: any) => {
        // Check if protocolData is a string (address only) or an object
        const isAddressOnly = typeof protocolData === 'string';
        const address = isAddressOnly ? protocolData : (protocolData.addr || protocolData);
        
        // Find a matching mock protocol to use for better display
        const mockProtocol = mockProtocols.find(p => 
          p.address.toLowerCase() === (address || '').toLowerCase()
        );
        
        // If we have a matching mock protocol, use its name and other data
        const protocol = {
          address: address,
          name: isAddressOnly ? 
                (mockProtocol?.name || getProtocolNameFromAddress(address)) : 
                (protocolData.name || mockProtocol?.name || getProtocolNameFromAddress(address)),
          description: protocolData.description || mockProtocol?.description || '',
          category: protocolData.category || mockProtocol?.category || 'DeFi',
          isActive: typeof protocolData.isActive === 'boolean' ? protocolData.isActive : true,
          riskScore: Number(protocolData.riskScore) || mockProtocol?.riskScore || Math.floor(Math.random() * 80) + 10,
          tvl: Number(protocolData.tvl) || mockProtocol?.tvl || Math.floor(Math.random() * 5000000000),
          lastUpdateTime: Number(protocolData.lastUpdateTime) || mockProtocol?.lastUpdateTime || Date.now() - 1000 * 60 * 30,
          anomalyCount: mockProtocol?.anomalyCount || Math.floor(Math.random() * 5),
          url: protocolData.url || mockProtocol?.url || 'https://example.com',
          logoUrl: protocolData.logoUrl || mockProtocol?.logoUrl || defaultLogoUrl,
          // Ensure other required fields are present
          status: 'active',
          chain: 'Base',
          lastUpdated: Number(protocolData.lastUpdateTime) || mockProtocol?.lastUpdateTime || Date.now() - 1000 * 60 * 30,
        };
        
        console.log('Mapped protocol:', protocol);
        return protocol;
      });
    } catch (error) {
      console.error('Error getting protocols from contract:', error);
      return mockProtocols;
    }
  } catch (error) {
    console.error('Error in getAllProtocols:', error);
    return mockProtocols;
  }
};

// Helper function to get protocol name from address
const getProtocolNameFromAddress = (address: string): string => {
  // Common DeFi protocols addresses
  const knownProtocols: Record<string, string> = {
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'Aave',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'Uniswap',
    '0xc00e94cb662c3520282e6f5717214004a7f26888': 'Compound',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'MakerDAO',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'Wrapped Bitcoin',
    '0x514910771af9ca656af840dff83e8264ecf986ca': 'Chainlink',
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 'Yearn Finance',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'Polygon',
    '0x4fabb145d64652a948d72533023f6e7a623c7c53': 'Binance USD',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'Tether',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'Wrapped Ether',
    // Add more as needed
  };
  
  const normalizedAddress = address.toLowerCase();
  return knownProtocols[normalizedAddress] || 'Protocol ' + address.substring(0, 6);
};

// Get a specific protocol by address
export const getProtocolByAddress = async (address: string): Promise<any> => {
  // Try API first
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${apiUrl}/api/protocols/${address}`);
    
    if (response.data) {
      return response.data;
    }
  } catch (apiError) {
    console.warn(`Failed to fetch protocol ${address} from API:`, apiError);
  }
  
  // Try blockchain
  if (isInitialized && deFiSentinelContract) {
    try {
      const details = await deFiSentinelContract.getProtocolDetails(address);
      if (details && details.name) {
        return {
          address,
          name: details.name,
          riskScore: details.riskScore.toNumber(),
          isActive: details.isActive,
          lastUpdateTime: details.lastUpdateTime.toNumber() * 1000,
          anomalyCount: 0, // Would need additional calls to get this
          tvl: 0 // Not available on-chain
        };
      }
    } catch (blockchainError) {
      console.warn(`Failed to fetch protocol ${address} from blockchain:`, blockchainError);
    }
  }
  
  // Fallback to mock data
  const protocol = mockProtocols.find(p => p.address.toLowerCase() === address.toLowerCase());
  return protocol || null;
};

// Get protocol with cross-chain deployments
export const getProtocolWithDeployments = async (address: string): Promise<any> => {
  try {
    const protocol = await getProtocolByAddress(address);
    
    if (!protocol) {
      return null;
    }
    
    // Add cross-chain deployments
    protocol.deployments = {};
    protocol.chainId = protocol.chainId || 8453; // Default to Base
    
    // Find cross-chain links for this protocol
    const relevantLinks = mockCrossChainLinks.filter(
      link => link.sourceProtocolAddress.toLowerCase() === address.toLowerCase() || 
             link.targetProtocolAddress.toLowerCase() === address.toLowerCase()
    );
    
    // Generate deployments from links
    relevantLinks.forEach(link => {
      if (link.sourceProtocolAddress.toLowerCase() === address.toLowerCase()) {
        protocol.deployments[link.targetChainId] = link.targetProtocolAddress;
      } else {
        protocol.deployments[link.sourceChainId] = link.sourceProtocolAddress;
      }
    });
    
    // Calculate cross-chain risk score
    if (relevantLinks.length > 0) {
      const avgBridgeRisk = relevantLinks.reduce((sum, link) => sum + link.riskScore, 0) / relevantLinks.length;
      // Weighted average: 70% protocol risk, 30% bridge risk
      protocol.crossChainRiskScore = Math.round(0.7 * protocol.riskScore + 0.3 * avgBridgeRisk);
    } else {
      protocol.crossChainRiskScore = protocol.riskScore;
    }
    
    return protocol;
  } catch (error) {
    console.error(`Error fetching protocol with deployments:`, error);
    return null;
  }
};

// Get cross-chain links for a protocol
export const getProtocolCrossChainLinks = async (address: string): Promise<any[]> => {
  try {
    // In a real implementation, this would fetch data from the API or blockchain
    return mockCrossChainLinks.filter(
      link => link.sourceProtocolAddress.toLowerCase() === address.toLowerCase() || 
             link.targetProtocolAddress.toLowerCase() === address.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching cross-chain links:`, error);
    return [];
  }
};

// Get all unique chains with protocol deployments
export const getAllChains = async (): Promise<number[]> => {
  try {
    const protocols = await getAllProtocols();
    
    // Collect unique chain IDs
    const chainSet = new Set<number>();
    chainSet.add(8453); // Base (default)
    
    // Add chains from mock links
    mockCrossChainLinks.forEach(link => {
      chainSet.add(link.sourceChainId);
      chainSet.add(link.targetChainId);
    });
    
    return Array.from(chainSet);
  } catch (error) {
    console.error('Error fetching chains:', error);
    return [1, 8453]; // Default to Ethereum and Base
  }
};

// Get protocols deployed on a specific chain
export const getProtocolsByChain = async (chainId: number): Promise<any[]> => {
  try {
    const allProtocols = await getAllProtocols();
    
    if (chainId === 8453) {
      // All protocols are deployed on Base by default in our mock data
      return allProtocols;
    }
    
    // For other chains, check mock cross-chain links
    const protocolsOnChain: any[] = [];
    const seenAddresses = new Set<string>();
    
    mockCrossChainLinks.forEach(link => {
      if (link.sourceChainId === chainId) {
        const sourceProtocol = mockProtocols.find(p => 
          p.address.toLowerCase() === link.sourceProtocolAddress.toLowerCase()
        );
        
        if (sourceProtocol && !seenAddresses.has(sourceProtocol.address.toLowerCase())) {
          seenAddresses.add(sourceProtocol.address.toLowerCase());
          protocolsOnChain.push({
            ...sourceProtocol,
            chainId
          });
        }
      } else if (link.targetChainId === chainId) {
        const sourceProtocol = mockProtocols.find(p => 
          p.address.toLowerCase() === link.sourceProtocolAddress.toLowerCase()
        );
        
        if (sourceProtocol && !seenAddresses.has(link.targetProtocolAddress.toLowerCase())) {
          seenAddresses.add(link.targetProtocolAddress.toLowerCase());
          protocolsOnChain.push({
            ...sourceProtocol,
            address: link.targetProtocolAddress,
            chainId
          });
        }
      }
    });
    
    return protocolsOnChain;
  } catch (error) {
    console.error(`Error fetching protocols for chain ${chainId}:`, error);
    return [];
  }
};

// Track asset flows between chains
export const getAssetFlowsBetweenChains = async (sourceChainId: number, targetChainId: number): Promise<any> => {
  try {
    // This would be a real API call in production
    const relevantLinks = mockCrossChainLinks.filter(
      link => (link.sourceChainId === sourceChainId && link.targetChainId === targetChainId) ||
             (link.sourceChainId === targetChainId && link.targetChainId === sourceChainId)
    );
    
    const totalVolume = relevantLinks.reduce((sum, link) => sum + link.volumeLast24h, 0);
    const flowCount = relevantLinks.length;
    const avgRiskScore = flowCount > 0 
      ? relevantLinks.reduce((sum, link) => sum + link.riskScore, 0) / flowCount 
      : 0;
    
    // Generate mock historical data
    const historicalData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - i);
      
      return {
        date: day.toISOString().split('T')[0],
        volume: totalVolume * (0.8 + Math.random() * 0.4), // Random variation
        flowCount: flowCount + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)
      };
    }).reverse();
    
    return {
      sourceChainId,
      targetChainId,
      totalVolume,
      flowCount,
      avgRiskScore,
      links: relevantLinks,
      historicalData
    };
  } catch (error) {
    console.error(`Error fetching asset flows between chains:`, error);
    return null;
  }
};

// Update a protocol's monitoring status
export const updateProtocolMonitoring = async (address: string, isActive: boolean): Promise<boolean> => {
  try {
    // First try the API
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    await axios.patch(`${apiUrl}/api/protocols/${address}/monitoring`, { isActive });
    return true;
  } catch (apiError) {
    console.warn('Failed to update protocol monitoring status via API:', apiError);
    
    // Try to update via blockchain
    try {
      const signedContract = await getSignedContract();
      // This is a hypothetical function - the actual contract would need such a function
      // const tx = await signedContract.updateProtocolStatus(address, isActive);
      // await tx.wait();
      return true;
    } catch (blockchainError) {
      console.error('Failed to update protocol monitoring status via blockchain:', blockchainError);
      throw blockchainError;
    }
  }
};

// Get anomaly count
export const getAnomalyCount = async (): Promise<number> => {
  if (!isInitialized || !deFiSentinelContract) {
    console.warn('Contract not initialized, returning mock anomaly count');
    return mockAnomalies.length;
  }
  
  try {
    const count = await deFiSentinelContract.getAnomalyCount();
    return count.toNumber();
  } catch (error) {
    console.error('Error getting anomaly count, returning mock count:', error);
    return mockAnomalies.length;
  }
};

// Get anomaly by index
export const getAnomalyByIndex = async (index: number) => {
  if (!isInitialized || !deFiSentinelContract) {
    console.warn('Contract not initialized, returning mock anomaly if available');
    return index < mockAnomalies.length ? mockAnomalies[index] : null;
  }
  
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
    console.error(`Error getting anomaly at index ${index}, returning mock if available:`, error);
    return index < mockAnomalies.length ? mockAnomalies[index] : null;
  }
};

// Get all anomalies
export const getAllAnomalies = async (): Promise<Anomaly[]> => {
  console.log('Getting all anomalies');
  
  try {
    // Check if wallet is connected - if not, return mock data immediately
    if (!isWalletConnected()) {
      console.log('Wallet not connected, returning mock anomalies');
      return mockAnomalies;
    }

    const contract = await getContract();
    if (!contract) {
      console.warn('No contract available, falling back to mock anomalies');
      return mockAnomalies;
    }

    // Attempt to get anomalies from contract
    try {
      const allAnomalies = await contract.getAllAnomalies();
      console.log('Anomaly data from contract:', allAnomalies);
      
      if (!allAnomalies || allAnomalies.length === 0) {
        console.log('No anomalies found on contract, using mock data');
        return mockAnomalies;
      }
      
      // Map contract data to Anomaly objects
      return allAnomalies.map((anomalyData: any) => {
        return {
          id: anomalyData.id,
          timestamp: Number(anomalyData.timestamp),
          protocol: {
            address: anomalyData.protocolAddr,
            name: 'Unknown Protocol', // We would need to fetch this separately
            riskScore: 0,
            isActive: true
          },
          type: anomalyData.anomalyType,
          severity: anomalyData.severity,
          description: anomalyData.description,
          score: Number(anomalyData.score),
          features: anomalyData.features || {}
        };
      });
    } catch (error) {
      console.error('Error getting anomalies from contract:', error);
      return mockAnomalies;
    }
  } catch (error) {
    console.error('Error in getAllAnomalies:', error);
    return mockAnomalies;
  }
};

// Write functions
export const registerProtocol = async (address: string, name: string, initialRiskScore: number = 50): Promise<boolean> => {
  try {
    // Check if protocol is already registered
    try {
      const protocol = await getProtocolByAddress(address);
      if (protocol) {
        throw new Error('Protocol already registered');
      }
    } catch (checkError) {
      // If error is not about the protocol already existing, allow registration
      const error = checkError as Error;
      if (error.message && error.message.includes('Protocol already registered')) {
        throw checkError;
      }
    }

    const signedContract = await getSignedContract();
    const tx = await signedContract.registerProtocol(address, name, initialRiskScore);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error registering protocol:', error);
    throw error;
  }
};

// Update risk score
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

// Record anomaly
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

// Resolve anomaly
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

// Record user exposure
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

// Get user exposures
export const getUserExposures = async (userAddress: string) => {
  if (!isInitialized || !deFiSentinelContract) {
    console.warn('Contract not initialized, returning empty array for user exposures');
    return [];
  }
  
  try {
    const exposures = await deFiSentinelContract.getUserExposures(userAddress);
    return exposures;
  } catch (error) {
    console.error('Error fetching user exposures:', error);
    return [];
  }
};

// Calculate user risk score
export const calculateUserRiskScore = async (userAddress: string) => {
  if (!isInitialized || !deFiSentinelContract) {
    console.warn('Contract not initialized, returning default risk score 0');
    return 0;
  }
  
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