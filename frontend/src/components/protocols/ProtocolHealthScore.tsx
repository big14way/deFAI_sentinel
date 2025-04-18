import React, { useState } from 'react';
import { Protocol } from '../../types/protocol';
import { getRiskColor } from '../../utils/formatters';

interface ProtocolHealthScoreProps {
  protocol: Protocol;
}

interface HealthMetric {
  name: string;
  score: number;
  description: string;
  weight: number;
}

const ProtocolHealthScore: React.FC<ProtocolHealthScoreProps> = ({ protocol }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // This would typically come from an API call to a backend service that calculates these metrics
  // For demo purposes, we're generating them here
  const healthMetrics: HealthMetric[] = [
    {
      name: 'Smart Contract Security',
      score: generateScore(protocol, 'security'),
      description: 'Assessment of code quality, audit history, and vulnerability risk.',
      weight: 0.30
    },
    {
      name: 'Liquidity Depth',
      score: generateScore(protocol, 'liquidity'),
      description: 'Evaluation of available liquidity and resistance to price slippage.',
      weight: 0.20
    },
    {
      name: 'Governance',
      score: generateScore(protocol, 'governance'),
      description: 'Analysis of governance decentralization and voting power distribution.',
      weight: 0.15
    },
    {
      name: 'Transparency',
      score: generateScore(protocol, 'transparency'),
      description: 'Measure of team transparency, documentation quality, and regular updates.',
      weight: 0.15
    },
    {
      name: 'Market Risk',
      score: generateScore(protocol, 'market'),
      description: 'Assessment of volatility, token economics, and market manipulation resistance.',
      weight: 0.10
    },
    {
      name: 'User Experience',
      score: generateScore(protocol, 'ux'),
      description: 'Evaluation of interface design, accessibility, and user feedback.',
      weight: 0.05
    },
    {
      name: 'Community Engagement',
      score: generateScore(protocol, 'community'),
      description: 'Measure of community size, activity, and support resources.',
      weight: 0.05
    }
  ];

  // Calculate the weighted health score
  const overallHealthScore = calculateOverallScore(healthMetrics);

  // Function to generate realistic scores based on protocol properties
  function generateScore(protocol: Protocol, category: string): number {
    // Base score - semi-random but influenced by the protocol's risk score
    let baseScore = Math.max(0, 100 - protocol.riskScore);
    
    // Add some randomness to make each category different
    baseScore = baseScore + (Math.random() * 20 - 10);
    
    // Adjust based on protocol properties
    if (protocol.tvl && category === 'liquidity') {
      // Higher TVL generally means better liquidity
      baseScore += protocol.tvl > 10000000 ? 15 : protocol.tvl > 1000000 ? 5 : -5;
    }
    
    if (protocol.anomalyCount && protocol.anomalyCount > 0) {
      // Anomalies negatively impact security and governance scores
      if (category === 'security' || category === 'governance') {
        baseScore -= protocol.anomalyCount * 5;
      }
    }
    
    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, baseScore));
  }

  // Calculate overall score as weighted average
  function calculateOverallScore(metrics: HealthMetric[]): number {
    const weightedSum = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
    return Math.round(weightedSum);
  }

  // Get appropriate color class based on score
  function getScoreColorClass(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  }

  function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Concerning';
    return 'Critical';
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Protocol Health Score</h2>
          <span 
            className={`text-xs px-2 py-1 rounded-full ${getRiskColor(100 - overallHealthScore)}`}
          >
            {getScoreLabel(overallHealthScore)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive assessment of {protocol.name}'s overall security and stability
        </p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button 
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('details')}
          >
            Detailed Metrics
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="p-6">
          <div className="mb-8 text-center">
            <div className="inline-block relative">
              <svg viewBox="0 0 36 36" className="w-32 h-32">
                <path
                  className="stroke-none fill-gray-200"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`stroke-none ${overallHealthScore >= 80 ? 'fill-green-500' : 
                    overallHealthScore >= 60 ? 'fill-blue-500' : 
                    overallHealthScore >= 40 ? 'fill-yellow-500' : 
                    overallHealthScore >= 20 ? 'fill-orange-500' : 'fill-red-500'}`}
                  strokeLinecap="round"
                  d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`}
                  strokeDasharray={`${overallHealthScore}, 100`}
                  strokeWidth="1"
                />
                <text x="18" y="20.35" className="fill-gray-800 font-bold text-5xl" textAnchor="middle">
                  {overallHealthScore}
                </text>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mt-2">Overall Health Score</h3>
            <p className="text-sm text-gray-600">Weighted average of all metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthMetrics.slice(0, 3).map((metric) => (
              <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  <span className={`font-bold ${getScoreColorClass(metric.score)}`}>
                    {metric.score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metric.score >= 80 ? 'bg-green-500' : 
                      metric.score >= 60 ? 'bg-blue-500' : 
                      metric.score >= 40 ? 'bg-yellow-500' : 
                      metric.score >= 20 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Recommendations</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                AI Generated
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Generate recommendations based on the lowest scoring metrics */}
              {healthMetrics
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((metric) => (
                  <div key={`rec-${metric.name}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium">Improve {metric.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {generateRecommendation(metric)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="p-6">
          <div className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-xs text-gray-600">Weight: {(metric.weight * 100).toFixed(0)}%</p>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColorClass(metric.score)}`}>
                    {metric.score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${metric.score >= 80 ? 'bg-green-500' : 
                      metric.score >= 60 ? 'bg-blue-500' : 
                      metric.score >= 40 ? 'bg-yellow-500' : 
                      metric.score >= 20 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700">{metric.description}</p>

                <div className="mt-3 bg-gray-50 rounded p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h5 className="text-xs font-medium text-gray-800">Analysis Note</h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {generateAnalysisNote(metric, protocol)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button 
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => window.open('/methodology', '_blank')}
            >
              Learn more about our scoring methodology
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
        Updated daily with on-chain data and auditor reports
      </div>
    </div>
  );
};

