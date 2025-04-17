import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { verifyContractConnection, verifyWalletConnection } from '../utils/verifyContractConnection';

const Diagnostics: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [contractStatus, setContractStatus] = useState<any>(null);
  const [walletStatus, setWalletStatus] = useState<any>(null);
  
  useEffect(() => {
    async function checkConnections() {
      setLoading(true);
      
      try {
        // Check contract connection
        const contractResult = await verifyContractConnection();
        setContractStatus(contractResult);
        
        // Check wallet connection if connected via wagmi
        if (isConnected && address) {
          setWalletStatus({
            success: true,
            message: 'Successfully connected to wallet via wagmi',
            account: address
          });
        } else {
          // Try direct connection if not connected via wagmi
          const walletResult = await verifyWalletConnection();
          setWalletStatus(walletResult);
        }
      } catch (error) {
        console.error('Error in diagnostics:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkConnections();
  }, [isConnected, address]);
  
  const runDiagnostics = () => {
    setLoading(true);
    setContractStatus(null);
    setWalletStatus(null);
    setTimeout(async () => {
      try {
        const contractResult = await verifyContractConnection();
        setContractStatus(contractResult);
        
        if (isConnected && address) {
          setWalletStatus({
            success: true,
            message: 'Successfully connected to wallet via wagmi',
            account: address
          });
        } else {
          const walletResult = await verifyWalletConnection();
          setWalletStatus(walletResult);
        }
      } catch (error) {
        console.error('Error in diagnostics:', error);
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Running diagnostics...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
        <p className="text-gray-600">Check connectivity to the DeFiSentinel system</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Diagnostics Again
        </button>
      </div>
      
      {/* Contract Connection Status */}
      <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium">Contract Connection</h2>
        </div>
        <div className="p-4">
          {contractStatus ? (
            <div>
              <div className={`mb-2 text-${contractStatus.success ? 'green' : 'red'}-600 font-semibold`}>
                {contractStatus.success ? '✅ Connected' : '❌ Connection Failed'}
              </div>
              <div className="mb-4 text-gray-600">{contractStatus.message}</div>
              
              {contractStatus.details && (
                <div className="mt-4 border rounded p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold mb-2">Contract Details:</h3>
                  <div className="space-y-1 text-sm">
                    <div>Contract Address: {contractStatus.details.contractAddress}</div>
                    <div>Protocol Count: {contractStatus.details.protocolCount}</div>
                    <div>Anomaly Count: {contractStatus.details.anomalyCount}</div>
                    <div>Owner: {contractStatus.details.owner}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No contract diagnostic data available</div>
          )}
        </div>
      </div>
      
      {/* Wallet Connection Status */}
      <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium">Wallet Connection</h2>
        </div>
        <div className="p-4">
          {walletStatus ? (
            <div>
              <div className={`mb-2 text-${walletStatus.success ? 'green' : 'red'}-600 font-semibold`}>
                {walletStatus.success ? '✅ Connected' : '❌ Connection Failed'}
              </div>
              <div className="mb-4 text-gray-600">{walletStatus.message}</div>
              
              {walletStatus.account && (
                <div className="mt-4 border rounded p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold mb-2">Wallet Details:</h3>
                  <div className="space-y-1 text-sm">
                    <div>Connected Account: {walletStatus.account}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No wallet diagnostic data available</div>
          )}
        </div>
      </div>
      
      {/* Environment Information */}
      <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium">Environment Information</h2>
        </div>
        <div className="p-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">RPC URL: </span>
              {process.env.REACT_APP_RPC_URL || 'https://sepolia.base.org'}
            </div>
            <div>
              <span className="font-semibold">Chain ID: </span>
              {process.env.REACT_APP_CHAIN_ID || '84532'}
            </div>
            <div>
              <span className="font-semibold">Network: </span>
              {process.env.REACT_APP_CHAIN_NAME || 'Base Sepolia'}
            </div>
            <div>
              <span className="font-semibold">Contract Address: </span>
              {process.env.REACT_APP_DEFI_SENTINEL_ADDRESS || '0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6'}
            </div>
            <div>
              <span className="font-semibold">Browser: </span>
              {navigator.userAgent}
            </div>
          </div>
        </div>
      </div>
      
      {/* Troubleshooting Tips */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium">Troubleshooting Tips</h2>
        </div>
        <div className="p-4">
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>Make sure your wallet is connected to the Base Sepolia Testnet (Chain ID: 84532)</li>
            <li>Ensure you have sufficient ETH in your wallet for gas fees</li>
            <li>Clear your browser cache if you're experiencing persistent issues</li>
            <li>Check that your wallet extension is up to date</li>
            <li>If using MetaMask, try resetting your account (Settings → Advanced → Reset Account)</li>
            <li>Verify that the environment variables are correctly set up (check .env file)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics; 