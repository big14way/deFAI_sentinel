export enum ProtocolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNDER_REVIEW = 'under_review'
}

export enum ProtocolCategory {
  LENDING = 'lending',
  DEX = 'dex',
  YIELD = 'yield',
  BRIDGE = 'bridge',
  DERIVATIVES = 'derivatives',
  INSURANCE = 'insurance',
  ASSET = 'asset',
  PAYMENT = 'payment',
  OTHER = 'other'
}

export interface ChainInfo {
  id: number;
  name: string;
  iconUrl?: string;
  rpcUrl?: string;
  explorerUrl?: string;
  color?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface Protocol {
  id?: string; // Added for compatibility with existing components
  address: string;
  name: string;
  riskScore: number;
  isActive: boolean;
  lastUpdateTime: number; // timestamp in milliseconds
  anomalyCount: number;
  lastAnomalyTime?: number; // timestamp in milliseconds
  tvl?: number; // Not from contract, would be fetched elsewhere
  
  // Added fields for compatibility with existing components
  logoUrl?: string;
  status?: string;
  chain?: string;
  chainId?: number; // Added for cross-chain support
  category?: string;
  lastUpdated?: number; // Alias for lastUpdateTime
  lastAnomaly?: number; // Alias for lastAnomalyTime
  
  // Cross-chain specific fields
  deployments?: { [chainId: number]: string }; // Map of chainId to contract address
  bridgeAddresses?: string[]; // List of associated bridge contract addresses
  crossChainRiskScore?: number; // Risk score calculated considering cross-chain factors
}

// Added for cross-chain support
export interface CrossChainLink {
  sourceChainId: number;
  targetChainId: number;
  sourceProtocolAddress: string;
  targetProtocolAddress: string;
  bridgeAddress?: string;
  linkType: 'bridge' | 'wrapper' | 'governance' | 'other';
  riskScore: number;
  lastActivity?: number;
  volumeLast24h?: number;
}

export interface ProtocolSocialLinks {
  twitter?: string;
  discord?: string;
  telegram?: string;
  github?: string;
  medium?: string;
}

export interface ProtocolFilters {
  category?: ProtocolCategory;
  status?: ProtocolStatus;
  minRiskScore?: number;
  maxRiskScore?: number;
  hasAnomalies?: boolean;
  searchTerm?: string;
  chainId?: number;
  tags?: string[];
}

export interface ProtocolRiskFactor {
  id: string;
  protocolId: string;
  category: RiskFactorCategory;
  name: string;
  description: string;
  severity: RiskSeverity;
  weight: number;
  lastUpdated: number;
  status: RiskFactorStatus;
  recommendations?: string[];
}

export interface ProtocolMetrics {
  tvl: number;
  maxTVL: number;
  userCount: number;
  maxUsers: number;
  transactionVolume: number;
  maxVolume: number;
  anomalyCount: number;
  maxAnomalies: number;
  userExposure?: number;
}

export enum RiskFactorCategory {
  SMART_CONTRACT = 'smart_contract',
  CENTRALIZATION = 'centralization',
  GOVERNANCE = 'governance',
  ORACLE = 'oracle',
  COLLATERAL = 'collateral',
  MARKET = 'market',
  REGULATORY = 'regulatory',
  OPERATIONAL = 'operational',
  CROSS_CHAIN = 'cross_chain' // Added for cross-chain risks
}

export enum RiskSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum RiskFactorStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  MONITORING = 'monitoring',
  IGNORED = 'ignored'
} 