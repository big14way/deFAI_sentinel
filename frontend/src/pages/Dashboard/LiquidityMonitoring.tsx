import React, { useState, useEffect } from 'react';
import { getAllProtocols } from '../../services/web3';
import { Protocol } from '../../types/protocol';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TVLMonitor } from '../../components/liquidity/TVLMonitor';
import { LiquidityAlerts } from '../../components/liquidity/LiquidityAlerts';
import { HistoricalComparison } from '../../components/liquidity/HistoricalComparison';

const LiquidityMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'historical'>('monitor');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const protocolData = await getAllProtocols();
        setProtocols(protocolData);
      } catch (error) {
        console.error('Error fetching protocols:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Generate flow data (in a real app, this would come from an API)
  const generateFlowData = () => {
    // Current timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Set to protocols with high risk scores (more than 60)
    const highRiskProtocols = protocols.filter(p => p.riskScore > 60);
    
    return highRiskProtocols.map(protocol => {
      // Generate 48 hours of data (30-minute intervals)
      const dataPoints = [];
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidity Monitoring</h1>
        <p className="text-gray-600 dark:text-gray-400">Early warning system for unusual TVL outflows and liquidity shifts</p>
      </div>
      
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
          <LiquidityAlerts protocols={protocols} />
        )}
        
        {activeTab === 'historical' && (
          <HistoricalComparison flowData={liquidityFlowData} />
        )}
      </div>
    </div>
  );
};

export default LiquidityMonitoring; 