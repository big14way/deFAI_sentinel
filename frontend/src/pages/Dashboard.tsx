import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProtocolList from '../components/dashboard/ProtocolList';
import DashboardStats from '../components/dashboard/DashboardStats';
import NetworksTable from '../components/dashboard/NetworksTable';
import RecentAnomalies from '../components/dashboard/RecentAnomalies';
import RiskComponents from '../components/dashboard/RiskComponents';
import { Protocol, Anomaly } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols } from '../services/api';
import { getRiskAssessment } from '../services/risk';
import { getRecentAnomalies } from '../services/anomaly';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [networkStats, setNetworkStats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('live');

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      try {
        if (!isMounted) return;
        
        console.log('Dashboard loading data from:', dataSource === 'live' ? 'LIVE API' : 'MOCK DATA');
        setLoading(true);
        
        // 1. Fetch protocols using the specified data source
        const useLiveData = dataSource === 'live';
        let fetchedProtocols;
        try {
          fetchedProtocols = await getAllProtocols(useLiveData);
        } catch (err) {
          console.error('Error fetching protocols:', err);
          // Switch to mock data if live data fails
          if (useLiveData) {
            console.log('Live data failed, trying mock data...');
            fetchedProtocols = await getAllProtocols(false);
          } else {
            throw err;
          }
        }
        
        if (!isMounted) return;
        
        if (!fetchedProtocols || fetchedProtocols.length === 0) {
          console.warn('No protocols found, using fallback data');
          // Use a local fallback - empty array with one simple protocol
          fetchedProtocols = [{
            id: 'fallback',
            address: '0x0000000000000000000000000000000000000000',
            name: 'Demo Protocol',
            riskScore: 50,
            isActive: true,
            lastUpdateTime: Date.now(),
            anomalyCount: 0,
            tvl: 1000000,
            status: 'active',
            category: 'other',
            deployments: {},
            description: 'Fallback demo protocol'
          }];
        }
        
        console.log(`Fetched ${fetchedProtocols.length} protocols`);
        
        // 2. For each protocol, assess its risk
        const protocolsWithRisk = await Promise.all(
          fetchedProtocols.map(async (protocol) => {
            try {
              // Only calculate risk for protocols without a risk score or when switching data sources
              if (protocol.riskScore === undefined || protocol.riskComponents === undefined) {
                const riskAssessment = await getRiskAssessment(protocol, useLiveData);
                
                return {
                  ...protocol,
                  riskComponents: riskAssessment,
                  riskScore: riskAssessment.totalScore
                };
              }
              return protocol;
            } catch (err) {
              console.error(`Error assessing risk for ${protocol.name}:`, err);
              // Return protocol with default risk score if assessment fails
              return {
                ...protocol,
                riskScore: protocol.riskScore || 50,
                riskComponents: protocol.riskComponents || {
                  tvlRisk: 5,
                  volatilityRisk: 5,
                  ageRisk: 5,
                  auditRisk: 5,
                  totalScore: protocol.riskScore || 50,
                  timestamp: Date.now()
                }
              };
            }
          })
        );
        
        if (!isMounted) return;
        
        // 3. Fetch recent anomalies with fallback
        let fetchedAnomalies: Anomaly[] = [];
        try {
          const useLiveData = dataSource === 'live';
          fetchedAnomalies = await getRecentAnomalies(useLiveData);
          
          // Create enhanced anomalies with protocol information from our list
          if (dataSource === 'live') {
            fetchedAnomalies = fetchedAnomalies.map(anomaly => {
              // Create a copy of the anomaly to safely modify
              const enhancedAnomaly = { ...anomaly };
              
              // Check if we need to add protocol information
              if (!enhancedAnomaly.protocol?.name) {
                // Find matching protocol by ID or address
                const matchingProtocol = protocolsWithRisk.find(p => 
                  p.id === anomaly.protocolId || 
                  p.address === anomaly.protocolId ||
                  p.address === anomaly.protocol?.address
                );
                
                if (matchingProtocol) {
                  // Create a valid Protocol object with required fields
                  enhancedAnomaly.protocol = {
                    address: matchingProtocol.address,
                    name: matchingProtocol.name,
                    riskScore: matchingProtocol.riskScore,
                    isActive: matchingProtocol.isActive,
                    lastUpdateTime: matchingProtocol.lastUpdateTime,
                    anomalyCount: matchingProtocol.anomalyCount,
                    deployments: matchingProtocol.deployments,
                    ...(matchingProtocol.id && { id: matchingProtocol.id }),
                    ...(matchingProtocol.logoUrl && { logoUrl: matchingProtocol.logoUrl }),
                    ...(matchingProtocol.status && { status: matchingProtocol.status }),
                  };
                } else {
                  // Create a placeholder Protocol with required fields
                  const protocolId = anomaly.protocolId || anomaly.protocol?.address || 'unknown';
                  const shortId = protocolId.substring(0, 6);
                  
                  enhancedAnomaly.protocol = {
                    address: protocolId,
                    name: `Protocol ${shortId}`,
                    riskScore: 50,
                    isActive: true,
                    lastUpdateTime: Date.now(),
                    anomalyCount: 1,
                    deployments: {},
                  };
                }
              }
              
              return enhancedAnomaly;
            });
          }
        } catch (err) {
          console.error('Error fetching anomalies:', err);
          // Create empty anomalies array as fallback
        }
        
        if (!isMounted) return;
        
        // Update state with fetched data
        setProtocols(protocolsWithRisk);
        setRecentAnomalies(fetchedAnomalies);
        setError(null);
        
        console.log(`Processed ${protocolsWithRisk.length} protocols with risk assessment`);
        toast.success(`Successfully loaded ${protocolsWithRisk.length} protocols`);
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Error loading dashboard data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [dataSource]);

  // Calculate dashboard stats using useMemo
  const dashboardStats = useMemo(() => {
    console.log('Calculating dashboard stats, protocols:', protocols.length);
    
    // Get protocols with risk scores
    const protocolsWithRisk = protocols.filter(p => p.riskScore !== undefined);
    const highRiskCount = protocolsWithRisk.filter(p => p.riskScore && p.riskScore > 70).length;
    
    // Calculate average risk score if we have protocols with risk scores
    let avgRiskScore = 0;
    if (protocolsWithRisk.length > 0) {
      avgRiskScore = Math.round(
        protocolsWithRisk.reduce((sum, p) => sum + (p.riskScore || 0), 0) / protocolsWithRisk.length
      );
    }
    
    // Calculate total TVL
    let totalTVL = 0;
    protocols.forEach(p => {
      if (p.tvl && typeof p.tvl === 'number') {
        totalTVL += p.tvl;
      }
    });
    
    return {
      totalProtocols: protocols.length,
      activeProtocols: protocols.filter(p => p.status === 'active').length,
      highRiskProtocols: highRiskCount,
      totalTVL,
      recentAnomalies: recentAnomalies.length,
      avgRiskScore: avgRiskScore
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

  // Navigate to add protocol
  const handleAddProtocol = () => {
    navigate('/protocols/add');
  };
  
  // Toggle data source between live and mock
  const toggleDataSource = () => {
    setDataSource(prev => prev === 'live' ? 'mock' : 'live');
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry Loading Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Data source indicator */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">
            Data Source: <span className={`font-semibold ${dataSource === 'live' ? 'text-green-600' : 'text-orange-600'}`}>{dataSource === 'live' ? 'LIVE' : 'Mock'}</span>
          </span>
          <button
            onClick={toggleDataSource}
            className={`px-3 py-1 ${dataSource === 'live' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} text-sm rounded-md hover:bg-blue-200 transition-colors`}
          >
            Toggle to {dataSource === 'live' ? 'Mock' : 'Live'} Data
          </button>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <DashboardStats 
        totalProtocols={dashboardStats.totalProtocols}
        activeProtocols={dashboardStats.activeProtocols}
        highRiskProtocols={dashboardStats.highRiskProtocols}
        totalTVL={dashboardStats.totalTVL}
        recentAnomalies={dashboardStats.recentAnomalies}
        avgRiskScore={dashboardStats.avgRiskScore}
      />
      
      {/* Featured Protocols */}
      <div className="mt-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Protocols by Risk</h2>
          <button 
            onClick={() => navigate('/protocols')}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            View All 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <ProtocolList 
          protocols={protocols.slice(0, 6)}
          onViewDetails={(id) => navigate(`/protocols/${id}`)}
        />
      </div>
      
      {/* Recent Anomalies */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Anomalies</h2>
          <button 
            onClick={() => navigate('/anomalies')}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <RecentAnomalies anomalies={recentAnomalies} onViewDetails={(id) => navigate(`/anomalies/${id}`)} />
      </div>
      
      {/* Network Stats */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Network Overview</h2>
        </div>
        <NetworksTable protocols={protocols} />
      </div>
    </div>
  );
};

export default Dashboard; 