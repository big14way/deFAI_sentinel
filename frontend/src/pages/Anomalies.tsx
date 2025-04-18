import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { generateMockAnomalyData, AnomalyPrediction } from '../services/mlService';
import { getAllProtocols } from '../services/web3';

const Anomalies: React.FC = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<AnomalyPrediction[]>([]);
  const [protocols, setProtocols] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Load anomalies and protocols when wallet is connected
  useEffect(() => {
    async function loadData() {
      if (!isConnected) return;
      
      try {
        setLoading(true);
        setError(null);
        setConnectionError(null);
        
        // Load protocols to get names
        const protocolsData = await getAllProtocols();
        const protocolsMap: Record<string, any> = {};
        protocolsData.forEach((p: any) => {
          protocolsMap[p.address.toLowerCase()] = p;
        });
        setProtocols(protocolsMap);
        
        // In a real app, you would fetch anomalies from your API or blockchain using getAllAnomalies()
        // Here we're using mock data for demo purposes
        const mockAnomalies = generateMockAnomalyData(20);
        setAnomalies(mockAnomalies);
      } catch (err: any) {
        console.error('Error loading data:', err);
        
        // Check for wallet connection errors
        if (err.message && err.message.includes('WebSocket connection failed')) {
          setConnectionError('Wallet connection issue detected. Please reconnect your wallet.');
        } else {
          setError('Failed to load anomaly data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isConnected]);

  // Handle wallet connection issues
  const handleReconnect = () => {
    window.location.reload();
  };

  // Filter anomalies based on selected filters
  const filteredAnomalies = anomalies.filter(anomaly => {
    // Apply severity filter
    if (severityFilter !== 'all') {
      const score = anomaly.score;
      if (severityFilter === 'high' && score < 0.7) return false;
      if (severityFilter === 'medium' && (score < 0.3 || score >= 0.7)) return false;
      if (severityFilter === 'low' && score >= 0.3) return false;
    }
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const anomalyTime = anomaly.timestamp;
      const hoursAgo = (now - anomalyTime) / (1000 * 60 * 60);
      
      if (timeFilter === '24h' && hoursAgo > 24) return false;
      if (timeFilter === '7d' && hoursAgo > 24 * 7) return false;
      if (timeFilter === '30d' && hoursAgo > 24 * 30) return false;
    }
    
    return true;
  });

  // Helper functions
  const getSeverityClass = (score: number) => {
    if (score < 0.3) return 'bg-green-100 text-green-800';
    if (score < 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getSeverityLabel = (score: number) => {
    if (score < 0.3) return 'Low';
    if (score < 0.7) return 'Medium';
    return 'High';
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getProtocolName = (address: string) => {
    const normalizedAddress = address.toLowerCase();
    return protocols[normalizedAddress]?.name || 'Unknown Protocol';
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
          Please connect your wallet to view anomaly data.
        </p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Wallet Connection Issue</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {connectionError}
        </p>
        <button
          onClick={handleReconnect}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading anomalies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="text-red-500 mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Anomaly Detection</h1>
        <p className="text-gray-600">
          View detected anomalies across monitored protocols
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Period
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        
        <div className="ml-auto self-end">
          <span className="text-sm text-gray-500">
            {filteredAnomalies.length} anomalies found
          </span>
        </div>
      </div>

      {/* Anomalies List */}
      {filteredAnomalies.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-600">No anomalies found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div key={anomaly.transactionHash} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-blue-600">
                      {getProtocolName(anomaly.transactionHash)}
                    </h3>
                    <p className="text-sm text-gray-500 truncate w-64">{anomaly.transactionHash}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityClass(anomaly.score)}`}>
                      {getSeverityLabel(anomaly.score)} Severity ({(anomaly.score * 100).toFixed(0)}%)
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {formatDate(anomaly.timestamp)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Detected Anomalies:
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {anomaly.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => window.open(`https://sepolia.basescan.org/tx/${anomaly.transactionHash}`, '_blank')}
                    >
                      View Transaction
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Mark as Reviewed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Anomalies; 