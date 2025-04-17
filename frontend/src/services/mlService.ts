import axios from 'axios';

const ML_API_URL = process.env.REACT_APP_ML_MODEL_ENDPOINT || 'http://localhost:5000/predict';

export interface TransactionData {
  value: number;
  gasPrice: number;
  timestamp: number;
  nonce: number;
  gasLimit: number;
  [key: string]: any; // For any additional fields
}

export interface AnomalyPrediction {
  transactionHash: string;
  score: number;
  isAnomaly: boolean;
  features: string[];
  confidence: number;
  timestamp: number;
}

/**
 * Detect anomalies in transaction data using the ML model API
 */
export const detectAnomalies = async (transactions: TransactionData[]): Promise<AnomalyPrediction[]> => {
  try {
    const response = await axios.post(ML_API_URL, {
      transactions: transactions
    });
    
    return response.data.predictions;
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw error;
  }
};

/**
 * Get risk score for a protocol based on recent transactions
 */
export const getProtocolRiskScore = async (protocolAddress: string): Promise<number> => {
  try {
    const response = await axios.post(`${ML_API_URL}/risk-score`, {
      protocolAddress
    });
    
    return response.data.riskScore;
  } catch (error) {
    console.error(`Error getting risk score for protocol ${protocolAddress}:`, error);
    // Return a default medium risk score in case of error
    return 50;
  }
};

/**
 * Mock function to generate simulated anomaly data for testing
 * This can be used when the ML API is not available
 */
export const generateMockAnomalyData = (count: number = 5): AnomalyPrediction[] => {
  const anomalies: AnomalyPrediction[] = [];
  
  for (let i = 0; i < count; i++) {
    const score = Math.random();
    anomalies.push({
      transactionHash: `0x${Math.random().toString(16).substring(2,42)}`,
      score: score,
      isAnomaly: score > 0.7,
      features: [
        'Unusual gas price',
        'Atypical transaction value',
        'Strange contract interaction'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      confidence: 0.5 + (Math.random() * 0.5),
      timestamp: Date.now() - Math.floor(Math.random() * 86400000)
    });
  }
  
  return anomalies.sort((a, b) => b.timestamp - a.timestamp);
};

export default {
  detectAnomalies,
  getProtocolRiskScore,
  generateMockAnomalyData
}; 