import React from 'react';
import { formatLargeNumber, formatCurrency } from '../../utils/formatters';

interface InstitutionalMetricsProps {
  totalExposure: number;
  highRiskExposure: number;
  protocolCount: number;
  anomalyCount: number;
}

export const InstitutionalMetrics: React.FC<InstitutionalMetricsProps> = ({
  totalExposure,
  highRiskExposure,
  protocolCount,
  anomalyCount
}) => {
  // Calculate percentage of high risk exposure
  const highRiskPercentage = totalExposure > 0 
    ? Math.round((highRiskExposure / totalExposure) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Overview</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total DeFi Exposure</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalExposure)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">High Risk Exposure</p>
          <div className="flex items-end">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
              {formatCurrency(highRiskExposure)}
            </p>
            <p className={`text-sm ${highRiskPercentage > 30 ? 'text-red-500' : 'text-gray-500'}`}>
              {highRiskPercentage}%
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitored Protocols</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {protocolCount}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Anomalies</p>
          <p className={`text-2xl font-bold ${anomalyCount > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            {anomalyCount}
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Regulatory Compliance</p>
          <p className="text-sm font-medium text-green-500">97%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '97%' }}></div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Risk-Adjusted Returns</p>
          <p className="text-sm font-medium text-amber-500">76%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: '76%' }}></div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Diversification</p>
          <p className="text-sm font-medium text-blue-500">83%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '83%' }}></div>
        </div>
      </div>
    </div>
  );
}; 