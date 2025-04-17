import { useState, useEffect, useCallback } from 'react';
import { getAllProtocols, getUserRiskScore, recordUserExposure, setupAlertListeners } from '../utils/contractInteraction';
import { Protocol } from '../types';

export const useProtocols = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProtocols = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProtocols();
      setProtocols(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching protocols:', err);
      setError('Failed to fetch protocols. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  return { protocols, loading, error, refetch: fetchProtocols };
};

export const useUserRiskScore = (userAddress: string | null) => {
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskScore = useCallback(async () => {
    if (!userAddress) {
      setRiskScore(null);
      return;
    }

    try {
      setLoading(true);
      const score = await getUserRiskScore(userAddress);
      setRiskScore(score);
      setError(null);
    } catch (err) {
      console.error('Error fetching user risk score:', err);
      setError('Failed to calculate risk score. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchRiskScore();
  }, [fetchRiskScore]);

  return { riskScore, loading, error, refetch: fetchRiskScore };
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Setup event listeners for alerts
    const cleanup = setupAlertListeners((newAlert) => {
      setAlerts(prev => [...prev, newAlert]);
    });

    return () => {
      // Clean up event listeners when component unmounts
      cleanup();
    };
  }, []);

  return { alerts };
};

export const useExposureRecording = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const recordExposure = useCallback(async (userAddress: string, protocolAddress: string) => {
    try {
      setRecording(true);
      setSuccess(false);
      setError(null);
      
      const result = await recordUserExposure(userAddress, protocolAddress);
      setSuccess(result);
      
      if (!result) {
        setError('Failed to record exposure. Please try again.');
      }
    } catch (err) {
      console.error('Error recording user exposure:', err);
      setError('Error recording exposure. Please check your wallet connection.');
      setSuccess(false);
    } finally {
      setRecording(false);
    }
  }, []);

  return { recordExposure, recording, error, success };
}; 