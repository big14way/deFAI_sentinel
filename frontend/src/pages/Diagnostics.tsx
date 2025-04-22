import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols } from '../services/web3';

const Diagnostics: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [contractStatus, setContractStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const [protocols, setProtocols] = useState<any[]>([]);
  const [environment, setEnvironment] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiagnostics() {
      try {
        setLoading(true);
        setError(null);

        // Check environment variables
        const env = {
          'Node Environment': process.env.NODE_ENV || 'unknown',
          'API URL': process.env.REACT_APP_API_URL || 'not set',
          'Chain ID': process.env.REACT_APP_CHAIN_ID || 'not set',
          'Browser': navigator.userAgent,
        };
        setEnvironment(env);

        // Check contract connection by attempting to load protocols
        try {
          const protocolsData = await getAllProtocols();
          if (Array.isArray(protocolsData)) {
            setProtocols(protocolsData);
            setContractStatus('connected');
          } else {
            setContractStatus('disconnected');
          }
        } catch (err) {
          console.error('Error connecting to contracts:', err);
          setContractStatus('disconnected');
          setError('Failed to connect to contracts. Check your network connection and contract addresses.');
        }
      } catch (err) {
        console.error('Diagnostics error:', err);
        setError('An error occurred while running diagnostics.');
      } finally {
        setLoading(false);
      }
    }

    loadDiagnostics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="md" />
          <span className="ml-4 text-gray-600">Running diagnostics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Contract Connection</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${
                  contractStatus === 'connected' ? 'bg-green-500' : 
                  contractStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span>
                  {contractStatus === 'connected' ? 'Connected to contracts' : 
                   contractStatus === 'disconnected' ? 'Disconnected from contracts' : 'Unknown contract status'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Wallet Connection</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Wallet connected' : 'Wallet disconnected'}</span>
              </div>
              {isConnected && address && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Address: {address}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Registered Protocols</h2>
            </div>
            <div className="p-4">
              {protocols.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {protocols.map((protocol, index) => (
                    <div key={protocol.id || index} className="py-2">
                      <h3 className="font-medium">{protocol.name}</h3>
                      <p className="text-sm text-gray-600">{protocol.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No protocols registered</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Environment Information</h2>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(environment).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-2 py-3 text-sm font-medium text-gray-900">{key}</td>
                      <td className="px-2 py-3 text-sm text-gray-500">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics; 