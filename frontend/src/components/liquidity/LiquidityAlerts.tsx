import React, { useState, useEffect } from 'react';
import { Protocol } from '../../types/protocol';

interface LiquidityAlert {
  id: string;
  protocolName: string;
  protocolAddress: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'outflow' | 'inflow' | 'volatility';
  timestamp: number;
  message: string;
  percentageChange: number;
  isRead: boolean;
}

interface LiquidityAlertsProps {
  protocols: Protocol[];
}

export const LiquidityAlerts: React.FC<LiquidityAlertsProps> = ({ protocols }) => {
  // Generate mock alerts based on protocols (in a real app, these would come from an API)
  const generateMockAlerts = (): LiquidityAlert[] => {
    const alerts: LiquidityAlert[] = [];
    const now = Math.floor(Date.now() / 1000);
    
    // Generate alerts for high-risk protocols
    protocols
      .filter(p => p.riskScore > 65)
      .forEach((protocol, index) => {
        // Create a critical outflow alert for the highest risk protocol
        if (index === 0 && protocol.riskScore > 75) {
          alerts.push({
            id: `alert-critical-${protocol.address}`,
            protocolName: protocol.name,
            protocolAddress: protocol.address,
            severity: 'critical',
            type: 'outflow',
            timestamp: now - 15 * 60, // 15 minutes ago
            message: `Critical TVL outflow detected with withdrawal rate exceeding historical averages by 530%. Potential liquidity crisis.`,
            percentageChange: -32.5,
            isRead: false
          });
        }
        
        // Create high severity alert for other high risk protocols
        if (protocol.riskScore > 70) {
          alerts.push({
            id: `alert-high-${protocol.address}`,
            protocolName: protocol.name,
            protocolAddress: protocol.address,
            severity: 'high',
            type: 'outflow',
            timestamp: now - Math.floor(Math.random() * 3600), // random time within last hour
            message: `Unusual TVL outflow pattern detected. Withdrawal rate 3.2x higher than 30-day average.`,
            percentageChange: -18.7,
            isRead: Math.random() > 0.7 // 30% chance of being read
          });
        }
        
        // Create medium severity alert for medium risk protocols
        if (protocol.riskScore > 65 && protocol.riskScore <= 70) {
          alerts.push({
            id: `alert-medium-${protocol.address}`,
            protocolName: protocol.name,
            protocolAddress: protocol.address,
            severity: 'medium',
            type: Math.random() > 0.3 ? 'outflow' : 'volatility',
            timestamp: now - Math.floor(Math.random() * 7200), // random time within last 2 hours
            message: `Increased TVL volatility detected. Current movement exceeds 2 standard deviations from 7-day average.`,
            percentageChange: -9.4,
            isRead: Math.random() > 0.5 // 50% chance of being read
          });
        }
      });
    
    // Add some inflow alerts for variety
    protocols
      .filter(p => p.riskScore < 40)
      .slice(0, 2)
      .forEach((protocol) => {
        alerts.push({
          id: `alert-inflow-${protocol.address}`,
          protocolName: protocol.name,
          protocolAddress: protocol.address,
          severity: 'low',
          type: 'inflow',
          timestamp: now - Math.floor(Math.random() * 14400), // random time within last 4 hours
          message: `Significant TVL inflow detected. Current inflow rate 2.8x higher than 7-day average.`,
          percentageChange: 15.3,
          isRead: Math.random() > 0.3 // 70% chance of being read
        });
      });
    
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  const [alerts, setAlerts] = useState<LiquidityAlert[]>(generateMockAlerts());
  const [filteredAlerts, setFilteredAlerts] = useState<LiquidityAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterType, setFilterType] = useState<'all' | 'outflow' | 'inflow' | 'volatility'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Alert settings state
  const [criticalThreshold, setCriticalThreshold] = useState<number>(25);
  const [detectionSensitivity, setDetectionSensitivity] = useState<number>(2);
  const [monitoringFrequency, setMonitoringFrequency] = useState<string>("5");
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [slackNotifications, setSlackNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [emailSeverity, setEmailSeverity] = useState<string>("critical_high");
  const [slackSeverity, setSlackSeverity] = useState<string>("all");
  const [pushSeverity, setPushSeverity] = useState<string>("critical");
  const [isSettingsSaved, setIsSettingsSaved] = useState<boolean>(false);
  
  // Initialize filteredAlerts with the full list of alerts when component mounts
  useEffect(() => {
    setFilteredAlerts(alerts);
  }, []);
  
  // Filter alerts based on the current filters
  useEffect(() => {
    const filtered = alerts.filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesReadStatus = !showUnreadOnly || !alert.isRead;
      
      return matchesSeverity && matchesType && matchesReadStatus;
    });
    
    setFilteredAlerts(filtered);
  }, [alerts, filterSeverity, filterType, showUnreadOnly]);
  
  // Mark an alert as read
  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, isRead: true } 
        : alert
    ));
  };
  
  // Mark all alerts as read
  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };
  
  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) {
      return 'Just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get severity badge style
  const getSeverityBadgeStyle = (severity: LiquidityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };
  
  // Get alert type icon
  const getAlertTypeIcon = (type: LiquidityAlert['type']) => {
    switch (type) {
      case 'outflow':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'inflow':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'volatility':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Handle saving alert settings
  const handleSaveSettings = () => {
    // In a real app, this would make an API call to save settings
    console.log('Saving alert settings:', {
      criticalThreshold,
      detectionSensitivity,
      monitoringFrequency,
      emailNotifications,
      slackNotifications,
      pushNotifications,
      emailSeverity,
      slackSeverity,
      pushSeverity
    });
    
    // Show success message
    setIsSettingsSaved(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setIsSettingsSaved(false);
    }, 3000);
  };
  
  // Utility function to get human-readable severity description
  const getSeverityLabel = (value: string): string => {
    switch (value) {
      case "critical_high":
        return "Critical and High";
      case "critical":
        return "Critical only";
      case "all":
        return "All severities";
      default:
        return value;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-0">Liquidity Alerts</h2>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
            {/* Severity filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="outflow">Outflow</option>
              <option value="inflow">Inflow</option>
              <option value="volatility">Volatility</option>
            </select>
            
            {/* Read status filter */}
            <div className="flex items-center">
              <input
                id="unread-only"
                type="checkbox"
                checked={showUnreadOnly}
                onChange={() => setShowUnreadOnly(!showUnreadOnly)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="unread-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Unread only
              </label>
            </div>
          </div>
        </div>
        
        {/* Alert count and actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} {filterSeverity !== 'all' ? `(${filterSeverity})` : ''}
            {filterType !== 'all' ? ` • ${filterType}` : ''}
            {showUnreadOnly ? ' • unread only' : ''}
          </div>
          
          {filteredAlerts.some(alert => !alert.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Alerts list */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No alerts match the current filters
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-lg ${
                  !alert.isRead 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertTypeIcon(alert.type)}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.protocolName}
                      </p>
                      <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeStyle(alert.severity)}`}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {alert.message}
                    </p>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <div className={`text-sm font-medium ${
                        alert.percentageChange > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        TVL Change: {alert.percentageChange > 0 ? '+' : ''}{alert.percentageChange.toFixed(1)}%
                      </div>
                      
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Alert Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alert Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alert Thresholds</label>
            <div className="mt-2 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Critical Outflow Threshold</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{criticalThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  value={criticalThreshold} 
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Unusual Activity Detection</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {detectionSensitivity === 1 ? 'Low' : detectionSensitivity === 2 ? 'Medium' : 'High'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={detectionSensitivity}
                  onChange={(e) => setDetectionSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Monitoring Frequency</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{monitoringFrequency} minutes</span>
                </div>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={monitoringFrequency}
                  onChange={(e) => setMonitoringFrequency(e.target.value)}
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Settings</label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </label>
                </div>
                <select
                  className="text-xs border-gray-300 rounded-md"
                  value={emailSeverity}
                  onChange={(e) => setEmailSeverity(e.target.value)}
                  disabled={!emailNotifications}
                >
                  <option value="critical">Critical only</option>
                  <option value="critical_high">Critical and High</option>
                  <option value="all">All severities</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="slack-notifications"
                    type="checkbox"
                    checked={slackNotifications}
                    onChange={(e) => setSlackNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="slack-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Slack Notifications
                  </label>
                </div>
                <select
                  className="text-xs border-gray-300 rounded-md"
                  value={slackSeverity}
                  onChange={(e) => setSlackSeverity(e.target.value)}
                  disabled={!slackNotifications}
                >
                  <option value="critical">Critical only</option>
                  <option value="critical_high">Critical and High</option>
                  <option value="all">All severities</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="mobile-push"
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mobile-push" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Mobile Push Notifications
                  </label>
                </div>
                <select
                  className="text-xs border-gray-300 rounded-md"
                  value={pushSeverity}
                  onChange={(e) => setPushSeverity(e.target.value)}
                  disabled={!pushNotifications}
                >
                  <option value="critical">Critical only</option>
                  <option value="critical_high">Critical and High</option>
                  <option value="all">All severities</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            {isSettingsSaved && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                Settings saved successfully!
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-200 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => {
                  // Reset to defaults
                  setCriticalThreshold(25);
                  setDetectionSensitivity(2);
                  setMonitoringFrequency("5");
                  setEmailNotifications(true);
                  setSlackNotifications(true);
                  setPushNotifications(true);
                  setEmailSeverity("critical_high");
                  setSlackSeverity("all");
                  setPushSeverity("critical");
                }}
              >
                Reset to Defaults
              </button>
              <button
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSaveSettings}
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