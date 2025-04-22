import React, { useState } from 'react';
import { Protocol } from '../../types/protocol';
import { formatCurrency, formatLargeNumber } from '../../utils/formatters';

interface FlowDataPoint {
  timestamp: number;
  tvl: number;
}

interface ProtocolFlowData {
  protocol: Protocol;
  flowData: FlowDataPoint[];
}

interface TVLMonitorProps {
  flowData: ProtocolFlowData[];
}

export const TVLMonitor: React.FC<TVLMonitorProps> = ({ flowData }) => {
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '48h'>('24h');
  const [sortBy, setSortBy] = useState<'name' | 'tvl' | 'change'>('change');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Calculate TVL changes and flow anomalies
  const protocolsWithMetrics = flowData.map(({ protocol, flowData }) => {
    // Filter data points based on selected time range
    let filteredData = flowData;
    const now = Math.floor(Date.now() / 1000);
    
    if (timeRange === '6h') {
      filteredData = flowData.filter(point => point.timestamp >= now - 6 * 60 * 60);
    } else if (timeRange === '12h') {
      filteredData = flowData.filter(point => point.timestamp >= now - 12 * 60 * 60);
    } else if (timeRange === '24h') {
      filteredData = flowData.filter(point => point.timestamp >= now - 24 * 60 * 60);
    }
    
    // Calculate current and initial TVL
    const currentTVL = filteredData.length > 0 ? filteredData[filteredData.length - 1].tvl : 0;
    const initialTVL = filteredData.length > 0 ? filteredData[0].tvl : 0;
    
    // Calculate percentage change
    const percentageChange = initialTVL !== 0 
      ? ((currentTVL - initialTVL) / initialTVL) * 100 
      : 0;
    
    // Calculate outflow rate (change per hour, normalized)
    const hoursDiff = filteredData.length > 1 
      ? (filteredData[filteredData.length - 1].timestamp - filteredData[0].timestamp) / 3600 
      : 1;
    
    const outflowRate = hoursDiff !== 0 
      ? (initialTVL - currentTVL) / hoursDiff 
      : 0;
    
    // Check for anomaly (significant outflow rate compared to TVL)
    const anomalyThreshold = initialTVL * 0.02; // 2% of TVL per hour is considered significant
    const isAnomaly = outflowRate > anomalyThreshold && percentageChange < -5;
    
    // For severe anomalies (bank run potential)
    const isSevereAnomaly = outflowRate > (initialTVL * 0.05) && percentageChange < -10;
    
    return {
      protocol,
      currentTVL,
      initialTVL,
      percentageChange,
      outflowRate,
      isAnomaly,
      isSevereAnomaly,
      flowData: filteredData
    };
  });
  
  // Sort protocols based on selected criteria
  const sortedProtocols = [...protocolsWithMetrics].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.protocol.name.localeCompare(b.protocol.name)
        : b.protocol.name.localeCompare(a.protocol.name);
    } else if (sortBy === 'tvl') {
      return sortDirection === 'asc' 
        ? a.currentTVL - b.currentTVL
        : b.currentTVL - a.currentTVL;
    } else { // change
      return sortDirection === 'asc' 
        ? a.percentageChange - b.percentageChange
        : b.percentageChange - a.percentageChange;
    }
  });
  
  // Handle sorting column click
  const handleSortClick = (column: 'name' | 'tvl' | 'change') => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Count protocols with anomalies
  const anomalyCount = protocolsWithMetrics.filter(p => p.isAnomaly).length;
  const severeAnomalyCount = protocolsWithMetrics.filter(p => p.isSevereAnomaly).length;
  
  console.log("TVLMonitor rendering with flow data:", flowData);
  console.log("Sorted protocols:", sortedProtocols);
  
  return (
    <div className="container mx-auto space-y-6">
      {/* Alert banner if there are severe anomalies */}
      {severeAnomalyCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900 dark:border-red-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                Critical TVL Outflow Detected
              </h3>
              <div className="mt-2 text-sm text-red-600 dark:text-red-300">
                <p>
                  {severeAnomalyCount} protocol{severeAnomalyCount > 1 ? 's are' : ' is'} experiencing unusually high withdrawal rates that may indicate a liquidity crisis. 
                  Immediate investigation is recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitored Protocols</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {flowData.length}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Anomalies Detected</p>
            <p className={`text-2xl font-bold ${anomalyCount > 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
              {anomalyCount}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Critical Alerts</p>
            <p className={`text-2xl font-bold ${severeAnomalyCount > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {severeAnomalyCount}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time Window</p>
            <div className="flex items-center mt-1">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="6h">Last 6 Hours</option>
                <option value="12h">Last 12 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="48h">Last 48 Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* TVL Flow Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortClick('name')}
                >
                  <div className="flex items-center">
                    Protocol
                    {sortBy === 'name' && (
                      <svg className={`ml-1 w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortClick('tvl')}
                >
                  <div className="flex items-center">
                    Current TVL
                    {sortBy === 'tvl' && (
                      <svg className={`ml-1 w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortClick('change')}
                >
                  <div className="flex items-center">
                    Change
                    {sortBy === 'change' && (
                      <svg className={`ml-1 w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Flow Trend
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProtocols.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No protocols found
                  </td>
                </tr>
              ) : (
                sortedProtocols.map(({ 
                  protocol, 
                  currentTVL, 
                  initialTVL, 
                  percentageChange, 
                  isAnomaly,
                  isSevereAnomaly,
                  flowData
                }) => (
                  <tr key={protocol.address} className={isSevereAnomaly ? 'bg-red-50 dark:bg-red-900' : isAnomaly ? 'bg-amber-50 dark:bg-amber-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {protocol.logoUrl && (
                          <img src={protocol.logoUrl} alt={protocol.name} className="w-8 h-8 rounded-full mr-3" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{protocol.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Risk Score: {protocol.riskScore}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(currentTVL)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        percentageChange > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : percentageChange < -10
                            ? 'text-red-600 dark:text-red-400'
                            : percentageChange < -5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {initialTVL > currentTVL ? 'Outflow' : 'Inflow'}: {formatCurrency(Math.abs(initialTVL - currentTVL))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-8 w-full bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        {/* Create a simplified sparkline chart from flow data */}
                        <div className="h-full flex items-end">
                          {flowData.length > 0 && flowData.map((point, index) => {
                            // Get min and max TVL for normalization
                            const maxTVL = Math.max(...flowData.map(p => p.tvl));
                            const minTVL = Math.min(...flowData.map(p => p.tvl));
                            const range = maxTVL - minTVL;
                            
                            // Normalize the height (0 to 100%)
                            const normalizedHeight = range > 0 
                              ? ((point.tvl - minTVL) / range) * 100 
                              : 50;
                            
                            return (
                              <div 
                                key={index}
                                className={`w-1 mx-px ${
                                  index > flowData.length * 0.8 && isSevereAnomaly
                                    ? 'bg-red-500'
                                    : index > flowData.length * 0.8 && isAnomaly
                                      ? 'bg-amber-500'
                                      : point.tvl > initialTVL
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                }`}
                                style={{ 
                                  height: `${normalizedHeight}%`,
                                }}
                                title={`${formatTime(point.timestamp)}: ${formatCurrency(point.tvl)}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSevereAnomaly ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Critical Outflow
                        </span>
                      ) : isAnomaly ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Unusual Activity
                        </span>
                      ) : percentageChange < -2 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Minor Outflow
                        </span>
                      ) : percentageChange > 2 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Inflow
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Flow analysis insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Flow Analysis Insights</h2>
        
        {sortedProtocols.filter(p => p.isSevereAnomaly).length > 0 && (
          <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-600">
            <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Critical Outflow Detected</h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              The following protocols are experiencing severe TVL outflows that resemble historical "bank run" patterns:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-red-600 dark:text-red-400">
              {sortedProtocols
                .filter(p => p.isSevereAnomaly)
                .map(p => (
                  <li key={p.protocol.address}>{p.protocol.name} ({p.percentageChange.toFixed(2)}% change)</li>
                ))
              }
            </ul>
          </div>
        )}
        
        {sortedProtocols.filter(p => p.isAnomaly && !p.isSevereAnomaly).length > 0 && (
          <div className="mb-4 p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900 dark:border-amber-600">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">Unusual Activity Detected</h3>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              The following protocols are showing unusual withdrawal patterns:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-amber-600 dark:text-amber-400">
              {sortedProtocols
                .filter(p => p.isAnomaly && !p.isSevereAnomaly)
                .map(p => (
                  <li key={p.protocol.address}>{p.protocol.name} ({p.percentageChange.toFixed(2)}% change)</li>
                ))
              }
            </ul>
          </div>
        )}
        
        {sortedProtocols.filter(p => p.percentageChange > 10).length > 0 && (
          <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900 dark:border-green-600">
            <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Significant Inflows</h3>
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              The following protocols are receiving significant capital inflows:
            </p>
            <ul className="mt-2 pl-5 list-disc text-sm text-green-600 dark:text-green-400">
              {sortedProtocols
                .filter(p => p.percentageChange > 10)
                .map(p => (
                  <li key={p.protocol.address}>{p.protocol.name} (+{p.percentageChange.toFixed(2)}% change)</li>
                ))
              }
            </ul>
          </div>
        )}
        
        {anomalyCount === 0 && severeAnomalyCount === 0 && (
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-600">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Normal Flow Patterns</h3>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              All monitored protocols are showing normal liquidity flow patterns within expected ranges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 