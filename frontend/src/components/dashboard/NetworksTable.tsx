import React, { useMemo } from 'react';
import { Protocol } from '../../types';

interface NetworksTableProps {
  protocols: Protocol[];
}

interface NetworkStat {
  name: string;
  protocolCount: number;
  tvl: number;
  avgRiskScore: number;
}

const NetworksTable: React.FC<NetworksTableProps> = ({ protocols }) => {
  // Calculate network stats from protocols
  const networkStats = useMemo(() => {
    const networks: Record<string, NetworkStat> = {};
    
    // Aggregate data by network
    protocols.forEach(protocol => {
      // Use optional chaining and type checking for network property
      const networkName = (typeof protocol.network === 'string' ? protocol.network : 'Unknown');
      
      if (!networks[networkName]) {
        networks[networkName] = {
          name: networkName,
          protocolCount: 0,
          tvl: 0,
          avgRiskScore: 0
        };
      }
      
      networks[networkName].protocolCount += 1;
      
      // Safely add TVL
      const protocolTvl = typeof protocol.tvl === 'number' ? protocol.tvl : 0;
      networks[networkName].tvl += protocolTvl;
      
      // Safely add risk score
      const riskScore = typeof protocol.riskScore === 'number' ? protocol.riskScore : 0;
      networks[networkName].avgRiskScore += riskScore;
    });
    
    // Calculate averages and return as array
    return Object.values(networks).map(network => {
      if (network.protocolCount > 0) {
        network.avgRiskScore = Math.round(network.avgRiskScore / network.protocolCount);
      }
      return network;
    }).sort((a, b) => b.tvl - a.tvl); // Sort by TVL desc
  }, [protocols]);
  
  // Helper for risk score display
  const getRiskClass = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (networkStats.length === 0) {
    return <p className="text-gray-500">No network statistics available.</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Network
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protocols
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total TVL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Risk Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {networkStats.map((network, index) => (
              <tr key={network.name || index.toString()} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {network.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {network.protocolCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${network.tvl.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskClass(network.avgRiskScore)}`}>
                    {network.avgRiskScore}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NetworksTable; 