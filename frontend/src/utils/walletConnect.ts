import { ethers } from 'ethers';

/**
 * Checks if wallet is connected
 */
export const checkWalletConnection = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      return false;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return Array.isArray(accounts) && accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

/**
 * Attempts to disconnect wallet
 */
export const disconnectWallet = async (): Promise<void> => {
  try {
    // There's no standard ethereum method to disconnect
    // Just clear local storage for wagmi
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.wallet');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

/**
 * Attempts direct wallet connection using ethers
 */
export const directWalletConnection = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      return false;
    }
    
    // Request accounts to prompt connection
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (Array.isArray(accounts) && accounts.length > 0) {
      // Create ethers provider and confirm we can get the signer
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      return !!address;
    }
    
    return false;
  } catch (error) {
    console.error('Error in direct wallet connection:', error);
    return false;
  }
}; 