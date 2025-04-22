import React, { useEffect, useState } from 'react';
import { fetchNetworkStats } from '../../services/api';
// Use standard imports with type assertion
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NetworkStat {
  name: string;
  volume24h: number;
  activeBridges: number;
  avgRiskScore: number;
  volume7d: number[];
}

interface ChainMetricProps {
  icon: string;
  name: string;
  volume24h: number;
  activeBridges: number;
  avgRiskScore: number;
  volume7d: number[];
}

const ChainMetric: React.FC<ChainMetricProps> = ({ icon, name, volume24h, activeBridges, avgRiskScore, volume7d }) => {
  // Format volume for display
  const formatVolume = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value}`;
  };

  // Prepare chart data
  const chartData = volume7d.map((volume, index) => {
    // Get day names for the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      day,
      volume,
    };
  });

  return (
    <div className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <img src={`/assets/logos/${icon}`} alt={`${name} logo`} className="w-8 h-8 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{name}</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatVolume(volume24h)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active Bridges</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{activeBridges}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Risk Score</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{avgRiskScore}</span>
        </div>
      </div>
      
      <div className="h-40 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(value: number) => formatVolume(value).replace('$', '')} />
            <Tooltip 
              formatter={(value: any) => formatVolume(value)}
              labelFormatter={(label: string) => `${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke={
                name === 'ethereum' ? '#627EEA' :
                name === 'arbitrum' ? '#28A0F0' :
                name === 'optimism' ? '#FF0420' :
                name === 'polygon' ? '#8247E5' :
                name === 'base' ? '#0052FF' : '#6366F1'
              } 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AssetFlows: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNetworkStats = async () => {
      try {
        const data = await fetchNetworkStats();
        setNetworkStats(data);
      } catch (error) {
        console.error('Error loading network stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNetworkStats();
  }, []);

  // Map network names to icon files
  const getIconFileName = (name: string): string => {
    const iconMap: Record<string, string> = {
      ethereum: 'ethereum.svg',
      arbitrum: 'arbitrum.svg',
      optimism: 'optimism.svg',
      polygon: 'polygon.svg',
      base: 'base.svg'
    };
    
    return iconMap[name] || 'generic-chain.svg';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cross-Chain Asset Flows</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {networkStats.map((network) => (
          <ChainMetric
            key={network.name}
            icon={getIconFileName(network.name)}
            name={network.name}
            volume24h={network.volume24h}
            activeBridges={network.activeBridges}
            avgRiskScore={network.avgRiskScore}
            volume7d={network.volume7d}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetFlows; 