import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Protocol } from '../types/protocol';
import { formatTimestamp, formatRelativeTime, formatCurrency, formatAddress } from '../utils/formatters';

interface RiskScoreCardProps {
  protocol: Protocol;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ protocol }) => {
  const navigate = useNavigate();

  // Determine color based on risk score
  const getRiskColor = (score: number): string => {
    if (score >= 75) return '#e53e3e'; // red
    if (score >= 50) return '#dd6b20'; // orange
    if (score >= 25) return '#d69e2e'; // yellow
    return '#38a169'; // green
  };

  // Handle navigation to protocol details
  const handleViewDetails = () => {
    navigate(`/protocols/${protocol.id}`);
  };

  const riskColor = getRiskColor(protocol.riskScore);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {protocol.logoUrl && (
            <img 
              src={protocol.logoUrl} 
              alt={`${protocol.name} logo`} 
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{protocol.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(protocol.address)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            protocol.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            protocol.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {protocol.chain}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 mb-2">
            <CircularProgressbar
              value={protocol.riskScore}
              text={`${protocol.riskScore}%`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: riskColor,
                textColor: riskColor,
                trailColor: '#e2e8f0',
              })}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Risk Score</p>
        </div>
        
        <div className="flex flex-col justify-center">
          {protocol.tvl !== undefined && (
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">TVL</p>
              <p className="text-lg font-semibold">{formatCurrency(protocol.tvl)}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
            <p className="text-lg font-semibold">{protocol.category}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-sm">{formatRelativeTime(protocol.lastUpdated)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Anomalies</p>
            <p className="text-sm">{protocol.anomalyCount || 0}</p>
          </div>
        </div>
        
        {protocol.lastAnomaly && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Anomaly</p>
            <p className="text-sm">{formatTimestamp(protocol.lastAnomaly)}</p>
          </div>
        )}
        
        <button
          onClick={handleViewDetails}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default RiskScoreCard; 