import React, { useState, useEffect } from 'react';
import { getAllProtocols } from '../../services/web3';
import { Protocol } from '../../types/protocol';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TVLMonitor } from '../../components/liquidity/TVLMonitor';
import { LiquidityAlerts } from '../../components/liquidity/LiquidityAlerts';
import { HistoricalComparison } from '../../components/liquidity/HistoricalComparison';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// Mock protocol data in case API calls fail
const mockProtocols: Protocol[] = [
  {
    address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    name: "Aave",
    chainId: 1,
    riskScore: 32,
    anomalyCount: 2,
    tvl: 5800000000,
    isActive: true,
    lastUpdateTime: Date.now(),
    deployments: {1: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"}
  },
  {
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    name: "Uniswap",
    chainId: 1,
    riskScore: 65,
    anomalyCount: 4,
    tvl: 8200000000,
    isActive: true,
    lastUpdateTime: Date.now(),
    deployments: {1: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"}
  },
  {
    address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    name: "Compound",
    chainId: 1,
    riskScore: 45,
    anomalyCount: 0,
    tvl: 3400000000,
    isActive: true,
    lastUpdateTime: Date.now(),
    deployments: {1: "0xc00e94cb662c3520282e6f5717214004a7f26888"}
  },
  {
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    name: "MakerDAO",
    chainId: 1,
    riskScore: 78,
    anomalyCount: 3,
    tvl: 5100000000,
    isActive: true,
    lastUpdateTime: Date.now(),
    deployments: {1: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"}
  }
];

const LiquidityMonitoring: React.FC = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'historical'>('monitor');
  const [error, setError] = useState<string | null>(null);
  
  console.log("LiquidityMonitoring component rendered, connected:", isConnected);
  
  useEffect(() => {
    // For demo/testing, we'll load data regardless of wallet connection
    // This makes it easier to debug
    const fetchData = async () => {
      try {
        console.log("Fetching protocols data");
        setLoading(true);
        setError(null);
        
        const protocolData = await getAllProtocols();
        if (protocolData && protocolData.length > 0) {
          console.log("Protocols loaded:", protocolData.length);
          setProtocols(protocolData);
        } else {
          console.log("No protocols found, using mock data");
          setProtocols(mockProtocols);
          setError("No protocols found from API. Using demo data.");
        }
      } catch (error) {
        console.error('Error fetching protocols:', error);
        setError("Failed to load protocols. Using demo data.");
        // Fall back to mock data
        setProtocols(mockProtocols);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isConnected]);
  
  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  // Generate flow data (in a real app, this would come from an API)
  const generateFlowData = () => {
    // Current timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Use actual protocols or fall back to mock data
    const protocolsToUse = protocols.length > 0 ? protocols : mockProtocols;
    
    // Set to protocols with high risk scores (more than 60)
    const highRiskProtocols = protocolsToUse.filter(p => p.riskScore > 60);
    
    return protocolsToUse.map(protocol => {
      // Generate 48 hours of data (30-minute intervals)
      const dataPoints: { timestamp: number; tvl: number; }[] = [];
      const intervals = 48 * 2; // 48 hours x 2 points per hour
      
      // Initial TVL (use the protocol's TVL or a random value)
      let tvl = protocol.tvl || Math.random() * 1000000000;
      
      // Timestamp 48 hours ago
      let timestamp = now - (48 * 60 * 60);
      
      for (let i = 0; i < intervals; i++) {
        // Create slight randomness in the TVL, with a trend towards decline for high-risk protocols
        const change = tvl * (Math.random() * 0.05 - (protocol.riskScore > 70 ? 0.03 : 0.01));
        tvl += change;
        
        // Ensure TVL doesn't go negative
        if (tvl < 0) tvl = 10000;
        
        dataPoints.push({
          timestamp,
          tvl
        });
        
        // Move forward 30 minutes
        timestamp += 30 * 60;
      }
      
      // For high-risk protocols, simulate a sudden drop in the last few hours
      if (protocol.riskScore > 75) {
        for (let i = Math.floor(intervals * 0.9); i < intervals; i++) {
          // Accelerated decline (simulate potential liquidity crisis)
          dataPoints[i].tvl *= 0.95 - (Math.random() * 0.05);
        }
      }
      
      return {
        protocol,
        flowData: dataPoints
      };
    });
  };
  
  const liquidityFlowData = generateFlowData();
  console.log("Generated liquidity flow data for", liquidityFlowData.length, "protocols");
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <span className="ml-3">Loading liquidity monitoring data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidity Monitoring</h1>
        <p className="text-gray-600 dark:text-gray-400">Early warning system for unusual TVL outflows and liquidity shifts</p>
      </div>
      
      {!isConnected && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You are viewing demo data. Connect your wallet to access real-time monitoring.
                <button 
                  onClick={handleConnectWallet}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitor'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('monitor')}
          >
            TVL Monitor
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            Liquidity Alerts
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historical'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('historical')}
          >
            Historical Comparison
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'monitor' && (
          <TVLMonitor flowData={liquidityFlowData} />
        )}
        
        {activeTab === 'alerts' && (
          <LiquidityAlerts protocols={protocols.length > 0 ? protocols : mockProtocols} />
        )}
        
        {activeTab === 'historical' && (
          <HistoricalComparison flowData={liquidityFlowData} />
        )}
      </div>
    </div>
  );
};

export default LiquidityMonitoring; 