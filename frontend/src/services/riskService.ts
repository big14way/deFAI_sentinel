import axios from 'axios';
import * as coinGeckoService from './coinGeckoService';

const DEFI_SAFETY_URL = 'https://www.defisafety.com/api';
const DEFILLAMA_API = 'https://api.llama.fi';
const BLOCKCHAIN_ANALYTICS_URL = 'https://api.blockchain-analytics.io';

// Interface for calculated risk score components
export interface RiskScoreComponents {
  tvlRisk: number;
  volatilityRisk: number;
  auditRisk: number;
  codeRisk: number;
  ageRisk: number;
  totalScore: number;
  explanation: string[];
}

// Real-time risk assessment based on TVL data from DeFi Llama
export const calculateRiskFromTvl = async (protocolSlug: string): Promise<{ riskScore: number; explanation: string }> => {
  try {
    const response = await axios.get(`${DEFILLAMA_API}/protocol/${protocolSlug}`);
    const data = response.data;
    
    // Calculate risk based on TVL
    let riskScore = 50; // Default medium risk
    let explanation = '';
    
    if (data.tvl) {
      // Higher TVL = lower risk
      if (data.tvl > 1000000000) { // > $1B
        riskScore -= 20;
        explanation = 'Very high TVL indicates significant user trust and liquidity';
      } else if (data.tvl > 100000000) { // > $100M
        riskScore -= 10;
        explanation = 'High TVL indicates good user trust and liquidity';
      } else if (data.tvl < 10000000) { // < $10M
        riskScore += 15;
        explanation = 'Low TVL may indicate limited user adoption or liquidity';
      } else if (data.tvl < 1000000) { // < $1M
        riskScore += 25;
        explanation = 'Very low TVL indicates high liquidity risk';
      }
      
      // TVL change risk
      if (data.tvlChange24h) {
        // Sudden large drop in TVL is concerning
        if (data.tvlChange24h < -20) {
          riskScore += 25;
          explanation += ' | Severe TVL drop in last 24h suggests possible concerns';
        } else if (data.tvlChange24h < -10) {
          riskScore += 15;
          explanation += ' | Significant TVL drop in last 24h';
        }
        
        // Extreme growth can also indicate risk (pump and dump)
        if (data.tvlChange24h > 50) {
          riskScore += 10;
          explanation += ' | Unusual rapid TVL growth could be volatile';
        }
      }
    } else {
      riskScore += 30;
      explanation = 'No TVL data available, indicating possible high risk';
    }
    
    // Cap risk score between 1-100
    riskScore = Math.max(1, Math.min(100, riskScore));
    
    return { riskScore, explanation };
  } catch (error) {
    console.error(`Error calculating risk from TVL for ${protocolSlug}:`, error);
    return { riskScore: 50, explanation: 'Error calculating TVL-based risk' };
  }
};

// Calculate risk based on token price volatility from CoinGecko
export const calculateVolatilityRisk = async (tokenId: string): Promise<{ riskScore: number; explanation: string }> => {
  try {
    // Get historical price data
    const priceData = await coinGeckoService.getTokenHistoricalData(tokenId, 30, 'usd');
    
    if (!priceData || priceData.length < 5) {
      return { riskScore: 50, explanation: 'Insufficient price data available' };
    }
    
    // Calculate price volatility
    const percentChanges: number[] = [];
    for (let i = 1; i < priceData.length; i++) {
      const prevPrice = priceData[i-1][1];
      const currPrice = priceData[i][1];
      const percentChange = ((currPrice - prevPrice) / prevPrice) * 100;
      percentChanges.push(Math.abs(percentChange));
    }
    
    // Calculate average daily volatility
    const avgVolatility = percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
    
    // Assign risk based on volatility
    let riskScore = 50;
    let explanation = '';
    
    if (avgVolatility > 15) {
      riskScore = 90;
      explanation = 'Extreme price volatility indicates very high risk';
    } else if (avgVolatility > 10) {
      riskScore = 75;
      explanation = 'High price volatility indicates significant risk';
    } else if (avgVolatility > 5) {
      riskScore = 60;
      explanation = 'Moderate price volatility';
    } else if (avgVolatility > 2) {
      riskScore = 40;
      explanation = 'Low price volatility suggests relative stability';
    } else {
      riskScore = 25;
      explanation = 'Very low price volatility indicates stability';
    }
    
    return { riskScore, explanation };
  } catch (error) {
    console.error(`Error calculating volatility risk for ${tokenId}:`, error);
    return { riskScore: 50, explanation: 'Error calculating price volatility risk' };
  }
};