// Helper to generate contextual recommendations based on the metric
function generateRecommendation(metric: HealthMetric): string {
  const recommendations: Record<string, string[]> = {
    'Smart Contract Security': [
      'Consider a comprehensive audit from a top-tier security firm.',
      'Implement a bug bounty program to incentivize vulnerability reporting.',
      'Reduce contract complexity and improve test coverage.',
    ],
    'Liquidity Depth': [
      'Explore incentive programs to increase liquidity provider participation.',
      'Implement multi-tier liquidity pools to improve capital efficiency.',
      'Partner with other protocols to create deeper liquidity pools.',
    ],
    'Governance': [
      'Increase decentralization by distributing voting power more equitably.',
      'Improve governance documentation and make proposal process more accessible.',
      'Implement time locks and multi-signature requirements for critical changes.',
    ],
    'Transparency': [
      'Publish regular updates about development progress and roadmap.',
      'Improve documentation of protocol mechanics and risk factors.',
      'Make team information and credentials more accessible.',
    ],
    'Market Risk': [
      'Implement price impact limits to prevent market manipulation.',
      'Diversify oracle sources to reduce single points of failure.',
      'Consider more sustainable tokenomics with predictable emission schedules.',
    ],
    'User Experience': [
      'Conduct usability testing and implement UI/UX improvements.',
      'Add more educational content to help users understand protocol risks.',
      'Optimize transaction flows to minimize gas costs and steps.',
    ],
    'Community Engagement': [
      'Start regular community calls or AMAs to increase transparency.',
      'Create educational content to help users understand the protocol.',
      'Establish a community grant program to foster ecosystem growth.',
    ]
  };

  // Select a recommendation based on the score
  const options = recommendations[metric.name] || ['Improve overall protocol practices and documentation.'];
  
  if (metric.score < 30) {
    return `Critical priority: ${options[0]}`;
  } else if (metric.score < 50) {
    return `High priority: ${options[Math.min(1, options.length - 1)]}`;
  } else if (metric.score < 70) {
    return `Medium priority: ${options[Math.min(2, options.length - 1)]}`;
  } else {
    return `Maintain strength: Continue current practices and monitor for changes.`;
  }
}

// Helper to generate analysis notes
function generateAnalysisNote(metric: HealthMetric, protocol: Protocol): string {
  // Base notes based on metric categories
  const baseNotes: Record<string, string[]> = {
    'Smart Contract Security': [
      `${protocol.name} has undergone multiple audits and maintains high code quality standards.`,
      `${protocol.name} has had some audits but could benefit from additional security reviews.`,
      `${protocol.name} has minimal audit history or significant unresolved vulnerabilities.`
    ],
    'Liquidity Depth': [
      `${protocol.name} maintains deep liquidity pools with minimal slippage even for large trades.`,
      `${protocol.name} has adequate liquidity for medium-sized trades but shows slippage for larger amounts.`,
      `${protocol.name} suffers from thin liquidity, leading to high slippage and price impact.`
    ],
    'Governance': [
      `${protocol.name} has well-distributed governance with active participation and transparent processes.`,
      `${protocol.name} has functional governance but shows some centralization in voting power.`,
      `${protocol.name} exhibits highly centralized governance or low participation rates.`
    ],
    'Transparency': [
      `${protocol.name} provides comprehensive documentation and regular updates to the community.`,
      `${protocol.name} offers basic documentation and occasional updates on development.`,
      `${protocol.name} lacks clear documentation or regular communication with users.`
    ],
    'Market Risk': [
      `${protocol.name} demonstrates stable tokenomics and resistance to market manipulation.`,
      `${protocol.name} shows moderate vulnerability to market conditions and some tokenomic concerns.`,
      `${protocol.name} exhibits high volatility and significant vulnerability to market conditions.`
    ],
    'User Experience': [
      `${protocol.name} offers an intuitive interface with clear risk communication and efficient processes.`,
      `${protocol.name} provides a functional interface but has room for usability improvements.`,
      `${protocol.name} suffers from usability issues that could impact user adoption and safety.`
    ],
    'Community Engagement': [
      `${protocol.name} maintains an active, engaged community with strong support resources.`,
      `${protocol.name} has a growing community but limited engagement or support channels.`,
      `${protocol.name} shows minimal community activity or dedicated support resources.`
    ]
  };

  // Select appropriate note based on score
  const options = baseNotes[metric.name] || [`Analysis for ${metric.name} is being developed.`];
  
  if (metric.score >= 70) {
    return options[0];
  } else if (metric.score >= 40) {
    return options[1];
  } else {
    return options[2];
  }
}

export default ProtocolHealthScore; 