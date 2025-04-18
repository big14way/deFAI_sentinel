import { useState, useEffect } from 'react';
import { UserPortfolio, RiskRecommendation } from '../types/portfolio';
import { getUserExposures, calculateUserRiskScore } from '../services/web3';
import { getProtocolByAddress } from '../services/web3';

interface UsePortfolioResult {
  portfolio: UserPortfolio | null;
  recommendations: RiskRecommendation[];
  isLoading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user portfolio data
 * @param userAddress The Ethereum address of the user
 * @returns Portfolio data, recommendations, loading state, and error information
 */
export const usePortfolio = (userAddress?: string): UsePortfolioResult => {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [recommendations, setRecommendations] = useState<RiskRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    if (!userAddress) {
      setError('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user exposures from blockchain or API
      const userExposures = await getUserExposures(userAddress);
      
      // Calculate total value
      const totalValue = userExposures.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Calculate portfolio risk score
      const riskScore = await calculateUserRiskScore(userAddress);
      
      // Fetch additional protocol data for each exposure
      const exposuresWithDetails = await Promise.all(
        userExposures.map(async (exposure) => {
          const protocol = await getProtocolByAddress(exposure.protocolAddress);
          return {
            ...exposure,
            protocolName: protocol.name,
            percentage: totalValue > 0 ? (exposure.amount / totalValue) * 100 : 0,
            riskScore: protocol.riskScore,
            // Placeholder for actual assets data which would come from a more detailed API
            assets: exposure.assets || []
          };
        })
      );

      // Create portfolio object
      const portfolioData: UserPortfolio = {
        address: userAddress,
        totalValue,
        exposures: exposuresWithDetails,
        riskScore,
        lastUpdated: Math.floor(Date.now() / 1000)
      };

      setPortfolio(portfolioData);
      
      // Generate recommendations based on portfolio data
      generateRecommendations(portfolioData);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (portfolioData: UserPortfolio) => {
    const newRecommendations: RiskRecommendation[] = [];
    
    // Find high-risk exposures
    const highRiskExposures = portfolioData.exposures.filter(exp => exp.riskScore >= 70);
    
    // Generate exit recommendations for high-risk protocols
    highRiskExposures.forEach(exposure => {
      newRecommendations.push({
        id: `exit-${exposure.protocolAddress}`,
        type: 'exit',
        description: `Exit ${exposure.protocolName} due to high risk score (${exposure.riskScore}/100)`,
        severity: exposure.riskScore >= 85 ? 'critical' : 'high',
        protocolAddress: exposure.protocolAddress,
        actionSteps: [
          `Withdraw your assets (${exposure.amount.toFixed(2)} USD) from ${exposure.protocolName}`,
          'Move to a lower risk protocol or stablecoin position'
        ],
        potentialRiskReduction: ((exposure.riskScore * exposure.percentage) / 100) * 0.8 // Estimated risk reduction
      });
    });
    
    // Check for portfolio concentration (>40% in one protocol)
    const highConcentrationExposures = portfolioData.exposures.filter(exp => exp.percentage > 40);
    highConcentrationExposures.forEach(exposure => {
      newRecommendations.push({
        id: `diversify-${exposure.protocolAddress}`,
        type: 'diversify',
        description: `Reduce concentration in ${exposure.protocolName} (${exposure.percentage.toFixed(1)}% of portfolio)`,
        severity: 'medium',
        protocolAddress: exposure.protocolAddress,
        actionSteps: [
          `Reduce position in ${exposure.protocolName} by at least 20%`,
          'Spread assets across 3-5 different protocols with low correlation'
        ],
        potentialRiskReduction: 5 // Fixed value for simplicity
      });
    });
    
    // If overall portfolio risk is high, suggest rebalancing
    if (portfolioData.riskScore > 65) {
      newRecommendations.push({
        id: 'rebalance-portfolio',
        type: 'rebalance',
        description: 'Rebalance portfolio to reduce overall risk exposure',
        severity: portfolioData.riskScore > 80 ? 'critical' : 'high',
        actionSteps: [
          'Reduce exposure to high-risk protocols',
          'Increase allocation to protocols with risk scores below 40',
          'Consider adding stablecoin positions as a safety measure'
        ],
        potentialRiskReduction: 15 // Estimated risk reduction from rebalancing
      });
    }
    
    setRecommendations(newRecommendations);
  };

  // Initial load and refresh when address changes
  useEffect(() => {
    if (userAddress) {
      fetchPortfolioData();
    } else {
      setPortfolio(null);
      setRecommendations([]);
      setError(null);
    }
  }, [userAddress]);

  return {
    portfolio,
    recommendations,
    isLoading,
    error,
    refreshPortfolio: fetchPortfolioData
  };
}; 