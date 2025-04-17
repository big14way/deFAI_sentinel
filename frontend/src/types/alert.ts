import { Protocol } from './protocol';
import { Anomaly, AnomalySeverity } from './anomaly';

export interface Alert {
  id: string;
  timestamp: number;
  protocol: Protocol;
  anomaly?: Anomaly;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  assignedTo?: string;
  resolvedAt?: number;
  resolvedBy?: string;
  actionTaken?: string;
  relatedAlerts?: string[];
  metadata?: Record<string, any>;
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertCategory {
  PRICE_ANOMALY = 'price_anomaly',
  LIQUIDITY_CHANGE = 'liquidity_change',
  CONTRACT_INTERACTION = 'contract_interaction',
  GOVERNANCE = 'governance',
  SECURITY = 'security',
  OPERATIONAL = 'operational',
  CUSTOM = 'custom'
}

export enum AlertType {
  ANOMALY_DETECTED = 'anomaly_detected',
  RISK_SCORE_CHANGE = 'risk_score_change',
  TVL_CHANGE = 'tvl_change',
  CONTRACT_UPGRADE = 'contract_upgrade',
  SECURITY_INCIDENT = 'security_incident',
  GOVERNANCE_PROPOSAL = 'governance_proposal',
  SYSTEM = 'system'
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  SNOOZED = 'snoozed'
}

export interface AlertFilters {
  protocolId?: string;
  severity?: AlertSeverity[];
  category?: AlertCategory[];
  status?: AlertStatus[];
  dateRange?: {
    start: number;
    end: number;
  };
  assignedTo?: string;
  searchTerm?: string;
} 