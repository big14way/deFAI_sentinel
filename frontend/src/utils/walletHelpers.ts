/**
 * Clears all wallet connection state from localStorage
 */
export const clearWalletConnectionState = (): void => {
  try {
    // Clear wagmi storage
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.wallet');
    
    // Clear our custom storage
    localStorage.removeItem('wallet_connection_history');
    localStorage.removeItem('last_wallet_connect_time');
    localStorage.removeItem('last_connected_address');
  } catch (error) {
    console.error('Error clearing wallet connection state:', error);
  }
};

/**
 * Gets the last connected wallet address
 */
export const getLastConnectedAddress = (): string | null => {
  try {
    return localStorage.getItem('last_connected_address');
  } catch (error) {
    console.error('Error getting last connected address:', error);
    return null;
  }
};

/**
 * Gets timestamp of last successful connection
 */
export const getLastConnectTime = (): number | null => {
  try {
    const time = localStorage.getItem('last_wallet_connect_time');
    return time ? parseInt(time, 10) : null;
  } catch (error) {
    console.error('Error getting last connect time:', error);
    return null;
  }
}; 