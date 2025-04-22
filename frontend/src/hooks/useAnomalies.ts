import { useState, useEffect, useCallback } from 'react';
import { Anomaly, AnomalyType, AnomalySeverity, DetectionMethod } from '../types/anomaly';
import * as apiService from '../services/api';
import * as web3Service from '../services/web3Service';
import { Web3Anomaly } from '../services/web3Service';
import websocketService from '../services/websocket';

interface UseAnomaliesProps {
  protocolId?: string;
  useWeb3?: boolean;
  limit?: number;
}

export const useAnomalies = ({
  protocolId,
  useWeb3 = true,
  limit
}: UseAnomaliesProps = {}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedAnomalies: Anomaly[];
      
      if (useWeb3) {
        // Fetch from blockchain
        const web3Anomalies = await web3Service.getAllAnomalies();
        
        // Filter by protocol if needed
        const filteredAnomalies = protocolId
          ? web3Anomalies.filter(a => a.protocolAddress.toLowerCase() === protocolId.toLowerCase())
          : web3Anomalies;
          
        // Apply limit if specified
        const limitedAnomalies = limit 
          ? filteredAnomalies.slice(0, limit)
          : filteredAnomalies;
          
        // Convert to Anomaly type
        fetchedAnomalies = limitedAnomalies.map((a: Web3Anomaly) => ({
          id: a.id,
          timestamp: a.timestamp,
          protocolId: a.protocolAddress,
          protocol: {
            id: a.protocolAddress,
            name: '', // We don't have the name from the anomaly data
            address: a.protocolAddress,
            chain: 'Base',
            category: 'DeFi',
            riskScore: 0, // We don't have the risk score from the anomaly data
            status: 'active',
            lastUpdated: a.timestamp,
            isActive: true,
            lastUpdateTime: a.timestamp,
            anomalyCount: 0,
            deployments: {} // Required field for Protocol type
          },
          type: a.severity >= 3 ? 'price' : 
                a.severity === 2 ? 'tvl' : 'other',
          severity: a.severity === 3 ? 'high' : 
                   a.severity === 2 ? 'medium' : 'low',
          description: a.description,
          status: 'active',
          metrics: {
            score: a.severity * 33 // Map severity to a score (0-100)
          },
          relatedTransactions: []
        }));
      } else {
        // Fetch from API
        const filters = protocolId ? { protocolId } : undefined;
        fetchedAnomalies = await apiService.fetchAnomalies(filters);
        
        // Apply limit if specified
        if (limit) {
          fetchedAnomalies = fetchedAnomalies.slice(0, limit);
        }
      }
      
      setAnomalies(fetchedAnomalies);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useWeb3, protocolId, limit]);

  const addAnomaly = useCallback(async (
    protocolAddress: string,
    description: string,
    severity: number
  ) => {
    try {
      if (useWeb3) {
        await web3Service.recordAnomaly(protocolAddress, description, severity);
        // Refetch after adding
        fetchAnomalies();
      } else {
        // API implementation
        // Not implemented yet
      }
      return true;
    } catch (err) {
      console.error('Error recording anomaly:', err);
      setError(err as Error);
      return false;
    }
  }, [fetchAnomalies, useWeb3]);

  // Handle new anomalies from websocket
  const handleNewAnomaly = useCallback((anomaly: Anomaly) => {
    // If there's a protocolId filter, only add if it matches
    if (protocolId && anomaly.protocol && anomaly.protocol.id !== protocolId) {
      return;
    }
    
    setAnomalies(prevAnomalies => {
      // Check if the anomaly already exists
      const exists = prevAnomalies.some(a => a.id === anomaly.id);
      
      if (exists) {
        return prevAnomalies;
      }
      
      // Add new anomaly at the beginning (most recent first)
      const newAnomalies = [anomaly, ...prevAnomalies];
      
      // Apply limit if specified
      return limit ? newAnomalies.slice(0, limit) : newAnomalies;
    });
  }, [protocolId, limit]);

  useEffect(() => {
    fetchAnomalies();
    
    // Subscribe to new anomalies via websocket
    const unsubscribe = websocketService.subscribeToNewAnomalies(handleNewAnomaly);
    
    return () => {
      unsubscribe();
    };
  }, [fetchAnomalies, handleNewAnomaly]);

  return {
    anomalies,
    loading,
    error,
    fetchAnomalies,
    addAnomaly
  };
};

export default useAnomalies; 