// Combined risk assessment using multiple data sources
export const getComprehensiveRiskAssessment = async (
  protocolSlug: string, 
  tokenId?: string
): Promise<RiskScoreComponents> => {
  try {
    // Start with default risk components
    const riskComponents: RiskScoreComponents = {
      tvlRisk: 50,
      volatilityRisk: 50,
      auditRisk: 50,
      codeRisk: 50,
      ageRisk: 50,
      totalScore: 50,
      explanation: ['Calculating risk assessment...']
    };
    
    // Get TVL-based risk
    try {
      const tvlRisk = await calculateRiskFromTvl(protocolSlug);
      riskComponents.tvlRisk = tvlRisk.riskScore;
      riskComponents.explanation.push(`TVL Risk: ${tvlRisk.explanation}`);
    } catch (error) {
      console.warn('Error calculating TVL risk:', error);
    }
    
    // Get volatility risk if token ID is provided
    if (tokenId) {
      try {
        const volatilityRisk = await calculateVolatilityRisk(tokenId);
        riskComponents.volatilityRisk = volatilityRisk.riskScore;
        riskComponents.explanation.push(`Volatility Risk: ${volatilityRisk.explanation}`);
      } catch (error) {
        console.warn('Error calculating volatility risk:', error);
      }
    }
    
    // Age risk - newer protocols are riskier
    try {
      const llamaResponse = await axios.get(`${DEFILLAMA_API}/protocol/${protocolSlug}`);
      const creationDate = llamaResponse.data.creationDate || Date.now();
      const ageInDays = (Date.now() - creationDate) / (1000 * 60 * 60 * 24);
      
      if (ageInDays < 30) {
        riskComponents.ageRisk = 90;
        riskComponents.explanation.push('Age Risk: Very new protocol (< 30 days)');
      } else if (ageInDays < 90) {
        riskComponents.ageRisk = 70;
        riskComponents.explanation.push('Age Risk: Relatively new protocol (< 3 months)');
      } else if (ageInDays < 365) {
        riskComponents.ageRisk = 50;
        riskComponents.explanation.push('Age Risk: Established protocol (< 1 year)');
      } else {
        riskComponents.ageRisk = 30;
        riskComponents.explanation.push('Age Risk: Mature protocol (> 1 year)');
      }
    } catch (error) {
      console.warn('Error calculating age risk:', error);
    }
    
    // Calculate weighted average for total risk score
    riskComponents.totalScore = Math.round(
      (riskComponents.tvlRisk * 0.35) +
      (riskComponents.volatilityRisk * 0.25) +
      (riskComponents.auditRisk * 0.15) +
      (riskComponents.codeRisk * 0.1) +
      (riskComponents.ageRisk * 0.15)
    );
    
    return riskComponents;
  } catch (error) {
    console.error('Error in comprehensive risk assessment:', error);
    return {
      tvlRisk: 60,
      volatilityRisk: 60,
      auditRisk: 60,
      codeRisk: 60,
      ageRisk: 60,
      totalScore: 60,
      explanation: ['Error calculating risk assessment']
    };
  }
};

export default {
  calculateRiskFromTvl,
  calculateVolatilityRisk,
  getComprehensiveRiskAssessment
}; 