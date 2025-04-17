import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols, getAllAnomalies } from '../services/web3';
import axios from 'axios';
import AlertFeed from '../components/alerts/AlertFeed';
import { Alert, AlertSeverity, AlertCategory, AlertStatus } from '../types';

const Dashboard: React.FC = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
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
        
        // Try to fetch real anomalies from the blockchain or API
        try {
          // First try the blockchain
          const anomaliesData = await getAllAnomalies();
          setRecentAnomalies(anomaliesData);
        } catch (anomalyError) {
          // If blockchain fails, try the API
          try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const response = await axios.get(`${apiUrl}/api/analytics/alert-trends`);
            if (response.data && Array.isArray(response.data)) {
              setRecentAnomalies(response.data);
            }
          } catch (apiError) {
            console.warn('API error fetching anomalies, using empty array:', apiError);
            setRecentAnomalies([]);
          }
        }
        
        // Fetch recent alerts
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
          const response = await axios.get(`${apiUrl}/api/alerts/recent`);
          if (response.data && Array.isArray(response.data)) {
            setRecentAlerts(response.data);
          } else {
            // Create some mock alerts from protocols if no real alerts
            const mockAlerts: Alert[] = protocolsData
              .filter(p => p.riskScore > 50)
              .slice(0, 3)
              .map((p, index) => ({
                id: `mock-${index}`,
                timestamp: Date.now() - 1000 * 60 * (index + 1) * 10,
                protocol: p,
                title: `High Risk Score on ${p.name}`,
                message: `${p.name} has a risk score of ${p.riskScore}, which indicates potential vulnerability.`,
                severity: p.riskScore > 70 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
                category: AlertCategory.RISK_SCORE_CHANGE,
                status: AlertStatus.NEW
              }));
            setRecentAlerts(mockAlerts);
          }
        } catch (alertsError) {
          console.warn('Error fetching alerts:', alertsError);
          setRecentAlerts([]);
        }
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
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Please connect your wallet to access the DeFi Sentinel dashboard and monitor protocol security in real-time.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
        <h1 className="text-2xl font-bold text-gray-800">DeFi Security Dashboard</h1>
        <p className="text-gray-600">Real-time monitoring and risk analysis for DeFi protocols</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Protocols</h3>
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{dashboardStats.totalProtocols}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Protocols</h3>
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-3xl font-semibold text-green-600">{dashboardStats.activeProtocols}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">High Risk Protocols</h3>
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-3xl font-semibold text-red-600">{dashboardStats.highRiskProtocols}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Value Locked</h3>
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{formatTVL(dashboardStats.totalTVL)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Recent Anomalies</h3>
            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-3xl font-semibold text-amber-600">{dashboardStats.recentAnomalies}</p>
        </div>
      </div>

      {/* Protocol Management Button */}
      <div className="mb-8">
        <Link 
          to="/protocols/manage"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Register or Monitor Protocols
        </Link>
        <p className="mt-2 text-sm text-gray-600">
          Register new DeFi protocols or update monitoring status for existing ones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Overview */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Risk Overview</h2>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="h-60 flex items-center justify-center">
                {protocols.length === 0 ? (
                  <p className="text-gray-500">No protocol data available</p>
                ) : (
                  <div className="w-full flex items-center justify-center space-x-8">
                    {/* Risk score distribution */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h3>
                      <div className="flex items-end h-40 space-x-6">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 bg-gradient-to-t from-green-400 to-green-300 rounded-t-md" 
                            style={{ 
                              height: `${Math.max(5, (protocols.filter(p => p.riskScore < 30).length / protocols.length) * 160)}px` 
                            }}
                          ></div>
                          <p className="text-xs mt-2 font-medium text-gray-700">Low Risk</p>
                          <p className="text-sm font-semibold">{protocols.filter(p => p.riskScore < 30).length}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-md" 
                            style={{ 
                              height: `${Math.max(5, (protocols.filter(p => p.riskScore >= 30 && p.riskScore < 70).length / protocols.length) * 160)}px` 
                            }}
                          ></div>
                          <p className="text-xs mt-2 font-medium text-gray-700">Medium Risk</p>
                          <p className="text-sm font-semibold">{protocols.filter(p => p.riskScore >= 30 && p.riskScore < 70).length}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 bg-gradient-to-t from-red-500 to-red-400 rounded-t-md" 
                            style={{ 
                              height: `${Math.max(5, (protocols.filter(p => p.riskScore >= 70).length / protocols.length) * 160)}px` 
                            }}
                          ></div>
                          <p className="text-xs mt-2 font-medium text-gray-700">High Risk</p>
                          <p className="text-sm font-semibold">{protocols.filter(p => p.riskScore >= 70).length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status distribution */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Protocol Status</h3>
                      <div className="h-40 w-40 relative rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                        <div 
                          className="absolute bg-green-400" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * (dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 0%, ${50 - 50 * (dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% 0%, 50% 0%, 50% 50%)` 
                          }}
                        ></div>
                        <div 
                          className="absolute bg-red-400" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 - 50 * (dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 50%, ${50 + 50 * (dashboardStats.activeProtocols / dashboardStats.totalProtocols)}% 0%, 50% 0%, 50% 50%)` 
                          }}
                        ></div>
                        <div className="z-10 text-center">
                          <p className="text-sm font-bold text-white">{Math.round((dashboardStats.activeProtocols / dashboardStats.totalProtocols) * 100)}%</p>
                          <p className="text-xs text-white">Active</p>
                        </div>
                      </div>
                      <div className="flex mt-4 space-x-4 text-xs">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-400 rounded-full mr-1"></span>
                          <span>Active</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-400 rounded-full mr-1"></span>
                          <span>Inactive</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Link 
                to="/protocols" 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-end"
              >
                View All Protocols
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Alerts</h2>
            <Link 
              to="/alerts" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No alerts to display
              </div>
            ) : (
              <AlertFeed 
                alerts={recentAlerts}
                maxItems={5}
                showProtocolName={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* High Risk Protocols */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">High Risk Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {protocols
            .filter(protocol => protocol.riskScore >= 70)
            .slice(0, 4)
            .map(protocol => (
              <div 
                key={protocol.address} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
                onClick={() => navigate(`/protocols/${protocol.address}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{protocol.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskClass(protocol.riskScore)}`}>
                    {getRiskLabel(protocol.riskScore)} Risk
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{protocol.address}</p>
                
                <div className="flex justify-between text-sm mb-3">
                  <div>
                    <p className="text-gray-500">TVL</p>
                    <p className="font-medium">{formatTVL(protocol.tvl)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Anomalies</p>
                    <p className="font-medium">{protocol.anomalyCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className="font-medium">{protocol.riskScore}/100</p>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Last updated: {formatDate(protocol.lastUpdateTime)}
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
            
          {protocols.filter(p => p.riskScore >= 70).length === 0 && (
            <div className="col-span-4 p-8 text-center bg-white rounded-xl shadow-md">
              <p className="text-gray-500">No high risk protocols detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 