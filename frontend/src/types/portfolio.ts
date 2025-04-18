import { Protocol } from '.';

export interface UserPortfolio {
  address: string; // User wallet address
  totalValue: number; // Total portfolio value in USD
  exposures: ProtocolExposure[];
  riskScore: number; // Overall portfolio risk score (0-100)
  lastUpdated: number; // Unix timestamp of last update
}

export interface ProtocolExposure {
  protocolAddress: string;
  protocolName: string;
  amount: number; // USD value
  percentage: number; // Percentage of portfolio
  riskScore: number; // Risk score of this protocol (0-100)
  assets: UserAsset[];
}

export interface UserAsset {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  amount: string; // Amount in token units
  value: number; // USD value
}

export interface RiskRecommendation {
  id: string;
  type: 'rebalance' | 'exit' | 'hedge' | 'diversify';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  protocolAddress?: string;
  actionSteps: string[];
  potentialRiskReduction: number; // Percentage points of risk reduction
}

export interface PortfolioRiskAssessmentProps {
  userAddress?: string;
  onConnect?: () => void;
}

export interface PortfolioState {
  portfolio: UserPortfolio | null;
  recommendations: RiskRecommendation[];
  isLoading: boolean;
  error: string | null;
} 