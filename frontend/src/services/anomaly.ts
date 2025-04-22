import axios from 'axios';
import { Anomaly } from '../types';
import { API_BASE_URL } from '../config';
import { getMockAnomalies } from './mockData';

/**
 * Get recent anomalies for all protocols
 */
export const getRecentAnomalies = async (useLiveData = true): Promise<Anomaly[]> => {
  // Use mock data if requested
  if (!useLiveData) {
    console.log('Using mock anomaly data');
    return getMockAnomalies();
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/anomalies/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent anomalies:', error);
    
    // Return empty array on error
    return [];
  }
};

/**
 * Get anomalies for a specific protocol
 */
export const getProtocolAnomalies = async (protocolId: string, useLiveData = true): Promise<Anomaly[]> => {
  // Use mock data if requested
  if (!useLiveData) {
    console.log('Using mock protocol anomaly data');
    const allAnomalies = getMockAnomalies();
    return allAnomalies.filter(anomaly => 
      anomaly.protocol && (anomaly.protocol.id === protocolId || anomaly.protocol.address === protocolId)
    );
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/anomalies/protocol/${protocolId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching anomalies for protocol ${protocolId}:`, error);
    
    // Return empty array on error
    return [];
  }
};

/**
 * Get a specific anomaly by ID
 */
export const getAnomalyById = async (anomalyId: string, useLiveData = true): Promise<Anomaly | null> => {
  // Use mock data if requested
  if (!useLiveData) {
    console.log('Using mock anomaly data for ID:', anomalyId);
    const allAnomalies = getMockAnomalies();
    return allAnomalies.find(anomaly => anomaly.id === anomalyId) || null;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/anomalies/${anomalyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching anomaly with ID ${anomalyId}:`, error);
    
    // Return null on error
    return null;
  }
}; 