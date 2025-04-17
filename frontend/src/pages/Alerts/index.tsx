import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alert, AlertSeverity, AlertStatus, AlertCategory } from '../../types';
import AlertFeed from '../../components/alerts/AlertFeed';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import axios from 'axios';

// Fallback mock data for development/demo purposes
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

// Alert filter types
type AlertFilters = {
  severity: AlertSeverity | 'all';
  status: AlertStatus | 'all';
  timeFrame: 'day' | 'week' | 'month' | 'all';
};

const AlertsPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'all',
    status: 'all',
    timeFrame: 'all'
  });

  // Load alerts when wallet is connected
  useEffect(() => {
    async function loadAlerts() {
      if (!isConnected) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the real API if available, otherwise fall back to mock data
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
          const response = await axios.get(`${apiUrl}/api/alerts`);
          if (response.data && Array.isArray(response.data)) {
            setAlerts(response.data);
          } else {
            // Fall back to mock data if API returns unexpected format
            setAlerts(mockAlerts);
          }
        } catch (apiError) {
          console.warn('API error, falling back to mock data:', apiError);
          setAlerts(mockAlerts);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading alerts:', err);
        setError('Failed to load alerts. Please try again later.');
        setLoading(false);
      }
    }

    loadAlerts();
  }, [isConnected]);

  // Apply filters when alerts or filters change
  useEffect(() => {
    let result = [...alerts];
    
    // Apply severity filter
    if (filters.severity !== 'all') {
      result = result.filter(alert => alert.severity === filters.severity);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(alert => alert.status === filters.status);
    }
    
    // Apply time frame filter
    if (filters.timeFrame !== 'all') {
      const now = Date.now();
      let timeAgo: number;
      
      switch (filters.timeFrame) {
        case 'day':
          timeAgo = now - 1000 * 60 * 60 * 24; // 24 hours ago
          break;
        case 'week':
          timeAgo = now - 1000 * 60 * 60 * 24 * 7; // 7 days ago
          break;
        case 'month':
          timeAgo = now - 1000 * 60 * 60 * 24 * 30; // 30 days ago
          break;
        default:
          timeAgo = 0;
      }
      
      result = result.filter(alert => alert.timestamp >= timeAgo);
    }
    
    setFilteredAlerts(result);
  }, [alerts, filters]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // Try to update the alert status via API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      await axios.patch(`${apiUrl}/api/alerts/${alertId}/status`, {
        status: AlertStatus.ACKNOWLEDGED
      });
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: AlertStatus.ACKNOWLEDGED } 
            : alert
        )
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
      // Fall back to local update only if API fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: AlertStatus.ACKNOWLEDGED } 
            : alert
        )
      );
    }
  };

  const handleFilterChange = (filterType: keyof AlertFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Please connect your wallet to view alerts and monitor protocol security in real-time.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="text-red-500 mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Security Alerts</h1>
        <p className="text-gray-600">
          Monitor important events and potential threats across your DeFi protocols
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Level
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value={AlertSeverity.LOW}>Low</option>
              <option value={AlertSeverity.MEDIUM}>Medium</option>
              <option value={AlertSeverity.HIGH}>High</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value={AlertStatus.NEW}>New</option>
              <option value={AlertStatus.ACKNOWLEDGED}>Acknowledged</option>
              <option value={AlertStatus.IN_PROGRESS}>In Progress</option>
              <option value={AlertStatus.RESOLVED}>Resolved</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.timeFrame}
              onChange={(e) => handleFilterChange('timeFrame', e.target.value as 'day' | 'week' | 'month' | 'all')}
            >
              <option value="all">All Time</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
          <span>{filteredAlerts.length} alerts found</span>
          {filteredAlerts.length !== alerts.length && (
            <button 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => setFilters({ severity: 'all', status: 'all', timeFrame: 'all' })}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-md">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">No alerts found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Alerts</h2>
          </div>
          <AlertFeed 
            alerts={filteredAlerts}
            onMarkAsRead={handleMarkAsRead}
            maxItems={50}
          />
        </div>
      )}
    </div>
  );
};

export default AlertsPage; 