import React, { useState } from 'react';

interface ApiKey {
  id: string;
  name: string;
  createdAt: Date;
  lastUsed: Date | null;
  permissions: string[];
  token?: string; // Only available when first generated
}

export const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'api-key-1',
      name: 'Dashboard Integration',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      permissions: ['read:protocols', 'read:anomalies', 'read:alerts']
    },
    {
      id: 'api-key-2',
      name: 'Risk Monitoring Service',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      permissions: ['read:protocols', 'read:anomalies', 'read:alerts', 'read:metrics']
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: {
      'read:protocols': true,
      'read:anomalies': true,
      'read:alerts': true,
      'read:metrics': false,
      'write:protocols': false,
      'write:anomalies': false,
    }
  });
  
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  
  const handlePermissionChange = (permission: string) => {
    setNewKeyData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission as keyof typeof prev.permissions]
      }
    }));
  };
  
  const handleCreateNewKey = () => {
    if (!newKeyData.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }
    
    // Create a new API key (in a real application, this would call an API)
    const selectedPermissions = Object.entries(newKeyData.permissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([permission]) => permission);
    
    const newKey: ApiKey = {
      id: `api-key-${Date.now()}`,
      name: newKeyData.name,
      createdAt: new Date(),
      lastUsed: null,
      permissions: selectedPermissions,
      token: `ey${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}.${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewlyCreatedKey(newKey);
    setShowCreateForm(false);
    
    // Reset form
    setNewKeyData({
      name: '',
      permissions: {
        'read:protocols': true,
        'read:anomalies': true,
        'read:alerts': true,
        'read:metrics': false,
        'write:protocols': false,
        'write:anomalies': false,
      }
    });
  };
  
  const handleRevokeKey = (keyId: string) => {
    // In a real application, this would call an API to revoke the key
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      
      if (newlyCreatedKey?.id === keyId) {
        setNewlyCreatedKey(null);
      }
    }
  };
  
  const handleDismissNewKey = () => {
    setNewlyCreatedKey(null);
  };
  
  const formatPermission = (permission: string) => {
    const [action, resource] = permission.split(':');
    return (
      <span>
        <span className={action === 'read' ? 'text-blue-500' : 'text-amber-500'}>
          {action}
        </span>
        :<span className="text-gray-700 dark:text-gray-300">{resource}</span>
      </span>
    );
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div>
      {/* Newly created API key alert */}
      {newlyCreatedKey && (
        <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50 dark:bg-green-900 dark:border-green-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">API Key Created</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                <p className="mb-2">Your new API key has been created. Please copy it now as it won't be shown again:</p>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 font-mono text-xs break-all mb-2">
                  {newlyCreatedKey.token}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newlyCreatedKey.token || '');
                      alert('API key copied to clipboard');
                    }}
                    className="mr-2 text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={handleDismissNewKey}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* API Keys Management */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Keys</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          disabled={showCreateForm}
        >
          Create New API Key
        </button>
      </div>
      
      {/* Create new API key form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Create New API Key</h4>
          
          <div className="mb-4">
            <label htmlFor="api-key-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Name
            </label>
            <input
              type="text"
              id="api-key-name"
              value={newKeyData.name}
              onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
              placeholder="e.g., Risk Management Integration"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(newKeyData.permissions).map(([permission, isSelected]) => (
                <div key={permission} className="flex items-center">
                  <input
                    id={`permission-${permission}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {formatPermission(permission)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNewKey}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Create API Key
            </button>
          </div>
        </div>
      )}
      
      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {apiKeys.length === 0 ? (
            <li className="p-4 text-sm text-gray-500 dark:text-gray-400">
              No API keys found. Create a new key to get started.
            </li>
          ) : (
            apiKeys.map((key) => (
              <li key={key.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</h4>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      {key.lastUsed && (
                        <span className="ml-4">Last used: {formatDate(key.lastUsed)}</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {key.permissions.map((permission) => (
                        <span 
                          key={permission} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {formatPermission(permission)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-red-400 dark:hover:bg-gray-600"
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      
      {/* Documentation link */}
      <div className="mt-6 text-center">
        <a 
          href="/dashboard/api-docs" 
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View API Documentation →
        </a>
      </div>
    </div>
  );
};