// Export all types for convenience
export * from './protocol';
export * from './anomaly';
export * from './alert';
export * from './transaction';
export * from './user';
export * from './notification'; 

// Add RiskAssessment interface
export interface RiskAssessment {
  tvlRisk: number;
  volatilityRisk: number;
  ageRisk: number;
  auditRisk: number;
  totalScore: number;
  timestamp: number;
} 