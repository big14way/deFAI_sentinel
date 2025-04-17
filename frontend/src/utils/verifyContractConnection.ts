import { ethers } from 'ethers';
import DeFiSentinelABI from '../abi/DeFiSentinel.json';

const DEFI_SENTINEL_ADDRESS = process.env.REACT_APP_DEFI_SENTINEL_ADDRESS || '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6';
const RPC_URL = process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org';

/**
 * Utility to verify connection to the DeFiSentinel contract
 * This can be used to check contract connectivity before operations
 */
export const verifyContractConnection = async (): Promise<{ 
  success: boolean; 
  message: string; 
  details?: any;
}> => {
  try {
    // Initialize provider and contract
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(DEFI_SENTINEL_ADDRESS, DeFiSentinelABI, provider);
    
    // Attempt to call read functions to verify connection
    const protocols = await contract.getAllProtocols();
    const anomalyCount = await contract.getAnomalyCount();
    const owner = await contract.owner();
    
    return {
      success: true,
      message: 'Successfully connected to DeFiSentinel contract',
      details: {
        contractAddress: DEFI_SENTINEL_ADDRESS,
        protocolCount: protocols.length,
        anomalyCount: anomalyCount.toString(),
        owner
      }
    };
  } catch (error) {
    console.error('Error verifying contract connection:', error);
    return {
      success: false,
      message: `Failed to connect to DeFiSentinel contract: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Attempts to verify wallet connectivity and permission to interact with the contract
 */
export const verifyWalletConnection = async (): Promise<{
  success: boolean;
  message: string;
  account?: string;
}> => {
  try {
    if (!window.ethereum) {
      return {
        success: false,
        message: 'No Ethereum provider found. Please install a wallet like MetaMask.'
      };
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        message: 'No accounts found. Please unlock your wallet and try again.'
      };
    }
    
    // Success
    return {
      success: true,
      message: 'Successfully connected to wallet',
      account: accounts[0]
    };
  } catch (error) {
    console.error('Error verifying wallet connection:', error);
    return {
      success: false,
      message: `Failed to connect to wallet: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Expose the utility
export default {
  verifyContractConnection,
  verifyWalletConnection
}; 