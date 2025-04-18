import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Protocol } from '../types/protocol';
import { formatLargeNumber, getRiskColor, truncateString, formatTimestamp } from '../utils/formatters';

interface ProtocolCardProps {
  protocol: Protocol;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol }) => {
  const navigate = useNavigate();
  
  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
      onClick={() => navigate(`/protocols/${protocol.address}`)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {protocol.logoUrl ? (
            <img 
              src={protocol.logoUrl} 
              alt={`${protocol.name} logo`} 
              className="w-10 h-10 rounded-full mr-3" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              {protocol.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{protocol.name}</h3>
            <p className="text-sm text-gray-500">{truncateString(protocol.address)}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(protocol.status)}`}>
          {protocol.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Risk Score</p>
          <p className={`text-lg font-bold ${getRiskColor(protocol.riskScore)}`}>
            {protocol.riskScore.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">TVL</p>
          <p className="text-lg font-bold">{formatLargeNumber(protocol.tvl)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Chain</p>
          <p className="text-base">{protocol.chain || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="text-base">{protocol.category || 'N/A'}</p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-500">Anomalies</p>
          <p className="text-sm font-medium">{protocol.anomalyCount || 0}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="text-sm">{formatTimestamp(protocol.lastUpdated)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProtocolCard; 