import React, { useEffect, useState } from 'react';
import { debugWallet } from '../utils/walletDebugger';

interface WalletTroubleshooterProps {
  onClose: () => void;
}

interface WalletDiagnostics {
  hasProvider: boolean;
  isConnected: boolean;
  isUnlocked: boolean;
  networkId: number | null;
  errorLogs: string[];
  connectionHistory: string[];
}

const WalletTroubleshooter: React.FC<WalletTroubleshooterProps> = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState<WalletDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const results = await debugWallet();
        setDiagnostics(results);
      } catch (error) {
        console.error('Failed to run wallet diagnostics:', error);
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Wallet Connection Troubleshooter</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : diagnostics ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-medium">Wallet Provider</p>
              <p className={diagnostics.hasProvider ? "text-green-600" : "text-red-600"}>
                {diagnostics.hasProvider ? "Detected ✓" : "Not Found ✗"}
              </p>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-medium">Connection Status</p>
              <p className={diagnostics.isConnected ? "text-green-600" : "text-red-600"}>
                {diagnostics.isConnected ? "Connected ✓" : "Disconnected ✗"}
              </p>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-medium">Wallet Status</p>
              <p className={diagnostics.isUnlocked ? "text-green-600" : "text-red-600"}>
                {diagnostics.isUnlocked ? "Unlocked ✓" : "Locked ✗"}
              </p>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="font-medium">Network ID</p>
              <p className={diagnostics.networkId ? "text-green-600" : "text-red-600"}>
                {diagnostics.networkId || "Unknown"}
              </p>
            </div>
          </div>
          
          {diagnostics.errorLogs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Error Logs</h3>
              <div className="bg-red-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                {diagnostics.errorLogs.map((log, index) => (
                  <p key={index} className="text-red-800 mb-1">{log}</p>
                ))}
              </div>
            </div>
          )}
          
          {diagnostics.connectionHistory.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Connection History</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                {diagnostics.connectionHistory.map((entry, index) => (
                  <p key={index} className="mb-1">{entry}</p>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Troubleshooting Tips</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Ensure you have MetaMask or another Web3 wallet installed</li>
              <li>Check that your wallet is unlocked</li>
              <li>Make sure you're connected to the correct network</li>
              <li>Try refreshing the page and reconnecting your wallet</li>
              <li>Clear your browser cache and try again</li>
              <li>Ensure your wallet has the latest update</li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-red-600">Failed to run diagnostics. Please try again.</p>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletTroubleshooter; 