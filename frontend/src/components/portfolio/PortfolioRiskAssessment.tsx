import React, { useState, useEffect } from 'react';
import { UserPortfolio, RiskRecommendation } from '../../types/portfolio';
import { usePortfolio } from '../../hooks/usePortfolio';
import { formatCurrency, getRiskColor } from '../../utils/formatters';
// Fix import to match correct function name or remove if not needed
// import { getUserExposure, calculateUserRiskScore } from '../../services/web3';
import StatCard from '../dashboard/StatCard';
import { LoadingSpinner } from '../LoadingSpinner';

// Mock portfolio data for development
const MOCK_PORTFOLIO: UserPortfolio = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  totalValue: 15420.75,
  riskScore: 63,
  lastUpdated: Math.floor(Date.now() / 1000),
  exposures: [
    {
      protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      protocolName: 'Aave',
      amount: 5400.25,
      percentage: 35.02,
      riskScore: 25,
      lastUpdated: Math.floor(Date.now() / 1000),
      assets: []
    },
    {
      protocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      protocolName: 'Uniswap',
      amount: 3800.50,
      percentage: 24.65,
      riskScore: 40,
      lastUpdated: Math.floor(Date.now() / 1000),
      assets: []
    },
    {
      protocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      protocolName: 'Compound',
      amount: 3200.00,
      percentage: 20.75,
      riskScore: 35,
      lastUpdated: Math.floor(Date.now() / 1000),
      assets: []
    },
    {
      protocolAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
      protocolName: 'Chainlink',
      amount: 3020.00,
      percentage: 19.58,
      riskScore: 72,
      lastUpdated: Math.floor(Date.now() / 1000),
      assets: []
    }
  ]
};

// Mock recommendations
const MOCK_RECOMMENDATIONS: RiskRecommendation[] = [
  {
    id: 'rec-1',
    type: 'exit',
    description: 'Exit Chainlink due to high risk score (72/100)',
    severity: 'high',
    protocolAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    actionSteps: [
      'Withdraw your assets (3020.00 USD) from Chainlink',
      'Move to a lower risk protocol or stablecoin position'
    ],
    potentialRiskReduction: 11.2
  },
  {
    id: 'rec-2',
    type: 'diversify',
    description: 'Reduce concentration in Aave (35.02% of portfolio)',
    severity: 'medium',
    protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    actionSteps: [
      'Reduce position in Aave by at least 20%',
      'Spread assets across 3-5 different protocols with low correlation'
    ],
    potentialRiskReduction: 5
  },
  {
    id: 'rec-3',
    type: 'rebalance',
    description: 'Rebalance portfolio to reduce overall risk exposure',
    severity: 'medium',
    actionSteps: [
      'Reduce exposure to high-risk protocols',
      'Increase allocation to protocols with risk scores below 40',
      'Consider adding stablecoin positions as a safety measure'
    ],
    potentialRiskReduction: 15
  }
];

interface PortfolioRiskAssessmentProps {
  userAddress?: string;
  onConnectWallet?: () => void;
}

const PortfolioRiskAssessment: React.FC<PortfolioRiskAssessmentProps> = ({ 
  userAddress,
  onConnectWallet 
}) => {
  // Use state variables to manage portfolio data instead of the hook
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(MOCK_PORTFOLIO);
  const [recommendations, setRecommendations] = useState<RiskRecommendation[]>(MOCK_RECOMMENDATIONS);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'exposures' | 'recommendations'>('overview');
  
  // Track if wallet was ever connected to prevent auto-disconnect issues
  const [wasWalletEverConnected, setWasWalletEverConnected] = useState(false);
  
  // Update state when wallet is connected
  useEffect(() => {
    if (userAddress) {
      setWasWalletEverConnected(true);
    }
  }, [userAddress]);
  
  // Handle wallet connection
  const handleConnectWallet = () => {
    if (onConnectWallet) {
      onConnectWallet();
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading portfolio data...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return renderError();
  }
  
  // Function to render error state
  function renderError() {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          <h3 className="font-medium mb-2">Error Loading Portfolio</h3>
          <p>{error || 'An unexpected error occurred.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Function to render portfolio overview
  const renderOverview = () => {
    if (!portfolio) return null;
    
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(portfolio.totalValue)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="Number of Protocols"
            value={portfolio.exposures.length}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Portfolio Risk Score"
            value={`${portfolio.riskScore.toFixed(1)}/100`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color={portfolio.riskScore > 70 ? "red" : portfolio.riskScore > 40 ? "amber" : "green"}
          />
          <StatCard
            title="High Risk Exposure"
            value={`${(portfolio.exposures.filter(e => e.riskScore > 70).reduce((sum, e) => sum + e.amount, 0) / portfolio.totalValue * 100).toFixed(1)}%`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Portfolio Risk Summary</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className={`h-4 rounded-full ${getRiskColor(100 - portfolio.riskScore)}`} 
              style={{ width: `${portfolio.riskScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span>Low Risk</span>
            <span>Medium Risk</span>
            <span>High Risk</span>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Risk Assessment</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {
                portfolio.riskScore > 70 ? 
                  "Your portfolio has a high risk level. Consider reducing exposure to high-risk protocols and diversifying your assets." :
                portfolio.riskScore > 40 ?
                  "Your portfolio has a moderate risk level. Review the recommendations to potentially improve your risk profile." :
                  "Your portfolio has a low risk level. Keep monitoring for any changes in protocol risk scores."
              }
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to render portfolio exposures
  const renderExposures = () => {
    if (!portfolio) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Protocol Exposures</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protocol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exposure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% of Portfolio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Score</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolio.exposures.map((exposure) => (
                <tr key={exposure.protocolAddress}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{exposure.protocolName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{exposure.protocolAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(exposure.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exposure.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(100 - exposure.riskScore)}`}>
                      {exposure.riskScore} / 100
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
  
  // Function to render recommendations
  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Recommendations</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Your portfolio is in good shape! We don't have any specific recommendations at this time.
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className={`px-6 py-4 ${
              rec.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20' :
              rec.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20' :
              rec.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-medium ${
                  rec.severity === 'critical' ? 'text-red-700 dark:text-red-400' :
                  rec.severity === 'high' ? 'text-orange-700 dark:text-orange-400' :
                  rec.severity === 'medium' ? 'text-yellow-700 dark:text-yellow-400' :
                  'text-blue-700 dark:text-blue-400'
                }`}>
                  {rec.description}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                  rec.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' :
                  rec.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                }`}>
                  {rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Actions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {rec.actionSteps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{step}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Potential Risk Reduction:
                  </span>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 dark:bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(rec.potentialRiskReduction * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {rec.potentialRiskReduction.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Risk Assessment</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View your DeFi protocol exposures, risk analysis, and personalized recommendations to improve your portfolio security.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'exposures' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('exposures')}
            >
              Protocol Exposures
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('recommendations')}
            >
              Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
            </button>
          </nav>
        </div>
      </div>
      
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'exposures' && renderExposures()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default PortfolioRiskAssessment; 