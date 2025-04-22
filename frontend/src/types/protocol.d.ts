import { RiskAssessment } from './index';

export interface Protocol {
  id: string;
  name: string;
  address: string;
  chain: string;
  category: string;
  riskScore: number;
  status: string;
  lastUpdated: number;
  anomalyCount: number;
  lastAnomaly?: number;
  isActive: boolean;
  lastUpdateTime: number;
  tvl?: number;
  totalTokens?: number;
  trustScore?: number;
  priceData?: {
    currentPrice: number;
    priceChange24h: number;
    volatility: number;
  };
  deployments?: Record<string, string>;
  description?: string;
  network?: string;
  url?: string;
  logoUrl?: string;
  createdAt?: number;
  audited?: boolean;
  volatility?: number;
  riskComponents?: RiskAssessment;
  metrics?: {
    tvl?: number;
    volume24h?: number;
    users?: number;
    transactions?: number;
    [key: string]: any;
  };
}

export interface ProtocolExposure {
  protocolAddress: string;
  protocolName: string;
  amount: number;
  percentage: number;
  riskScore: number;
  assets: any[];
} 