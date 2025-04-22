// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Default risk threshold settings
export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
  HIGH: 100
};

// Feature flags
export const FEATURES = {
  CROSS_CHAIN_MONITORING: true,
  PORTFOLIO_TRACKING: true,
  GOVERNANCE_MONITORING: true,
  RISK_SIMULATION: true
};

// Dashboard configuration
export const DASHBOARD_CONFIG = {
  DEFAULT_DATA_SOURCE: 'live', // 'live' or 'mock'
  REFRESH_INTERVAL: 300000, // 5 minutes
  MAX_RECENT_ANOMALIES: 5
};

// Default network labels and colors
export const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    color: '#627EEA'
  },
  polygon: {
    name: 'Polygon',
    color: '#8247E5'
  },
  bsc: {
    name: 'BNB Chain',
    color: '#F3BA2F'
  },
  bnb: {
    name: 'BNB Chain',
    color: '#F3BA2F'
  },
  arbitrum: {
    name: 'Arbitrum',
    color: '#28A0F0'
  },
  optimism: {
    name: 'Optimism',
    color: '#FF0420'
  },
  avalanche: {
    name: 'Avalanche',
    color: '#E84142'
  },
  fantom: {
    name: 'Fantom',
    color: '#1969FF'
  }
}; 