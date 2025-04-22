import { useState, useEffect, useCallback } from 'react';
import { Protocol, ProtocolStatus } from '../types/protocol';
import * as apiService from '../services/api';
import * as web3Service from '../services/web3';
import websocketService from '../services/websocket';

export const useProtocols = (useWeb3 = true) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProtocols = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedProtocols: Protocol[];
      
      if (useWeb3) {
        // Fetch from blockchain
        const web3Protocols = await web3Service.getAllProtocols();
        
        // Convert to Protocol type
        fetchedProtocols = web3Protocols.map(p => ({
          id: p.address,
          name: p.name,
          address: p.address,
          chain: 'Base', // Default to Base network
          category: 'DeFi', // Default category
          riskScore: p.riskScore,
          status: p.isActive ? 'active' : 'warning', // Map inactive to warning for compatibility
          lastUpdated: p.lastUpdateTime,
          anomalyCount: p.anomalyCount,
          lastAnomaly: p.lastAnomalyTime || undefined,
          isActive: p.isActive,
          lastUpdateTime: p.lastUpdateTime,
          deployments: {} // Required field for Protocol type
        }));
      } else {
        // Fetch from API
        fetchedProtocols = await apiService.fetchProtocols();
      }
      
      setProtocols(fetchedProtocols);
    } catch (err) {
      console.error('Error fetching protocols:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useWeb3]);

  const updateProtocol = useCallback((updatedProtocol: Protocol) => {
    setProtocols(prevProtocols => 
      prevProtocols.map(p => 
        p.id === updatedProtocol.id ? updatedProtocol : p
      )
    );
  }, []);

  useEffect(() => {
    fetchProtocols();
    
    // Subscribe to protocol updates via websocket
    const unsubscribe = websocketService.subscribeToProtocolUpdates((protocol) => {
      updateProtocol(protocol);
    });
    
    return () => {
      unsubscribe();
    };
  }, [fetchProtocols, updateProtocol]);

  const addProtocol = useCallback(async (address: string, name: string) => {
    try {
      if (useWeb3) {
        // Default risk score set to 50 (medium risk)
        await web3Service.registerProtocol(address, name, 50);
        // Refetch after registration
        fetchProtocols();
      } else {
        // API implementation for adding a protocol
        // Not implemented yet
      }
      return true;
    } catch (err) {
      console.error('Error adding protocol:', err);
      setError(err as Error);
      return false;
    }
  }, [fetchProtocols, useWeb3]);

  const updateRiskScore = useCallback(async (protocolId: string, newScore: number) => {
    try {
      if (useWeb3) {
        await web3Service.updateRiskScore(protocolId, newScore);
        // Update local state
        setProtocols(prevProtocols => 
          prevProtocols.map(p => 
            p.id === protocolId ? { ...p, riskScore: newScore } : p
          )
        );
      } else {
        // API implementation
        // Not implemented yet
      }
      return true;
    } catch (err) {
      console.error('Error updating risk score:', err);
      setError(err as Error);
      return false;
    }
  }, [useWeb3]);

  const toggleProtocolStatus = useCallback(async (protocolId: string) => {
    try {
      const protocol = protocols.find(p => p.id === protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }
      
      if (useWeb3) {
        await web3Service.toggleProtocolStatus(protocolId);
        // Update local state
        setProtocols(prevProtocols => 
          prevProtocols.map(p => 
            p.id === protocolId ? { 
              ...p, 
              status: p.status === 'active' ? 'warning' : 'active' 
            } : p
          )
        );
      } else {
        // API implementation
        // Not implemented yet
      }
      return true;
    } catch (err) {
      console.error('Error toggling protocol status:', err);
      setError(err as Error);
      return false;
    }
  }, [useWeb3, protocols]);

  return {
    protocols,
    loading,
    error,
    fetchProtocols,
    addProtocol,
    updateProtocol,
    updateRiskScore,
    toggleProtocolStatus
  };
};

export default useProtocols; 