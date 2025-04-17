import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols } from '../services/web3';
import { generateMockAnomalyData } from '../services/mlService';

const Dashboard: React.FC = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load protocols and anomalies when wallet is connected
  useEffect(() => {
    async function loadData() {
      if (!isConnected) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load protocols
        const protocolsData = await getAllProtocols();
        setProtocols(protocolsData);
        
        // In real app, fetch recent anomalies from API/blockchain
        // Using mock data for demo
        const mockAnomalies = generateMockAnomalyData(5);
        setRecentAnomalies(mockAnomalies);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isConnected]);

  // Helper functions
  const getRiskClass = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  const formatTVL = (tvl: number) => {
    if (!tvl) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(tvl);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Calculate dashboard stats
  const dashboardStats = {
    totalProtocols: protocols.length,
    activeProtocols: protocols.filter(p => p.isActive).length,
    highRiskProtocols: protocols.filter(p => p.riskScore >= 70).length,
    totalTVL: protocols.reduce((sum, p) => sum + (p.tvl || 0), 0),
    recentAnomalies: recentAnomalies.length,
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4">
          Please connect your wallet to view the dashboard and protocol data.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Protocol Dashboard</h1>
        <p className="text-gray-600">Monitor and manage DeFi protocols</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Protocols</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{dashboardStats.totalProtocols}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Protocols</h3>
          <p className="mt-1 text-3xl font-semibold text-green-600">{dashboardStats.activeProtocols}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">High Risk Protocols</h3>
          <p className="mt-1 text-3xl font-semibold text-red-600">{dashboardStats.highRiskProtocols}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Value Locked</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{formatTVL(dashboardStats.totalTVL)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Recent Anomalies</h3>
          <p className="mt-1 text-3xl font-semibold text-orange-500">{dashboardStats.recentAnomalies}</p>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Protocol Risk Overview</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="h-60 flex items-center justify-center">
              {protocols.length === 0 ? (
                <p className="text-gray-500">No protocol data available</p>
              ) : (
                <div className="w-full flex items-center justify-center space-x-4">
                  {/* Risk score distribution */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Distribution</h3>
                    <div className="flex items-end h-40 space-x-4">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-16 bg-green-400 rounded-t-md" 
                          style={{ 
                            height: `${Math.max(5, (protocols.filter(p => p.riskScore < 30).length / protocols.length) * 160)}px` 
                          }}
                        ></div>
                        <p className="text-xs mt-1">Low Risk</p>
                        <p className="text-xs font-semibold">{protocols.filter(p => p.riskScore < 30).length}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-16 bg-yellow-400 rounded-t-md" 
                          style={{ 
                            height: `${Math.max(5, (protocols.filter(p => p.riskScore >= 30 && p.riskScore < 70).length / protocols.length) * 160)}px` 
                          }}
                        ></div>
                        <p className="text-xs mt-1">Medium Risk</p>
                        <p className="text-xs font-semibold">{protocols.filter(p => p.riskScore >= 30 && p.riskScore < 70).length}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-16 bg-red-400 rounded-t-md" 
                          style={{ 
                            height: `${Math.max(5, (protocols.filter(p => p.riskScore >= 70).length / protocols.length) * 160)}px` 
                          }}
                        ></div>
                        <p className="text-xs mt-1">High Risk</p>
                        <p className="text-xs font-semibold">{protocols.filter(p => p.riskScore >= 70).length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status distribution */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Protocol Status</h3>
                    <div className="h-40 w-40 relative rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className="absolute bg-green-400" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.cos(Math.PI * 2 * dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% ${50 - 50 * Math.sin(Math.PI * 2 * dashboardStats.activeProtocols / dashboardStats.totalProtocols)}%, 50% 50%)` 
                        }}
                      ></div>
                      <div 
                        className="absolute bg-gray-300" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% ${50 - 50 * Math.sin(Math.PI * 2 * dashboardStats.activeProtocols / dashboardStats.totalProtocols)}%, 100% 0%, 0% 0%, 50% 50%)` 
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-semibold">Active</div>
                          <div className="text-xl font-bold">{Math.round(dashboardStats.activeProtocols / dashboardStats.totalProtocols * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout for protocols and recent anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Protocols - Takes 3/5 of the space */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Highest Risk Protocols</h2>
            <Link to="/protocols" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Protocols →
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {protocols.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No protocols found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {protocols
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 5)
                  .map((protocol) => (
                    <li key={protocol.address}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-blue-600">{protocol.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{protocol.address}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center">
                              <span 
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskClass(protocol.riskScore)}`}
                              >
                                {getRiskLabel(protocol.riskScore)} Risk ({protocol.riskScore}%)
                              </span>
                              <span 
                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full
                                  ${protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {protocol.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              TVL: {formatTVL(protocol.tvl)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <div>Last Updated: {formatDate(protocol.lastUpdateTime)}</div>
                            <div>Anomalies: {protocol.anomalyCount}</div>
                          </div>
                          {/* Risk Score Progress Bar */}
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                protocol.riskScore < 30 ? 'bg-green-500' : 
                                protocol.riskScore < 70 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${protocol.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Anomalies - Takes 2/5 of the space */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Anomalies</h2>
            <Link to="/anomalies" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Anomalies →
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {recentAnomalies.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No recent anomalies detected.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentAnomalies.map((anomaly) => (
                  <li key={anomaly.transactionHash}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex justify-between items-start">
                        <div className="truncate">
                          <h3 className="text-sm font-medium text-gray-700">Transaction</h3>
                          <p className="text-xs text-gray-500 truncate w-32">{anomaly.transactionHash}</p>
                        </div>
                        <div className="text-right">
                          <span 
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskClass(anomaly.score * 100)}`}
                          >
                            Score: {(anomaly.score * 100).toFixed(0)}%
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {anomaly.features[0]}
                        </p>
                        <button 
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => window.open(`https://sepolia.basescan.org/tx/${anomaly.transactionHash}`, '_blank')}
                        >
                          View Transaction →
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 