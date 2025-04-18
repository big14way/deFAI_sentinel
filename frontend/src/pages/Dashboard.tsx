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
  const [debugInfo, setDebugInfo] = useState<string>('Loading data...');

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        if (!isMounted) return;
        
        console.log('Dashboard loading data, wallet connected:', isConnected);
        setDebugInfo(prev => prev + '\nStarting data load process...');
        
        setLoading(true);
        setError(null);
        setConnectionError(null);
        
        // Load protocols
        try {
          console.log('Fetching protocols');
          const protocolsData = await getAllProtocols();
          
          if (isMounted) {
            console.log('Protocols loaded:', protocolsData.length);
            setDebugInfo(prev => prev + `\nProtocols loaded: ${protocolsData.length}`);
            setProtocols(protocolsData);
            
            // Generate mock alerts as soon as we have protocols
            if (protocolsData.length > 0) {
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
          }
        } catch (protocolError: any) {
          console.error('Error loading protocols:', protocolError);
          setDebugInfo(prev => prev + `\nError loading protocols: ${protocolError}`);
          
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
            setDebugInfo(prev => prev + `\nAnomalies loaded: ${anomaliesData.length}`);
            setRecentAnomalies(anomaliesData);
          }
        } catch (anomalyError) {
          console.warn('Error loading anomalies:', anomalyError);
          setDebugInfo(prev => prev + `\nError loading anomalies: ${anomalyError}`);
          
          if (isMounted) {
            // Set an empty array for anomalies if load fails
            setRecentAnomalies([]);
          }
        }
      } catch (err) {
        console.error('Overall error loading dashboard data:', err);
        setDebugInfo(prev => prev + `\nOverall error: ${err}`);
        
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Dashboard data loading complete');
          setDebugInfo(prev => prev + '\nData loading complete');
        }
      }
    }

    loadData();
    
    // Cleanup function
    return () => {
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

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-40">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <pre>{debugInfo}</pre>
        </div>
      )}

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

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Risk Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Protocol Risk Overview</h2>
            
            {protocols.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No protocols found. Register protocols to view risk data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anomalies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {protocols.slice(0, 5).map((protocol, index) => (
                      <tr key={protocol.address} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <Link to={`/protocols/${protocol.address}`} className="hover:text-blue-600">
                            {protocol.name}
                          </Link>
                          <p className="text-xs text-gray-500">{`${protocol.address.substring(0, 6)}...${protocol.address.substring(protocol.address.length - 4)}`}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskClass(protocol.riskScore)}`}>
                            {protocol.riskScore} - {getRiskLabel(protocol.riskScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {protocol.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(protocol.lastUpdateTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {protocol.anomalyCount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              {protocol.anomalyCount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              None
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {protocols.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link to="/protocols" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View All Protocols
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Alerts */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-md h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Alerts</h2>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No recent alerts. All protocols are operating normally.
              </div>
            ) : (
              <AlertFeed alerts={recentAlerts} maxItems={5} showProtocolName={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 