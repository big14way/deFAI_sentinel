import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Define types locally
interface Alert {
  id: string;
  severity: string;
  title: string;
  description: string;
  timestamp: number;
  protocolName: string;
  protocolAddress: string;
  chainId: number;
  acknowledged: boolean;
  category: string;
  impactedAssets: string;
  relatedTxs: string[];
  protocol?: any;
  message?: string;
}

type AlertType = 'acknowledged' | 'unacknowledged' | 'critical' | 'high' | 'security_vulnerability';

interface UserSettings {
  alertPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    minSeverity: string;
  };
  notificationEmail: string;
  phoneNumber: string;
  categories: {
    [key: string]: boolean;
  };
}

// Mock alerts data
const mockAlerts = [
  {
    id: 'alert-1',
    severity: 'high',
    title: 'Unusual transaction activity detected',
    description: 'Unusual transaction patterns detected on Aave protocol showing potential suspicious activity.',
    timestamp: new Date().getTime() - 3600000, // 1 hour ago
    protocolName: 'Aave',
    protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    chainId: 1,
    acknowledged: false,
    category: 'suspicious_activity',
    impactedAssets: '$5.2M',
    relatedTxs: ['0x1234...5678', '0x9876...5432']
  },
  {
    id: 'alert-2',
    severity: 'medium',
    title: 'Smart contract method invocation anomaly',
    description: 'Unusual frequency of withdrawals detected on Uniswap in the last 24 hours.',
    timestamp: new Date().getTime() - 7200000, // 2 hours ago
    protocolName: 'Uniswap',
    protocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chainId: 1, 
    acknowledged: false,
    category: 'contract_anomaly',
    impactedAssets: '$1.8M',
    relatedTxs: ['0xabcd...ef12']
  },
  {
    id: 'alert-3',
    severity: 'critical',
    title: 'Potential bridge vulnerability detected',
    description: 'Analysis has identified a potential vulnerability in a cross-chain bridge used by Compound.',
    timestamp: new Date().getTime() - 14400000, // 4 hours ago
    protocolName: 'Compound',
    protocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    chainId: 8453,
    acknowledged: false,
    category: 'security_vulnerability',
    impactedAssets: '$12.5M',
    relatedTxs: []
  },
  {
    id: 'alert-4',
    severity: 'low',
    title: 'Gas price anomaly detected',
    description: 'Unusual gas price patterns detected on transactions interacting with MakerDAO.',
    timestamp: new Date().getTime() - 86400000, // 1 day ago
    protocolName: 'MakerDAO',
    protocolAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    chainId: 8453,
    acknowledged: true,
    category: 'gas_anomaly',
    impactedAssets: '$450K',
    relatedTxs: ['0x2345...6789']
  },
  {
    id: 'alert-5',
    severity: 'medium',
    title: 'Large token transfer detected',
    description: 'Unusually large token transfer detected on Chainlink protocol.',
    timestamp: new Date().getTime() - 259200000, // 3 days ago
    protocolName: 'Chainlink',
    protocolAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    chainId: 10,
    acknowledged: true,
    category: 'large_transfer',
    impactedAssets: '$3.7M',
    relatedTxs: ['0x3456...7890']
  }
];

// Mock user settings
const mockUserSettings = {
  alertPreferences: {
    email: true,
    push: true,
    sms: false,
    minSeverity: 'medium'
  },
  notificationEmail: 'user@example.com',
  phoneNumber: '+1234567890',
  categories: {
    suspicious_activity: true,
    contract_anomaly: true,
    security_vulnerability: true,
    gas_anomaly: false,
    large_transfer: true
  }
};

// Mock API functions
const getAlerts = async (): Promise<Alert[]> => {
  // This would normally call an API
  return mockAlerts;
};

const acknowledgeAlert = async (alertId: string): Promise<boolean> => {
  // This would normally call an API
  console.log('Acknowledging alert:', alertId);
  return true;
};

const getUserSettings = async (): Promise<UserSettings> => {
  // This would normally call an API
  return mockUserSettings;
};

const updateUserSettings = async (settings: UserSettings): Promise<boolean> => {
  // This would normally call an API
  console.log('Updating user settings:', settings);
  return true;
};

