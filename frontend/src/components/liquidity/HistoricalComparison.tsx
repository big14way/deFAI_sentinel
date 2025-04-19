import React, { useState } from 'react';
import { Protocol } from '../../types/protocol';
import { formatCurrency } from '../../utils/formatters';

interface FlowDataPoint {
  timestamp: number;
  tvl: number;
}

interface ProtocolFlowData {
  protocol: Protocol;
  flowData: FlowDataPoint[];
}

interface HistoricalEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  flowPattern: number[]; // Normalized flow pattern (0-100 scale)
  impactedTVL: number;
  percentageLost: number;
  category: 'exploit' | 'bank-run' | 'market-event';
}

interface HistoricalComparisonProps {
  flowData: ProtocolFlowData[];
}

export const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ flowData }) => {
  // Historical events for comparison
  const historicalEvents: HistoricalEvent[] = [
    {
      id: 'event-1',
      name: 'Compound Exploit',
      date: 'Oct 2021',
      description: 'Bug in the Comptroller contract allowed users to claim excessive COMP tokens, resulting in significant outflows and price impact.',
      flowPattern: [100, 98, 95, 92, 87, 85, 80, 72, 65, 55, 45, 38, 35, 33, 30, 28, 27, 25, 22, 20],
      impactedTVL: 850000000, // $850M
      percentageLost: 38,
      category: 'exploit'
    },
    {
      id: 'event-2',
      name: 'Terra/UST Collapse',
      date: 'May 2022',
      description: 'Algorithmic stablecoin UST depegged from USD, leading to a death spiral with LUNA and massive withdrawal from Terra ecosystem protocols.',
      flowPattern: [100, 98, 96, 94, 90, 85, 75, 65, 50, 35, 25, 15, 10, 7, 5, 4, 3, 2, 1, 0],
      impactedTVL: 18000000000, // $18B
      percentageLost: 99,
      category: 'bank-run'
    },
    {
      id: 'event-3',
      name: 'Curve Finance liquidity crisis',
      date: 'Jul 2023',
      description: 'Concerns about Curve founder\'s leveraged positions led to massive withdrawals from the protocol.',
      flowPattern: [100, 95, 90, 82, 75, 70, 62, 58, 55, 52, 50, 48, 45, 42, 40, 38, 37, 35, 34, 33],
      impactedTVL: 1500000000, // $1.5B
      percentageLost: 67,
      category: 'bank-run'
    },
    {
      id: 'event-4',
      name: 'FTX Collapse',
      date: 'Nov 2022',
      description: 'FTX exchange collapse led to widespread liquidity withdrawals across DeFi protocols as users sought safety.',
      flowPattern: [100, 98, 95, 90, 82, 75, 68, 62, 58, 55, 53, 50, 48, 47, 45, 44, 43, 41, 40, 39],
      impactedTVL: 5300000000, // $5.3B
      percentageLost: 61,
      category: 'market-event'
    },
    {
      id: 'event-5',
      name: 'Nomad Bridge Hack',
      date: 'Aug 2022',
      description: 'Exploit of the Nomad bridge allowed attackers to drain nearly all funds, causing rapid TVL collapse.',
      flowPattern: [100, 90, 75, 50, 25, 10, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      impactedTVL: 190000000, // $190M
      percentageLost: 100,
      category: 'exploit'
    }
  ];
  
  const [selectedProtocol, setSelectedProtocol] = useState<string>(
    flowData.length > 0 ? flowData[0].protocol.address : ''
  );
  const [selectedEvent, setSelectedEvent] = useState<string>(historicalEvents[0].id);
  
  // Find selected protocol's flow data
  const selectedProtocolData = flowData.find(p => p.protocol.address === selectedProtocol);
  
  // Find selected historical event
  const selectedHistoricalEvent = historicalEvents.find(e => e.id === selectedEvent);
  
  // Calculate similarity scores between current protocol flow and historical events
  const calculateSimilarityScores = () => {
    if (!selectedProtocolData) return [];
    
    // Normalize protocol's flow data to 0-100 scale for comparison
    const normalizeFlowData = (data: FlowDataPoint[]) => {
      const maxTVL = Math.max(...data.map(d => d.tvl));
      const minTVL = Math.min(...data.map(d => d.tvl));
      const range = maxTVL - minTVL;
      
      return data.map(d => ({
        timestamp: d.timestamp,
        value: range > 0 ? 100 - ((d.tvl - minTVL) / range * 100) : 50 // Invert so downtrends appear similar to historical events
      }));
    };
    
    // Only use the last 20 points (or less if not enough data)
    const recentData = selectedProtocolData.flowData.slice(-20);
    const normalizedProtocolData = normalizeFlowData(recentData);
    
    // Calculate similarity with each historical event (using a simple Euclidean distance)
    return historicalEvents.map(event => {
      // Ensure the patterns have the same length for comparison
      const patternLength = Math.min(normalizedProtocolData.length, event.flowPattern.length);
      let distanceSum = 0;
      
      for (let i = 0; i < patternLength; i++) {
        const normalizedIndex = Math.floor(i * (normalizedProtocolData.length / patternLength));
        const eventIndex = Math.floor(i * (event.flowPattern.length / patternLength));
        
        const diff = normalizedProtocolData[normalizedIndex].value - event.flowPattern[eventIndex];
        distanceSum += diff * diff;
      }
      
      // Convert distance to similarity score (0-100%, higher is more similar)
      const maxPossibleDistance = 100 * 100 * patternLength; // Maximum squared difference per point * number of points
      const similarity = Math.max(0, 100 - Math.sqrt(distanceSum) / Math.sqrt(maxPossibleDistance) * 100);
      
      return {
        eventId: event.id,
        eventName: event.name,
        category: event.category,
        similarity: similarity
      };
    }).sort((a, b) => b.similarity - a.similarity);
  };
  
  const similarityScores = calculateSimilarityScores();
  
  // Determine current risk assessment based on highest similarity
  const getCurrentRiskAssessment = () => {
    if (similarityScores.length === 0) return null;
    
    const topMatch = similarityScores[0];
    
    if (topMatch.similarity > 85) {
      return {
        level: 'critical',
        message: `Current TVL flow pattern shows critical similarity (${topMatch.similarity.toFixed(1)}%) to the ${topMatch.eventName} event.`,
        recommendation: 'Immediate investigation recommended. Consider emergency liquidity measures.'
      };
    } else if (topMatch.similarity > 70) {
      return {
        level: 'high',
        message: `Current TVL flow pattern shows high similarity (${topMatch.similarity.toFixed(1)}%) to the ${topMatch.eventName} event.`,
        recommendation: 'Elevated risk detected. Monitor closely and prepare contingency plans.'
      };
    } else if (topMatch.similarity > 50) {
      return {
        level: 'medium',
        message: `Current TVL flow pattern shows moderate similarity (${topMatch.similarity.toFixed(1)}%) to the ${topMatch.eventName} event.`,
        recommendation: 'Some concerning patterns observed. Monitor for further developments.'
      };
    } else {
      return {
        level: 'low',
        message: `Current TVL flow shows low similarity (${topMatch.similarity.toFixed(1)}%) to historical bank run or exploit patterns.`,
        recommendation: 'No immediate concern. Continue routine monitoring.'
      };
    }
  };
  
  const riskAssessment = getCurrentRiskAssessment();
  
  return (
    <div className="space-y-6">
      {/* Risk Assessment Banner */}
      {riskAssessment && (
        <div className={`p-4 border-l-4 rounded-r-md ${
          riskAssessment.level === 'critical' ? 'bg-red-50 border-red-500 dark:bg-red-900 dark:border-red-600' : 
          riskAssessment.level === 'high' ? 'bg-amber-50 border-amber-500 dark:bg-amber-900 dark:border-amber-600' :
          riskAssessment.level === 'medium' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-600' :
          'bg-green-50 border-green-500 dark:bg-green-900 dark:border-green-600'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                riskAssessment.level === 'critical' ? 'text-red-500 dark:text-red-400' : 
                riskAssessment.level === 'high' ? 'text-amber-500 dark:text-amber-400' :
                riskAssessment.level === 'medium' ? 'text-yellow-500 dark:text-yellow-400' :
                'text-green-500 dark:text-green-400'
              }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                riskAssessment.level === 'critical' ? 'text-red-700 dark:text-red-300' : 
                riskAssessment.level === 'high' ? 'text-amber-700 dark:text-amber-300' :
                riskAssessment.level === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                'text-green-700 dark:text-green-300'
              }`}>
                {riskAssessment.level.charAt(0).toUpperCase() + riskAssessment.level.slice(1)} Risk Assessment
              </h3>
              <div className={`mt-2 text-sm ${
                riskAssessment.level === 'critical' ? 'text-red-600 dark:text-red-400' : 
                riskAssessment.level === 'high' ? 'text-amber-600 dark:text-amber-400' :
                riskAssessment.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                <p className="mb-1">{riskAssessment.message}</p>
                <p className="font-medium">{riskAssessment.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pattern comparison controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Historical Pattern Comparison</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="protocol-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Protocol
            </label>
            <select
              id="protocol-select"
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {flowData.map((data) => (
                <option key={data.protocol.address} value={data.protocol.address}>
                  {data.protocol.name} (Risk Score: {data.protocol.riskScore})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Historical Event
            </label>
            <select
              id="event-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {historicalEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.date})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Visualization of comparison */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white">Pattern Comparison</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comparing TVL pattern over the last {selectedProtocolData?.flowData.slice(-20).length || 0} time periods
              </p>
            </div>
            
            {selectedHistoricalEvent && (
              <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {selectedHistoricalEvent.category === 'exploit' ? 'Exploit' : 
                 selectedHistoricalEvent.category === 'bank-run' ? 'Bank Run' : 'Market Event'}
              </div>
            )}
          </div>
          
          {/* Chart visualization */}
          <div className="h-48 w-full">
            <div className="flex h-full items-end">
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 pr-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Current Protocol Flow</p>
                <div className="h-40 flex items-end justify-center">
                  {selectedProtocolData && selectedProtocolData.flowData.slice(-20).map((point, index) => {
                    // Normalize height based on protocol's own min/max
                    const maxTVL = Math.max(...selectedProtocolData.flowData.slice(-20).map(p => p.tvl));
                    const minTVL = Math.min(...selectedProtocolData.flowData.slice(-20).map(p => p.tvl));
                    const range = maxTVL - minTVL;
                    const height = range > 0 ? ((point.tvl - minTVL) / range) * 100 : 50;
                    
                    return (
                      <div
                        key={index}
                        className={`w-2 mx-px ${
                          point.tvl < selectedProtocolData.flowData[0].tvl * 0.9
                            ? 'bg-red-500'
                            : point.tvl < selectedProtocolData.flowData[0].tvl
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`TVL: ${formatCurrency(point.tvl)}`}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className="w-1/2 pl-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{selectedHistoricalEvent?.name}</p>
                <div className="h-40 flex items-end justify-center">
                  {selectedHistoricalEvent?.flowPattern.map((value, index) => (
                    <div
                      key={index}
                      className={`w-2 mx-px ${
                        value < 70 ? 'bg-red-500' : value < 90 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ height: `${value}%` }}
                      title={`Normalized value: ${value}%`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Similarity percentage */}
          {similarityScores.length > 0 && selectedHistoricalEvent && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pattern Similarity</p>
                <p className={`text-sm font-medium ${
                  similarityScores[0].similarity > 85 ? 'text-red-600 dark:text-red-400' :
                  similarityScores[0].similarity > 70 ? 'text-amber-600 dark:text-amber-400' :
                  similarityScores[0].similarity > 50 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {similarityScores.find(s => s.eventId === selectedEvent)?.similarity.toFixed(1)}%
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div
                  className={`h-2.5 rounded-full ${
                    similarityScores[0].similarity > 85 ? 'bg-red-600' :
                    similarityScores[0].similarity > 70 ? 'bg-amber-600' :
                    similarityScores[0].similarity > 50 ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${similarityScores.find(s => s.eventId === selectedEvent)?.similarity || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Historical event details */}
        {selectedHistoricalEvent && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">{selectedHistoricalEvent.name} - {selectedHistoricalEvent.date}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedHistoricalEvent.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">TVL Impact</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(selectedHistoricalEvent.impactedTVL)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Percentage Lost</p>
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {selectedHistoricalEvent.percentageLost}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Similarity rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Similarity Rankings</h2>
        
        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Historical Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Similarity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {similarityScores.map((score) => (
                <tr key={score.eventId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {score.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      score.category === 'exploit' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      score.category === 'bank-run' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {score.category === 'exploit' ? 'Exploit' : 
                      score.category === 'bank-run' ? 'Bank Run' : 'Market Event'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        score.similarity > 85 ? 'text-red-600 dark:text-red-400' :
                        score.similarity > 70 ? 'text-amber-600 dark:text-amber-400' :
                        score.similarity > 50 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {score.similarity.toFixed(1)}%
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${
                            score.similarity > 85 ? 'bg-red-600' :
                            score.similarity > 70 ? 'bg-amber-600' :
                            score.similarity > 50 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${score.similarity}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Similarity scores are calculated by comparing normalized TVL flow patterns. Scores above 85% represent critical similarity, above 70% high similarity, above 50% moderate similarity.
        </p>
      </div>
    </div>
  );
}; 