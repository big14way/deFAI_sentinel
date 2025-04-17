import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import RegisterProtocolForm from '../../components/protocols/RegisterProtocolForm';
import MonitorProtocolForm from '../../components/protocols/MonitorProtocolForm';

const ManageProtocols: React.FC = () => {
  const { isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Increment refresh key to trigger a refresh of the protocol list
    setRefreshKey(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Please connect your wallet to manage DeFi protocols through the DeFi Sentinel platform.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Protocols</h1>
        <p className="text-gray-600">Register new protocols or update the monitoring status of existing ones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RegisterProtocolForm onSuccess={handleSuccess} />
        <MonitorProtocolForm onSuccess={handleSuccess} />
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Registering a protocol requires a transaction and gas fees</li>
                <li>Only registered protocols can be monitored</li>
                <li>Changing monitoring status also requires a transaction</li>
                <li>Risk scores are calculated based on on-chain and off-chain data</li>
                <li>You can view all monitored protocols in the Protocols page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProtocols; 