import React, { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../../services/web3';
import { formatRelativeTime } from '../../utils/formatters';

interface Notification {
  id: string;
  type: 'risk-alert' | 'anomaly-alert' | 'system-alert';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  protocolAddress?: string;
}

interface RiskNotificationsProps {
  userAddress?: string;
  onViewProtocol?: (address: string) => void;
}

const RiskNotifications: React.FC<RiskNotificationsProps> = ({ 
  userAddress,
  onViewProtocol 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const fetchNotifications = async () => {
    if (!userAddress) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userNotifications = await getUserNotifications(userAddress);
      setNotifications(userNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch notifications on initial load and when userAddress changes
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications (every 2 minutes)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 120000);
    
    return () => clearInterval(interval);
  }, [userAddress]);
  
  const handleMarkAsRead = async (notificationId: string) => {
    if (!userAddress) return;
    
    try {
      await markNotificationAsRead(userAddress, notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleViewProtocol = (protocolAddress: string) => {
    if (onViewProtocol) {
      onViewProtocol(protocolAddress);
    }
    setIsOpen(false);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <button 
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => {
                notifications.forEach(notification => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id);
                  }
                });
              }}
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications to display.
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
                    notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex justify-between items-center">
                    {notification.protocolAddress && (
                      <button
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => handleViewProtocol(notification.protocolAddress!)}
                      >
                        View Protocol
                      </button>
                    )}
                    
                    {!notification.read && (
                      <button
                        className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskNotifications; 