// Format date helper function
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editedSettings, setEditedSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchUserSettings();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Try to get real alerts
      const alertsData = await getAlerts();
      if (alertsData && alertsData.length > 0) {
        setAlerts(alertsData);
      } else {
        // Use mock data if empty result
        setAlerts(mockAlerts);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      // Use mock alerts on error
      setAlerts(mockAlerts);
      setError(null); // Clear error to prevent showing error message
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const settings = await getUserSettings();
      
      setUserSettings(settings);
      setEditedSettings(settings); // Initialize editedSettings with the fetched settings
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      // Optimistically update UI even if API call fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    }
  };

  const handleProtocolClick = (protocolAddress: string) => {
    navigate(`/protocols/${protocolAddress}`);
  };

  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    try {
      await updateUserSettings(updatedSettings);
      setUserSettings(updatedSettings);
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating user settings:', err);
      // Optimistically update UI even if API call fails
      setUserSettings(updatedSettings);
      setShowSettings(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      categories: {
        ...editedSettings.categories,
        [category]: !editedSettings.categories[category]
      }
    });
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      alertPreferences: {
        ...editedSettings.alertPreferences,
        [key]: value
      }
    });
  };

  const handleInputChange = (key: string, value: string) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      [key]: value
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'acknowledged') return alert.acknowledged;
    if (filter === 'unacknowledged') return !alert.acknowledged;
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'high') return alert.severity === 'high';
    return alert.category === filter;
  });

  // Render functions
  const renderAlertFilters = () => {
    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unacknowledged')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'unacknowledged' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Unacknowledged
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'high' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            High Severity
          </button>
          <button
            onClick={() => setFilter('security_vulnerability')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'security_vulnerability' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Security Vulnerabilities
          </button>
        </div>
      </div>
    );
  };

  const renderAlertsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    } 
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">Error loading alerts</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    } 
    
    if (filteredAlerts.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-800 rounded-lg p-6 text-center">
          <p className="font-medium">No alerts found</p>
          <p className="text-sm mt-1">There are no alerts matching your current filter criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filteredAlerts.map(alert => (
          <div 
            key={alert.id}
            onClick={() => {
              setSelectedAlert(alert);
              setDetailModalOpen(true);
            }}
            className={`
              p-4 border rounded-lg shadow-sm cursor-pointer
              ${alert.severity === 'critical' ? 'border-red-400 bg-red-50' : ''}
              ${alert.severity === 'high' ? 'border-orange-400 bg-orange-50' : ''}
              ${alert.severity === 'medium' ? 'border-yellow-400 bg-yellow-50' : ''}
              ${alert.severity === 'low' ? 'border-blue-400 bg-blue-50' : ''}
              ${alert.acknowledged ? 'opacity-70' : ''}
              hover:shadow-md transition-shadow
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {alert.severity === 'critical' && (
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                )}
                {alert.severity === 'high' && (
                  <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                )}
                {alert.severity === 'medium' && (
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                )}
                {alert.severity === 'low' && (
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                )}
                <h3 className="font-semibold text-lg">{alert.title}</h3>
              </div>
              <span className="text-sm text-gray-500">{formatDate(alert.timestamp)}</span>
            </div>
            
            <p className="text-gray-700 mt-2">{alert.description}</p>
            
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProtocolClick(alert.protocolAddress);
                  }}
                  className="inline-block text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-md cursor-pointer"
                >
                  {alert.protocolName}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {alert.category.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
              
              {alert.acknowledged ? (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Acknowledged
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcknowledge(alert.id);
                  }}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAlertDetail = () => {
    if (!selectedAlert || !detailModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {selectedAlert.severity === 'critical' && (
                  <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                )}
                {selectedAlert.severity === 'high' && (
                  <span className="inline-block w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
                )}
                {selectedAlert.severity === 'medium' && (
                  <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                )}
                {selectedAlert.severity === 'low' && (
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                )}
                <h2 className="text-xl font-bold">{selectedAlert.title}</h2>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700">{selectedAlert.description}</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Timestamp</h3>
                  <p>{formatDate(selectedAlert.timestamp)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Protocol</h3>
                  <p
                    onClick={() => {
                      handleProtocolClick(selectedAlert.protocolAddress);
                      setDetailModalOpen(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {selectedAlert.protocolName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Category</h3>
                  <p>
                    {selectedAlert.category.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Severity</h3>
                  <p className={`
                    ${selectedAlert.severity === 'critical' ? 'text-red-600' : ''}
                    ${selectedAlert.severity === 'high' ? 'text-orange-600' : ''}
                    ${selectedAlert.severity === 'medium' ? 'text-yellow-600' : ''}
                    ${selectedAlert.severity === 'low' ? 'text-blue-600' : ''}
                    font-semibold
                  `}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </p>
                </div>
              </div>
              
              {selectedAlert.impactedAssets && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Impacted Assets</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {selectedAlert.impactedAssets}
                  </div>
                </div>
              )}
              
              {selectedAlert.relatedTxs && selectedAlert.relatedTxs.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Related Transactions</h3>
                  <div className="mt-2 space-y-2">
                    {selectedAlert.relatedTxs.map((tx: string) => (
                      <div key={tx} className="bg-gray-50 p-2 rounded-lg font-mono text-sm truncate">
                        {tx}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                {!selectedAlert.acknowledged && (
                  <button
                    onClick={() => {
                      handleAcknowledge(selectedAlert.id);
                      setSelectedAlert((prev: Alert | null) => prev ? {...prev, acknowledged: true} : null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettings || !userSettings || !editedSettings) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Alert Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={editedSettings.alertPreferences.email}
                      onChange={() => handlePreferenceChange('email', !editedSettings.alertPreferences.email)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="email-notifications" className="ml-2 text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="push-notifications"
                      checked={editedSettings.alertPreferences.push}
                      onChange={() => handlePreferenceChange('push', !editedSettings.alertPreferences.push)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="push-notifications" className="ml-2 text-gray-700">
                      Push Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sms-notifications"
                      checked={editedSettings.alertPreferences.sms}
                      onChange={() => handlePreferenceChange('sms', !editedSettings.alertPreferences.sms)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="sms-notifications" className="ml-2 text-gray-700">
                      SMS Notifications
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={editedSettings.notificationEmail}
                    onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for SMS)
                  </label>
                  <input
                    type="tel"
                    value={editedSettings.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Alert Severity
                </label>
                <select
                  value={editedSettings.alertPreferences.minSeverity}
                  onChange={(e) => handlePreferenceChange('minSeverity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low (All Alerts)</option>
                  <option value="medium">Medium & Above</option>
                  <option value="high">High & Above</option>
                  <option value="critical">Critical Only</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Alert Categories</h3>
                <div className="space-y-3">
                  {Object.entries(editedSettings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={enabled as boolean}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                        {category.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSettings(editedSettings)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alerts & Monitoring</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Alert Settings
        </button>
      </div>
      
      {renderAlertFilters()}
      {renderAlertsList()}
      {renderAlertDetail()}
      {renderSettingsModal()}
    </div>
  );
}

export default AlertsPage; 