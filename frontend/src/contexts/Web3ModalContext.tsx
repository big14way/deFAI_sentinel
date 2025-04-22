import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { checkWalletConnection, disconnectWallet, directWalletConnection } from '../utils/walletConnect';
import { clearWalletConnectionState } from '../utils/walletHelpers';
import { diagnoseWalletConnection, fixWalletConnection, recordConnectionAttempt } from '../utils/walletDebugger';

interface Web3ModalContextType {
  isWalletConnected: boolean;
  isConnecting: boolean;
  hasConnectionError: boolean;
  connectionError: string | null;
  retryConnection: () => void;
  disconnect: () => Promise<void>;
  tryDirectConnect: () => Promise<void>;
  runDiagnostics: () => Promise<any>;
  clearConnectionState: () => void;
}

const defaultContext: Web3ModalContextType = {
  isWalletConnected: false,
  isConnecting: false,
  hasConnectionError: false,
  connectionError: null,
  retryConnection: () => {},
  disconnect: async () => {},
  tryDirectConnect: async () => {},
  runDiagnostics: async () => ({}),
  clearConnectionState: () => {},
};

const Web3ModalContext = createContext<Web3ModalContextType>(defaultContext);

export const useWeb3Modal = () => useContext(Web3ModalContext);

interface Web3ModalProviderProps {
  children: ReactNode;
}

export const Web3ModalProvider: React.FC<Web3ModalProviderProps> = ({ children }) => {
  const { isConnected, address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Update wallet connection status from wagmi
  useEffect(() => {
    setIsWalletConnected(isConnected);
    if (isConnected) {
      setHasConnectionError(false);
      setConnectionError(null);
      // Record successful connection
      localStorage.setItem('last_wallet_connect_time', Date.now().toString());
      localStorage.setItem('last_connected_address', address || '');
    }
  }, [isConnected, address]);

  // Check wallet connection status on mount and window focus
  const checkConnection = async () => {
    try {
      setIsConnecting(true);
      
      // For multiple failed connection attempts, attempt to fix automatically
      if (connectionAttempts >= 2) {
        await fixWalletConnection();
      }
      
      const connected = await checkWalletConnection();
      setIsWalletConnected(connected || isConnected);
      
      if (connected || isConnected) {
        setHasConnectionError(false);
        setConnectionError(null);
        setConnectionAttempts(0);
      } else {
        // Try direct provider connection as a backup
        const directConnected = await directWalletConnection();
        if (directConnected) {
          setIsWalletConnected(true);
          setHasConnectionError(false);
          setConnectionError(null);
          setConnectionAttempts(0);
          return;
        }
        
        // If still not connected, increment attempt counter
        setConnectionAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setHasConnectionError(true);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
      setConnectionAttempts(prev => prev + 1);
    } finally {
      setIsConnecting(false);
    }
  };

  // Direct connection with multiple fallbacks
  const tryDirectConnect = async () => {
    try {
      setIsConnecting(true);
      setHasConnectionError(false);
      setConnectionError(null);
      
      // Record connection attempt for diagnostics
      recordConnectionAttempt('direct_connect');

      // First try MetaMask connector if available
      if (window.ethereum?.isMetaMask) {
        try {
          const metaMaskConnector = new MetaMaskConnector();
          const result = await connectAsync({ connector: metaMaskConnector });
          if (result) {
            setIsWalletConnected(true);
            localStorage.setItem('last_wallet_connect_time', Date.now().toString());
            return;
          }
        } catch (metaMaskError) {
          console.log('MetaMask connection failed, trying injected wallet', metaMaskError);
        }
      }

      // Then try generic injected connector
      try {
        const injectedConnector = new InjectedConnector();
        const result = await connectAsync({ connector: injectedConnector });
        if (result) {
          setIsWalletConnected(true);
          localStorage.setItem('last_wallet_connect_time', Date.now().toString());
          return;
        }
      } catch (injectedError) {
        console.error('Injected connector failed', injectedError);
      }
      
      // Try each available connector as a last resort
      for (const connector of connectors) {
        if (connector.ready && connector.id !== 'metaMask' && connector.id !== 'injected') {
          try {
            const result = await connectAsync({ connector });
            if (result) {
              setIsWalletConnected(true);
              localStorage.setItem('last_wallet_connect_time', Date.now().toString());
              return;
            }
          } catch (error) {
            console.log(`Connector ${connector.id} failed:`, error);
          }
        }
      }
      
      // If all else fails, try direct ethereum provider connection
      const directConnected = await directWalletConnection();
      if (directConnected) {
        setIsWalletConnected(true);
        localStorage.setItem('last_wallet_connect_time', Date.now().toString());
        return;
      }
      
      throw new Error('Failed to connect with any available wallet method');
    } catch (error) {
      console.error('Error in direct wallet connection:', error);
      setHasConnectionError(true);
      setConnectionError(error instanceof Error ? error.message : 'Direct wallet connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  // Run diagnostics
  const runDiagnostics = async () => {
    return await diagnoseWalletConnection();
  };
  
  // Clear connection state
  const clearConnectionState = () => {
    clearWalletConnectionState();
    setConnectionAttempts(0);
    setHasConnectionError(false);
    setConnectionError(null);
  };

  // Handle window focus to refresh connection state
  useEffect(() => {
    const handleFocus = () => {
      checkConnection();
    };

    window.addEventListener('focus', handleFocus);
    
    // Initial check
    checkConnection();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Retry wallet connection
  const retryConnection = () => {
    setHasConnectionError(false);
    setConnectionError(null);
    checkConnection();
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Error in wagmi disconnect:', error);
    }
    
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Error in manual disconnect:', error);
    }
    
    // Clear connection state for clean reconnection
    clearWalletConnectionState();
    
    setIsWalletConnected(false);
    setHasConnectionError(false);
    setConnectionError(null);
    setConnectionAttempts(0);
  };

  return (
    <Web3ModalContext.Provider
      value={{
        isWalletConnected,
        isConnecting,
        hasConnectionError,
        connectionError,
        retryConnection,
        disconnect,
        tryDirectConnect,
        runDiagnostics,
        clearConnectionState,
      }}
    >
      {children}
    </Web3ModalContext.Provider>
  );
}; 