import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Protocol endpoints
export const fetchProtocols = async () => {
  try {
    const response = await api.get('/api/protocols');
    return response.data;
  } catch (error) {
    console.error('Error fetching protocols:', error);
    throw error;
  }
};

export const fetchProtocolById = async (id: string) => {
  try {
    const response = await api.get(`/api/protocols/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching protocol with ID ${id}:`, error);
    throw error;
  }
};

// Alert endpoints
export const fetchAlerts = async (filters?: Record<string, any>) => {
  try {
    const response = await api.get('/api/alerts', { params: filters });
    return response.data;
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
    const response = await api.get('/api/anomalies', { params: filters });
    return response.data;
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