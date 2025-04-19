import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const INDEXER_URL = process.env.REACT_APP_INDEXER_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const indexerApi = axios.create({
  baseURL: INDEXER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Protocol endpoints
export const fetchProtocols = async () => {
  try {
    // Try to fetch from indexer first
    try {
      const response = await indexerApi.get('/api/protocols');
      return response.data;
    } catch (indexerError) {
      console.warn('Falling back to API for protocols:', indexerError);
      const response = await api.get('/api/protocols');
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching protocols:', error);
    throw error;
  }
};

export const fetchProtocolById = async (id: string) => {
  try {
    // Try to fetch from indexer first
    try {
      const response = await indexerApi.get(`/api/protocols/${id}`);
      return response.data;
    } catch (indexerError) {
      console.warn(`Falling back to API for protocol ${id}:`, indexerError);
      const response = await api.get(`/api/protocols/${id}`);
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching protocol with ID ${id}:`, error);
    throw error;
  }
};

// Alert endpoints
export const fetchAlerts = async (filters?: Record<string, any>) => {
  try {
    // Try to fetch from indexer first
    try {
      const response = await indexerApi.get('/api/alerts', { params: filters });
      return response.data;
    } catch (indexerError) {
      console.warn('Falling back to API for alerts:', indexerError);
      const response = await api.get('/api/alerts', { params: filters });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const markAlertAsRead = async (alertId: string) => {
  try {
    const response = await api.patch(`/api/alerts/${alertId}/read`, {
      read: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error marking alert ${alertId} as read:`, error);
    throw error;
  }
};

// Anomaly endpoints
export const fetchAnomalies = async (filters?: Record<string, any>) => {
  try {
    // Try to fetch from indexer first
    try {
      const response = await indexerApi.get('/api/anomalies', { params: filters });
      return response.data;
    } catch (indexerError) {
      console.warn('Falling back to API for anomalies:', indexerError);
      const response = await api.get('/api/anomalies', { params: filters });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    throw error;
  }
};

export const fetchAnomalyById = async (id: string) => {
  try {
    const response = await api.get(`/api/anomalies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching anomaly with ID ${id}:`, error);
    throw error;
  }
};

// Network stats endpoints
export const fetchNetworkStats = async () => {
  try {
    const response = await indexerApi.get('/api/network-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching network stats:', error);
    // Return mock data if the API call fails
    return [
      {
        name: 'ethereum',
        volume24h: 1200000000,
        activeBridges: 12,
        avgRiskScore: 25,
        volume7d: [800000000, 900000000, 1000000000, 1100000000, 1200000000, 1100000000, 900000000]
      },
      {
        name: 'arbitrum',
        volume24h: 800000000,
        activeBridges: 8,
        avgRiskScore: 30,
        volume7d: [600000000, 700000000, 750000000, 800000000, 850000000, 800000000, 750000000]
      },
      {
        name: 'optimism',
        volume24h: 600000000,
        activeBridges: 6,
        avgRiskScore: 28,
        volume7d: [500000000, 550000000, 600000000, 650000000, 600000000, 550000000, 500000000]
      },
      {
        name: 'polygon',
        volume24h: 900000000,
        activeBridges: 10,
        avgRiskScore: 22,
        volume7d: [700000000, 750000000, 800000000, 850000000, 900000000, 850000000, 800000000]
      },
      {
        name: 'base',
        volume24h: 500000000,
        activeBridges: 5,
        avgRiskScore: 32,
        volume7d: [400000000, 450000000, 500000000, 550000000, 500000000, 450000000, 400000000]
      }
    ];
  }
};

// User preferences
export const getUserPreferences = async (userId: string) => {
  try {
    const response = await api.get(`/api/users/${userId}/preferences`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching preferences for user ${userId}:`, error);
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, preferences: Record<string, any>) => {
  try {
    const response = await api.put(`/api/users/${userId}/preferences`, preferences);
    return response.data;
  } catch (error) {
    console.error(`Error updating preferences for user ${userId}:`, error);
    throw error;
  }
};

// ML model predictions
export const getAnomalyPrediction = async (transactionData: Record<string, any>) => {
  try {
    const response = await api.post('/api/ml/predict', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error getting anomaly prediction:', error);
    throw error;
  }
};

export default api; 