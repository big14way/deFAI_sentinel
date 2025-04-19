import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface RiskExposureChartProps {
  exposureByRisk: {
    high: number;
    medium: number;
    low: number;
  };
  exposureByCategory: Record<string, number>;
}

export const RiskExposureChart: React.FC<RiskExposureChartProps> = ({
  exposureByRisk,
  exposureByCategory
}) => {
  const [chartType, setChartType] = useState<'risk' | 'category'>('risk');
  
  // Calculate total exposure
  const totalExposure = 
    exposureByRisk.high + 
    exposureByRisk.medium + 
    exposureByRisk.low;
  
  // Calculate percentages for risk chart
  const riskPercentages = {
    high: totalExposure > 0 ? (exposureByRisk.high / totalExposure) * 100 : 0,
    medium: totalExposure > 0 ? (exposureByRisk.medium / totalExposure) * 100 : 0,
    low: totalExposure > 0 ? (exposureByRisk.low / totalExposure) * 100 : 0,
  };
  
  // Calculate percentages for category chart
  const categoryEntries = Object.entries(exposureByCategory)
    .map(([category, value]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value,
      percentage: totalExposure > 0 ? (value / totalExposure) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
  
  // Color mapping for risk levels
  const riskColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  };

  // Color mapping for categories (using a set of predefined colors)
  const categoryColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
    'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-lime-500'
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exposure Distribution</h2>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === 'risk'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setChartType('risk')}
          >
            By Risk
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setChartType('category')}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Risk Level Chart */}
      {chartType === 'risk' && (
        <>
          <div className="w-full h-8 flex rounded-full overflow-hidden mb-4">
            {Object.entries(riskPercentages).map(([level, percentage]) => (
              <div 
                key={level}
                className={`${riskColors[level as keyof typeof riskColors]} h-full`}
                style={{ width: `${percentage}%` }}
                title={`${level.charAt(0).toUpperCase() + level.slice(1)}: ${percentage.toFixed(1)}%`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {Object.entries(exposureByRisk).map(([level, value]) => (
              <div key={level} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`w-4 h-4 rounded-full ${riskColors[level as keyof typeof riskColors]}`}></div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(value)} ({(riskPercentages[level as keyof typeof riskPercentages] || 0).toFixed(1)}%)
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category Chart */}
      {chartType === 'category' && (
        <>
          <div className="w-full h-8 flex rounded-full overflow-hidden mb-4">
            {categoryEntries.map((entry, index) => (
              <div 
                key={entry.category}
                className={`${categoryColors[index % categoryColors.length]} h-full`}
                style={{ width: `${entry.percentage}%` }}
                title={`${entry.category}: ${entry.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {categoryEntries.map((entry, index) => (
              <div key={entry.category} className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${categoryColors[index % categoryColors.length]} mr-2`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(entry.value)} ({entry.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Compliance Insights</h3>
        
        {chartType === 'risk' && riskPercentages.high > 30 && (
          <div className="flex items-start text-sm text-red-600 dark:text-red-400">
            <svg className="w-4 h-4 mt-0.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <p>High risk exposure exceeds regulatory recommendation of 30%. Consider rebalancing portfolio.</p>
          </div>
        )}
        
        {chartType === 'category' && Object.values(exposureByCategory).some(value => (value / totalExposure) > 0.4) && (
          <div className="flex items-start text-sm text-amber-600 dark:text-amber-400">
            <svg className="w-4 h-4 mt-0.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <p>Portfolio concentration in a single category exceeds 40%. Consider diversifying to reduce correlation risk.</p>
          </div>
        )}
        
        {((chartType === 'risk' && riskPercentages.high <= 30) || 
         (chartType === 'category' && !Object.values(exposureByCategory).some(value => (value / totalExposure) > 0.4))) && (
          <div className="flex items-start text-sm text-green-600 dark:text-green-400">
            <svg className="w-4 h-4 mt-0.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Current allocation meets regulatory guidelines and institutional risk policy requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 