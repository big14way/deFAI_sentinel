import { Protocol } from './protocol';

export interface ContractAnomaly {
  protocol: string;
  anomalyType: string;
  description: string;
  severity: number; // 1-5, 5 being most severe
  timestamp: number;
  resolved: boolean;
}

export interface Anomaly {
  id: string;
  protocolId: string;
  protocol?: Protocol;
  timestamp: number;
  type: 'price' | 'tvl' | 'liquidation' | 'governance' | 'utilization' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'active' | 'resolved' | 'monitoring' | 'false_positive';
  metrics?: Record<string, any>;
  relatedTransactions?: string[];
  resolutionDetails?: ResolutionDetails;
}

export interface ResolutionDetails {
  timestamp: number;
  resolvedBy?: string;
  resolution: string;
  notes?: string;
}

export enum AnomalyType {
  PRICE_DEVIATION = 'price_deviation',
  VOLUME_SPIKE = 'volume_spike',
  UNUSUAL_TRANSACTION = 'unusual_transaction',
  PATTERN_RECOGNITION = 'pattern_recognition',
  RISK_SCORE_CHANGE = 'risk_score_change',
  GOVERNANCE_ACTION = 'governance_action',
  SMART_CONTRACT_INTERACTION = 'smart_contract_interaction',
  FLASH_LOAN = 'flash_loan'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DetectionMethod {
  ML_MODEL = 'ml_model',
  RULE_BASED = 'rule_based',
  THRESHOLD = 'threshold',
  EXTERNAL_FEED = 'external_feed',
  HUMAN_FLAGGED = 'human_flagged'
}

export interface AnomalyFeature {
  name: string;
  value: number | string | boolean;
  weight?: number;
  description?: string;
  normalRange?: {
    min: number;
    max: number;
  };
}

export interface AnomalyFilters {
  protocolId?: string;
  type?: AnomalyType[];
  severity?: AnomalySeverity[];
  dateRange?: {
    start: number;
    end: number;
  };
  detectionMethod?: DetectionMethod[];
  falsePositive?: boolean;
  minScore?: number;
  searchTerm?: string;
} 