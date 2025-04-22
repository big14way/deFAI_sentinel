import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {method: string; params?: any[]}) => Promise<any>;
    };
  }
}

/**
 * Diagnoses wallet connection issues and returns details about the problem
 */
export const diagnoseWalletConnection = async (): Promise<{
  hasMetaMask: boolean;
  isUnlocked: boolean;
  hasAccounts: boolean;
  networkId: number | null;
  connectionHistory: any[];
  errorLogs: string[];
}> => {
  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
  let isUnlocked = false;
  let hasAccounts = false;
  let networkId: number | null = null;
  const errorLogs: string[] = [];
  
  try {
    // Check if wallet is unlocked
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        hasAccounts = Array.isArray(accounts) && accounts.length > 0;
        isUnlocked = hasAccounts;
      } catch (error) {
        errorLogs.push(`Error checking accounts: ${error}`);
      }
      
      // Check network
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        networkId = parseInt(chainId as string, 16);
      } catch (error) {
        errorLogs.push(`Error checking network: ${error}`);
      }
    }
  } catch (error) {
    errorLogs.push(`General diagnostic error: ${error}`);
  }
  
  // Get connection history from localStorage
  const connectionHistory = getConnectionHistory();
  
  return {
    hasMetaMask,
    isUnlocked,
    hasAccounts,
    networkId,
    connectionHistory,
    errorLogs
  };
};

/**
 * Debug the wallet and return diagnostics information
 */
export const debugWallet = async (): Promise<{
  hasProvider: boolean;
  isConnected: boolean;
  isUnlocked: boolean;
  networkId: number | null;
  errorLogs: string[];
  connectionHistory: string[];
}> => {
  const diagnostics = await diagnoseWalletConnection();
  
  // Format connection history as strings for display
  const formattedHistory = diagnostics.connectionHistory.map(entry => {
    return `${new Date(entry.timestamp).toLocaleString()}: ${entry.method} - ${entry.successful ? 'Success' : 'Failed'}`;
  });
  
  return {
    hasProvider: diagnostics.hasMetaMask,
    isConnected: diagnostics.hasAccounts,
    isUnlocked: diagnostics.isUnlocked,
    networkId: diagnostics.networkId,
    errorLogs: diagnostics.errorLogs,
    connectionHistory: formattedHistory
  };
};

/**
 * Attempts to fix common wallet connection issues
 */
export const fixWalletConnection = async (): Promise<boolean> => {
  if (!window.ethereum) {
    return false;
  }
  
  try {
    // Clear any cached state
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.wallet');
    
    // Request accounts to trigger MetaMask popup
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return true;
  } catch (error) {
    console.error('Error fixing wallet connection:', error);
    return false;
  }
};

/**
 * Records a connection attempt for diagnostic purposes
 */
export const recordConnectionAttempt = (method: string): void => {
  try {
    const history = getConnectionHistory();
    
    history.push({
      timestamp: Date.now(),
      method,
      successful: false, // Will be updated to true on successful connection
    });
    
    // Keep only the last 10 attempts
    if (history.length > 10) {
      history.shift();
    }
    
    localStorage.setItem('wallet_connection_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error recording connection attempt:', error);
  }
};

/**
 * Gets the connection history from localStorage
 */
const getConnectionHistory = (): any[] => {
  try {
    const history = localStorage.getItem('wallet_connection_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting connection history:', error);
    return [];
  }
}; 