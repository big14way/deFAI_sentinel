import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols, getAllAnomalies } from '../services/web3';
import axios from 'axios';
import AlertFeed from '../components/alerts/AlertFeed';
import { Alert, AlertSeverity, AlertCategory, AlertStatus } from '../types';
import DashboardStats from '../components/dashboard/DashboardStats';

const Dashboard: React.FC = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        if (!isMounted) return;
        
        console.log('Dashboard loading data, wallet connected:', isConnected);
        
        setLoading(true);
        setError(null);
        setConnectionError(null);
        
        // Load protocols
        try {
          console.log('Fetching protocols');
          const protocolsData = await getAllProtocols();
          
          if (isMounted) {
            // Filter out any obviously fake protocols
            const validProtocols = protocolsData.filter(
              p => p.address.length === 42 && !p.address.includes('123456789012345')
            );
            
            console.log('Protocols loaded:', validProtocols.length);
            setProtocols(validProtocols);
            
            // Generate mock alerts as soon as we have protocols
            if (validProtocols.length > 0) {
              const mockAlerts: Alert[] = validProtocols
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
          }
        } catch (protocolError: any) {
          console.error('Error loading protocols:', protocolError);
          
          // Check for wallet connection errors
          if (protocolError.message && protocolError.message.includes('WebSocket connection failed')) {
            setConnectionError('Wallet connection issue detected. Please reconnect your wallet.');
          }
        }
        
        // Load anomalies
        try {
          console.log('Fetching anomalies');
          const anomaliesData = await getAllAnomalies();
          
          if (isMounted) {
            console.log('Anomalies loaded:', anomaliesData.length);
            setRecentAnomalies(anomaliesData);
          }
        } catch (anomalyError) {
          console.warn('Error loading anomalies:', anomalyError);
          
          if (isMounted) {
            // Set an empty array for anomalies if load fails
            setRecentAnomalies([]);
          }
        }
      } catch (err) {
        console.error('Overall error loading dashboard data:', err);
        
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Dashboard data loading complete');
        }
      }
    }

    loadData();
    
    // Set up a refresh interval for real-time updates
    const intervalId = setInterval(() => {
      loadData();
    }, 60000); // Refresh every 60 seconds
    
    // Cleanup function
    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, [isConnected]); // Make the effect run when wallet connection changes

  // Calculate dashboard stats using useMemo
  const dashboardStats = useMemo(() => {
    console.log('Calculating dashboard stats, protocols:', protocols.length);
    return {
      totalProtocols: protocols.length,
      activeProtocols: protocols.filter(p => p.isActive).length,
      highRiskProtocols: protocols.filter(p => p.riskScore >= 70).length,
      totalTVL: protocols.reduce((sum, p) => sum + (p?.tvl || 0), 0),
      recentAnomalies: recentAnomalies.length,
    };
  }, [protocols, recentAnomalies]);

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

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Handle wallet connection issues
  const handleReconnect = () => {
    window.location.reload();
  };

  // Navigate to add protocol
  const handleAddProtocol = () => {
    navigate('/protocols/add');
  };

  // If not connected, show connection prompt
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
      <DashboardStats 
        totalProtocols={dashboardStats.totalProtocols}
        activeProtocols={dashboardStats.activeProtocols}
        highRiskProtocols={dashboardStats.highRiskProtocols}
        totalTVL={dashboardStats.totalTVL}
        recentAnomalies={dashboardStats.recentAnomalies}
      />

      {/* Protocol Management Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/protocols/manage"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Manage Protocols
        </Link>
        
        <button
          onClick={handleAddProtocol}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Protocol
        </button>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Protocol List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Monitored Protocols</h2>
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                Live Monitoring
              </span>
            </div>
            
            {protocols.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No protocols registered yet.</p>
                <button
                  onClick={handleAddProtocol}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Register your first protocol
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {protocols.map((protocol) => (
                  <div 
                    key={protocol.address}
                    onClick={() => navigate(`/protocols/${protocol.address}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {protocol.logoUrl ? (
                          <img 
                            src={protocol.logoUrl} 
                            alt={`${protocol.name} logo`} 
                            className="w-10 h-10 rounded-full mr-3" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-800 font-bold">
                              {protocol.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{protocol.name}</h3>
                          <p className="text-sm text-gray-500">{protocol.address.substring(0, 6)}...{protocol.address.substring(38)}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskClass(protocol.riskScore)}`}>
                          Risk: {protocol.riskScore}% ({getRiskLabel(protocol.riskScore)})
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium">{protocol.category || 'DeFi'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium capitalize">{protocol.status || (protocol.isActive ? 'Active' : 'Inactive')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Anomalies</p>
                        <p className="font-medium">{protocol.anomalyCount || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Alerts</h2>
            <AlertFeed alerts={recentAlerts} maxItems={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 