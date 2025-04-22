import React, { useState } from 'react';
import { useWeb3Modal } from '../contexts/Web3ModalContext';

interface DirectWalletConnectProps {
  className?: string;
}

const DirectWalletConnect: React.FC<DirectWalletConnectProps> = ({ className = '' }) => {
  const { tryDirectConnect, isConnecting, hasConnectionError, connectionError } = useWeb3Modal();
  const [showError, setShowError] = useState(false);

  const handleConnect = async () => {
    setShowError(false);
    try {
      await tryDirectConnect();
    } catch (error) {
      setShowError(true);
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
      </button>
      
      {showError && hasConnectionError && (
        <div className="text-red-500 text-sm mt-2">
          {connectionError || 'Failed to connect wallet'}
        </div>
      )}
      
      <p className="text-sm text-gray-600 mt-4 text-center">
        Having trouble connecting your wallet? Try this direct connection option.
      </p>
    </div>
  );
};

export default DirectWalletConnect; 