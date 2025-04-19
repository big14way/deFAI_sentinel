import React, { useState, useEffect } from 'react';
import { UserPortfolio, RiskRecommendation } from '../../types/portfolio';
import { usePortfolio } from '../../hooks/usePortfolio';
import { formatCurrency, getRiskColor } from '../../utils/formatters';
import StatCard from '../dashboard/StatCard';
import LoadingSpinner from '../LoadingSpinner';

interface PortfolioRiskAssessmentProps {
  userAddress?: string;
  onConnectWallet: () => void;
}

const PortfolioRiskAssessment: React.FC<PortfolioRiskAssessmentProps> = ({ 
  userAddress,
  onConnectWallet 
}) => {
  const { portfolio, recommendations, isLoading, error, refreshPortfolio } = usePortfolio(userAddress);
  const [activeTab, setActiveTab] = useState<'overview' | 'exposures' | 'recommendations'>('overview');
  
  // Track if wallet was ever connected to prevent auto-disconnect issues
  const [wasWalletEverConnected, setWasWalletEverConnected] = useState(false);
  
  // Update state when wallet is connected
  useEffect(() => {
    if (userAddress) {
      setWasWalletEverConnected(true);
    }
  }, [userAddress]);
  
  // Fix for issue where wallet appears to disconnect when navigating
  // If the wallet was connected before, but now appears disconnected,
  // prompt user to manually reconnect rather than showing the standard connect prompt
  const shouldShowReconnectPrompt = wasWalletEverConnected && !userAddress;
  
  // Function to render wallet connect prompt
  const renderConnectWallet = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <div className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-4">
        {shouldShowReconnectPrompt ? 'Reconnect Your Wallet' : 'Connect Your Wallet'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {shouldShowReconnectPrompt 
          ? 'Your wallet connection appears to have been lost. Please reconnect to continue viewing your portfolio.' 
          : 'Connect your wallet to view your portfolio risk assessment and receive personalized recommendations.'}
      </p>
      <button 
        onClick={onConnectWallet}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {shouldShowReconnectPrompt ? 'Reconnect Wallet' : 'Connect Wallet'}
      </button>
    </div>
  );
  
  // Function to render loading state
  const renderLoading = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex justify-center items-center">
      <LoadingSpinner />
      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading portfolio data...</span>
    </div>
  );
  
  // Function to render error state
  const renderError = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
        <h3 className="font-medium mb-2">Error Loading Portfolio</h3>
        <p>{error || 'An unexpected error occurred.'}</p>
        <button 
          onClick={() => refreshPortfolio()}
          className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
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
  
  // Function to render risk recommendations
  const renderRecommendations = () => {
    if (!recommendations.length) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your portfolio looks good! There are no risk-reduction recommendations at this time.
          </p>
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
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  {rec.actionSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Potential risk reduction: {rec.potentialRiskReduction.toFixed(1)} points</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Main render function
  if (!userAddress) {
    return renderConnectWallet();
  }
  
  if (isLoading) {
    return renderLoading();
  }
  
  if (error) {
    return renderError();
  }
  
  return (
    <div>
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