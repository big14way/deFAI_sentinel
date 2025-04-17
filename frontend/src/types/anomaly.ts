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
  timestamp: number;
  protocol: Protocol;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  score: number;
  features: AnomalyFeature[];
  relatedTransactions?: string[];
  detectionMethod: DetectionMethod;
  falsePositive: boolean;
  metadata?: Record<string, any>;
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