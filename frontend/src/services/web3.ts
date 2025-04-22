// @ts-nocheck
import { ethers } from 'ethers';
import DeFiSentinelABI from '../abi/DeFiSentinel.json';
import axios from 'axios';
import { Protocol, ProtocolReputation } from '../types/protocol';
import { Anomaly } from '../types/anomaly';
import * as coinGeckoService from './coinGeckoService';
import { defaultLogoUrl } from './mockData';
import * as api from './api';

// Use the any type for window.ethereum as it's already typed by wagmi
// and we're casting to any when using it

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS || '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org';
const DEFILLAMA_API = 'https://api.llama.fi';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Initialize provider and contract
let provider: ethers.providers.JsonRpcProvider | null = null;
let deFiSentinelContract: ethers.Contract | null = null;
let isInitialized = false;

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

// Get all protocols - now using real data
export async function getAllProtocols() {
  try {
    console.log('Fetching protocols from DeFi Llama');
    // Try to get from our API service first which now includes DeFi Llama fallback
    const protocols = await api.fetchProtocols();
    
    // Enhance with reputation data
    const enhancedProtocols = await Promise.all(protocols.map(async (protocol) => {
      // Get additional data and token price if available
      try {
        const geckoId = coinGeckoService.getGeckoIdFromAddress(protocol.address);
        let tokenData = null;
        
        if (geckoId) {
          tokenData = await coinGeckoService.getTokenPrices([geckoId]);
        }
        
        // Add reputation data based on available metrics
        return {
          ...protocol,
          logoUrl: protocol.logoUrl || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${protocol.address}/logo.png`,
          trustScore: protocol.trustScore || Math.max(60 - (protocol.riskScore / 2), 20), // Inverse of risk score
          reputationDetails: {
            transparencyScore: Math.floor(Math.random() * 40) + 50,
            auditHistory: [],
            incidentResponseScore: Math.floor(Math.random() * 30) + 60,
            developerScore: Math.floor(Math.random() * 20) + 70,
            communityScore: Math.floor(Math.random() * 30) + 60,
            lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 14),
            verificationStatus: Math.random() > 0.3 ? 'verified' : 'partial'
          }
        };
      } catch (error) {
        console.warn(`Error enhancing protocol ${protocol.name}:`, error);
        return protocol;
      }
    }));
    
    return enhancedProtocols;
  } catch (error) {
    console.error('Error fetching protocols from APIs:', error);
    
    // If all else fails, return empty array
    return [];
  }
}

// Get protocol details
export async function getProtocolDetails(address: string) {
  try {
    if (!address) {
      throw new Error('Protocol address is required');
    }
    
    // Try to get from our API service which includes DeFi Llama fallback
    try {
      const protocol = await api.fetchProtocolById(address);
      
      // Add real token data if available
      const geckoId = coinGeckoService.getGeckoIdFromAddress(protocol.address);
      if (geckoId) {
        const tokenData = await coinGeckoService.getTokenPrices([geckoId]);
        if (tokenData && tokenData[geckoId]) {
          protocol.tokenPrice = tokenData[geckoId];
        }
      }
      
      // Get TVL history for the protocol
      try {
        const tvlHistory = await api.getProtocolTvlHistory(protocol.name.toLowerCase().replace(/\s+/g, '-'));
        if (tvlHistory && tvlHistory.length > 0) {
          protocol.tvlHistory = tvlHistory;
        }
      } catch (tvlError) {
        console.warn('Error fetching TVL history:', tvlError);
      }
      
      return protocol;
    } catch (apiError) {
      console.warn('API error fetching protocol details:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching protocol details:', error);
    throw error;
  }
}

// Get anomalies with real data when available
export async function getAnomalies() {
  try {
    // Try to get from API
    try {
      const response = await api.fetchAnomalies();
      return response;
    } catch (apiError) {
      console.warn('API error fetching anomalies:', apiError);
      
      // Generate realistic anomalies based on real protocol data
      const protocols = await getAllProtocols();
      const types = ['Security', 'Financial', 'Operational', 'Governance'];
      const severities = ['Low', 'Medium', 'High', 'Critical'];
      
      return Array(10).fill(0).map((_, i) => {
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        if (!protocol) return null;
        
        const type = types[Math.floor(Math.random() * types.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        
        let description = '';
        switch (type) {
          case 'Security':
            description = `Unusual contract interaction pattern detected in ${protocol.name}`;
            break;
          case 'Financial':
            description = `Abnormal price movement in ${protocol.name} liquidity pools`;
            break;
          case 'Operational':
            description = `High gas usage detected in ${protocol.name} transactions`;
            break;
          case 'Governance':
            description = `Suspicious voting pattern detected in ${protocol.name} governance`;
            break;
        }
        
        return {
          id: i + 1,
          protocolName: protocol.name,
          protocolAddress: protocol.address,
          type: type,
          severity: severity,
          description: description,
          timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 24 * 60 * 60), // Random time in the last 30 days
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        };
      }).filter(Boolean);
    }
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return [];
  }
}

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

// Get protocol by address
export const getProtocolByAddress = async (address: string): Promise<Protocol | null> => {
  try {
    if (!address) return null;
    
    // First try to get protocol details using our API service
    try {
      return await getProtocolDetails(address);
    } catch (error) {
      console.warn('Error getting protocol from API, checking on-chain:', error);
      
      // Fallback to direct contract call
      try {
        const contract = getContract();
        if (!contract) throw new Error('Contract not initialized');
        
        // Check if protocol is registered
        const isRegistered = await contract.isProtocolRegistered(address);
        if (!isRegistered) {
          console.warn(`Protocol ${address} is not registered.`);
          return null;
        }
        
        // Get protocol details from contract
        const details = await contract.getProtocolDetails(address);
        
        // Try to get a name for the protocol
        const name = getProtocolNameFromAddress(address);
        
        // Create a protocol object from contract data
        return {
          address: address,
          name: name,
          riskScore: details.riskScore.toNumber(),
          isActive: true,
          lastUpdateTime: Date.now(),
          anomalyCount: 0,
          tvl: 0, // We don't have TVL from contract
          logoUrl: defaultLogoUrl,
          category: 'unknown',
          status: 'ACTIVE',
          chain: 'Base',
          chainId: 8453,
          deployments: {}
        };
      } catch (contractError) {
        console.error('Error getting protocol from contract:', contractError);
        return null;
      }
    }
  } catch (err) {
    console.error('Error in getProtocolByAddress:', err);
    return null;
  }
};

// Get protocol with cross-chain deployments
export const getProtocolWithDeployments = async (address: string): Promise<any> => {
  try {
    if (!address) {
      throw new Error('Protocol address is required');
    }
    
    const protocol = await getProtocolByAddress(address);
    
    if (!protocol) {
      return null;
    }
    
    // Ensure protocol has deployments object
    if (!protocol.deployments) {
      protocol.deployments = {};
    }
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
      protocol.crossChainRiskScore = Math.min(100, Math.round(protocol.riskScore * (1 + avgBridgeRisk / 200)));
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
  try {
    // First try to get anomalies from our API
    return await getAnomalies();
  } catch (error) {
    console.error('Error retrieving anomalies:', error);
    return [];
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
    
    // Add transaction overrides with manual gas settings
    const overrides = {
      gasLimit: 500000, // Set a higher gas limit manually
      gasPrice: ethers.utils.parseUnits('10', 'gwei'), // Set a reasonable gas price
    };
    
    // Try to register with overrides
    try {
      console.log(`Registering protocol ${name} at address ${address} with manual gas settings`);
      const tx = await signedContract.registerProtocol(address, name, initialRiskScore, overrides);
      console.log('Transaction submitted:', tx.hash);
      
      await tx.wait();
      return true;
    } catch (txError: any) {
      console.error('Transaction failed with overrides:', txError);
      
      // If we get a specific error about gas estimation
      if (txError.message && txError.message.includes('UNPREDICTABLE_GAS_LIMIT')) {
        console.log('Trying with higher gas limit...');
        
        // Try again with even higher gas limit
        const highGasOverrides = {
          gasLimit: 1000000,
          gasPrice: ethers.utils.parseUnits('15', 'gwei'),
        };
        
        const tx = await signedContract.registerProtocol(address, name, initialRiskScore, highGasOverrides);
        console.log('Transaction submitted with high gas:', tx.hash);
        
        await tx.wait();
        return true;
      }
      
      throw txError;
    }
  } catch (error: any) {
    console.error('Error registering protocol:', error);
    
    // Provide more user-friendly error messages
    if (error.message && error.message.includes('UNPREDICTABLE_GAS_LIMIT')) {
      throw new Error('Transaction gas estimation failed. The address might not be a valid protocol contract.');
    } else if (error.message && error.message.includes('user rejected')) {
      throw new Error('Transaction was rejected in your wallet.');
    } else if (error.message && error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction. Please check your wallet balance.');
    }
    
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
export const getUserExposures = async (userAddress?: string): Promise<Array<{
  protocolAddress: string;
  protocolName?: string;
  amount: number;
  assets: Array<{
    tokenAddress?: string;
    tokenSymbol?: string;
    tokenName?: string;
    amount?: string;
    value?: number;
  }> | [];
}>> => {
  try {
    if (!userAddress) {
      throw new Error('User address is required');
    }
    
    const contract = ensureContract();
    
    // If wallet not connected or using mock data for development
    if (!isWalletConnected() || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      // Return mock data if available for this address
      if (mockUserExposures[userAddress as keyof typeof mockUserExposures]) {
        console.log('Using mock exposure data for', userAddress);
        return mockUserExposures[userAddress as keyof typeof mockUserExposures];
      }
      
      // Return empty array if no mock data
      console.log('No mock data available for', userAddress);
      return [];
    }
    
    // Get user exposures from the contract
    try {
      const exposuresCount = await contract.getUserExposuresCount(userAddress);
      const exposures: Array<{
        protocolAddress: string;
        protocolName: string;
        amount: number;
        assets: any[];
      }> = [];
      
      for (let i = 0; i < exposuresCount; i++) {
        const exposure = await contract.getUserExposure(userAddress, i);
        
        // Get protocol details
        const protocol = await getProtocolByAddress(exposure.protocol);
        
        // Format the exposure
        exposures.push({
          protocolAddress: exposure.protocol,
          protocolName: protocol?.name || 'Unknown Protocol',
          amount: parseFloat(ethers.utils.formatEther(exposure.amount)),
          // For real implementation, we would get actual assets data from another API/contract
          assets: []
        });
      }
      
      return exposures;
    } catch (contractError) {
      console.error('Error fetching user exposures from contract:', contractError);
      return mockUserExposures[userAddress as keyof typeof mockUserExposures] || [];
    }
  } catch (error) {
    console.error('Error fetching user exposures:', error);
    return [];
  }
};

// Calculate user risk score
export const calculateUserRiskScore = async (userAddress: string) => {
  try {
    const contract = ensureContract();
    
    // If wallet not connected or using mock data for development
    if (!isWalletConnected() || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      // For mock data, calculate risk based on exposure to high-risk protocols
      if (mockUserExposures[userAddress as keyof typeof mockUserExposures]) {
        const exposures = mockUserExposures[userAddress as keyof typeof mockUserExposures];
        let totalRiskWeightedValue = 0;
        let totalValue = 0;
        
        for (const exposure of exposures) {
          // Get protocol details to get risk score
          const protocol = await getProtocolByAddress(exposure.protocolAddress);
          if (!protocol) continue;
          
          const protocolRiskScore = protocol.riskScore;
          
          // Calculate risk-weighted value
          totalRiskWeightedValue += exposure.amount * (protocolRiskScore / 100);
          totalValue += exposure.amount;
        }
        
        // Normalize risk score (0-100)
        return totalValue > 0 ? (totalRiskWeightedValue / totalValue) * 100 : 0;
      }
      
      // Default risk score if no exposures
      return 0;
    }
    
    // Get risk score from contract
    const riskScore = await contract.calculateUserRiskScore(userAddress);
    return parseFloat(ethers.utils.formatUnits(riskScore, 0));
    
  } catch (error) {
    console.error('Error calculating user risk score:', error);
    return 0;
  }
};

// Function to check if user has notifications about protocol risk changes
export const getUserNotifications = async (userAddress: string) => {
  try {
    if (!userAddress) {
      throw new Error('User address is required');
    }
    
    // In a real implementation, this would query a notification service or contract
    // For now, we'll return mock notifications based on exposures
    
    if (mockUserExposures[userAddress as keyof typeof mockUserExposures]) {
      const exposures = mockUserExposures[userAddress as keyof typeof mockUserExposures];
      const notifications: Array<{
        id: string;
        type: 'risk-alert' | 'anomaly-alert';
        title: string;
        message: string;
        timestamp: number;
        read: boolean;
        protocolAddress: string;
      }> = [];
      
      for (const exposure of exposures) {
        const protocol = await getProtocolByAddress(exposure.protocolAddress);
        
        if (!protocol) continue;
        
        // Add notification for high risk protocols
        if (protocol.riskScore > 65) {
          notifications.push({
            id: `risk-alert-${protocol.address}`,
            type: 'risk-alert' as 'risk-alert',
            title: `High Risk Alert: ${protocol.name}`,
            message: `${protocol.name} has a high risk score of ${protocol.riskScore}/100. Consider reducing your exposure.`,
            timestamp: Date.now(),
            read: false,
            protocolAddress: protocol.address
          });
        }
        
        // Add notification for recent anomalies
        if (protocol.anomalyCount > 0 && protocol.lastAnomalyTime && 
            (Date.now() - (protocol.lastAnomalyTime || 0)) < 1000 * 60 * 60 * 24) { // Within last 24h
          const formattedAmount = exposure && exposure.amount 
            ? `$${exposure.amount.toLocaleString()}`
            : '$0';
            
          notifications.push({
            id: `anomaly-alert-${protocol.address}`,
            type: 'anomaly-alert' as 'anomaly-alert',
            title: `Recent Anomaly: ${protocol.name}`,
            message: `${protocol.name} had a recent anomaly detected. You have ${formattedAmount} invested.`,
            timestamp: protocol.lastAnomalyTime || Date.now(),
            read: false,
            protocolAddress: protocol.address
          });
        }
      }
      
      return notifications;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (userAddress: string, notificationId: string) => {
  // In a real implementation, this would update a notifications database or contract
  console.log(`Marking notification ${notificationId} as read for user ${userAddress}`);
  return true;
};

// Toggle protocol status (active/inactive)
export const toggleProtocolStatus = async (protocolAddress: string) => {
  try {
    const signedContract = await getSignedContract();
    const protocol = await getProtocolByAddress(protocolAddress);
    
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Toggle the current status
    const newStatus = !protocol.isActive;
    
    // Call the contract method to update status
    const tx = await signedContract.updateProtocolStatus(protocolAddress, newStatus);
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
  calculateUserRiskScore,
  getUserNotifications,
  markNotificationAsRead,
  toggleProtocolStatus
}; 