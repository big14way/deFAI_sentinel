import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alert, AlertSeverity, AlertStatus, AlertCategory } from '../../types';
import AlertFeed from '../../components/alerts/AlertFeed';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Mock data for alerts
const mockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    protocol: {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'AAVE',
      riskScore: 25,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 30,
      anomalyCount: 2,
      tvl: 1000000000,
    },
    title: 'Price Oracle Update',
    message: 'The price oracle for AAVE has been updated with a significant change in reported values.',
    severity: AlertSeverity.LOW,
    category: AlertCategory.PRICE_ANOMALY,
    status: AlertStatus.NEW
  },
  {
    id: '2',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    protocol: {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'Uniswap',
      riskScore: 45,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 20,
      anomalyCount: 1,
      tvl: 2000000000,
    },
    title: 'Liquidity Pool Imbalance',
    message: 'A significant imbalance has been detected in the ETH/USDC liquidity pool. Monitor for potential arbitrage opportunities or risks.',
    severity: AlertSeverity.MEDIUM,
    category: AlertCategory.LIQUIDITY_CHANGE,
    status: AlertStatus.NEW
  },
  {
    id: '3',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    protocol: {
      address: '0x7890abcdef1234567890abcdef1234567890abcd',
      name: 'Compound',
      riskScore: 70,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 60,
      anomalyCount: 5,
      tvl: 800000000,
    },
    title: 'Unusual Contract Interaction',
    message: 'An unusual pattern of interactions has been detected with the Compound governance contract. Multiple large transactions occurred within a short timeframe.',
    severity: AlertSeverity.HIGH,
    category: AlertCategory.CONTRACT_INTERACTION,
    status: AlertStatus.NEW
  },
  {
    id: '4',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    protocol: {
      address: '0xdef1234567890abcdef1234567890abcdef123456',
      name: 'MakerDAO',
      riskScore: 90,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 180,
      anomalyCount: 8,
      lastAnomalyTime: Date.now() - 1000 * 60 * 120,
      tvl: 1500000000,
    },
    title: 'Critical Collateral Ratio Alert',
    message: 'MakerDAO collateral ratio has dropped below safe levels. Immediate action may be required to prevent liquidations.',
    severity: AlertSeverity.CRITICAL,
    category: AlertCategory.SECURITY,
    status: AlertStatus.ACKNOWLEDGED
  }
];

const AlertsPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load alerts when wallet is connected
  useEffect(() => {
    async function loadAlerts() {
      if (!isConnected) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, you would fetch alerts from your API
        // For demo purposes, we're using mock data with a delay
        setTimeout(() => {
          setAlerts(mockAlerts);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading alerts:', err);
        setError('Failed to load alerts. Please try again later.');
        setLoading(false);
      }
    }

    loadAlerts();
  }, [isConnected]);

  const handleMarkAsRead = (alertId: string) => {
    // In a real app, you would call an API to mark the alert as read
    console.log(`Marking alert ${alertId} as read`);
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: AlertStatus.ACKNOWLEDGED } 
          : alert
      )
    );
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4">
          Please connect your wallet to view alerts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-gray-600">
          Monitor important events across your DeFi protocols
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-600">No alerts to display.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Recent Alerts</h2>
            <AlertFeed 
              alerts={alerts}
              onMarkAsRead={handleMarkAsRead}
              maxItems={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage; 