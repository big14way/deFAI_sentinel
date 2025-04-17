import React, { useState, useEffect } from 'react';
import { Alert, AlertSeverity, AlertStatus, Protocol } from '../../types';

interface AlertFeedProps {
  alerts: Alert[];
  maxItems?: number;
  onMarkAsRead?: (alertId: string) => void;
  showProtocolName?: boolean;
}

// Helper function to get the right color class based on severity
const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.LOW:
      return 'text-green-600 bg-green-100';
    case AlertSeverity.MEDIUM:
      return 'text-yellow-600 bg-yellow-100';
    case AlertSeverity.HIGH:
      return 'text-orange-600 bg-orange-100';
    case AlertSeverity.CRITICAL:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Proper React component for severity icons
const SeverityIcon: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  switch (severity) {
    case AlertSeverity.LOW:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    case AlertSeverity.MEDIUM:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case AlertSeverity.HIGH:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case AlertSeverity.CRITICAL:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
};

// Format timestamp
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Main component
const AlertFeed: React.FC<AlertFeedProps> = ({ 
  alerts, 
  maxItems = 5, 
  onMarkAsRead,
  showProtocolName = true
}) => {
  const [displayedAlerts, setDisplayedAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Sort alerts by timestamp (newest first) and limit to maxItems
    const sortedAlerts = [...alerts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);
    
    setDisplayedAlerts(sortedAlerts);
  }, [alerts, maxItems]);

  const handleMarkAsRead = (alertId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(alertId);
    }
  };

  if (displayedAlerts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No alerts to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <ul className="divide-y divide-gray-200">
        {displayedAlerts.map((alert) => (
          <li key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <SeverityIcon severity={alert.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
                {showProtocolName && alert.protocol && (
                  <p className="text-xs text-blue-600 mb-1">
                    {alert.protocol.name}
                  </p>
                )}
                <p className="text-sm text-gray-500 line-clamp-2">
                  {alert.message}
                </p>
                {alert.status === AlertStatus.NEW && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertFeed; 