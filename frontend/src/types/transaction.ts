export interface Transaction {
  id: string;
  hash: string;
  chainId: number;
  chainName: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  methodId: string;
  methodName?: string;
  status: TransactionStatus;
  protocolId?: string;
  anomalyScore?: number;
  riskScore?: number;
  relatedAddresses?: string[];
  tags?: TransactionTag[];
  metadata?: Record<string, any>;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export enum TransactionTag {
  FLASH_LOAN = 'flash_loan',
  LARGE_TRANSFER = 'large_transfer',
  UNUSUAL_PATTERN = 'unusual_pattern',
  GOVERNANCE = 'governance',
  LIQUIDATION = 'liquidation',
  ORACLE_UPDATE = 'oracle_update',
  EXPLOIT = 'exploit',
  HIGH_GAS = 'high_gas'
}

export interface TransactionEvent {
  id: string;
  transactionId: string;
  logIndex: number;
  address: string;
  event: string;
  args: Record<string, any>;
  timestamp: number;
  blockNumber: number;
  relevanceScore?: number;
}

export interface TransactionFilters {
  protocolId?: string;
  address?: string;
  dateFrom?: number;
  dateTo?: number;
  status?: TransactionStatus;
  tags?: TransactionTag[];
  minValue?: string;
  minRiskScore?: number;
} 