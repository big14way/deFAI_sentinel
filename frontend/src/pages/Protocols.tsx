import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols } from '../services/web3';
import { Link } from 'react-router-dom';

const Protocols: React.FC = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'riskScore',
    direction: 'desc'
  });

  // Load protocols when wallet is connected
  useEffect(() => {
    async function loadProtocols() {
      if (!isConnected) return;
      
      try {
        setLoading(true);
        setError(null);
        setConnectionError(null);
        
        const data = await getAllProtocols();
        setProtocols(data);
        setFilteredProtocols(data);
      } catch (err: any) {
        console.error('Error loading protocols:', err);
        
        // Check for wallet connection errors
        if (err.message && err.message.includes('WebSocket connection failed')) {
          setConnectionError('Wallet connection issue detected. Please reconnect your wallet.');
        } else {
          setError('Failed to load protocols. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProtocols();
  }, [isConnected]);

  // Filter and sort protocols when search term or sort config changes
  useEffect(() => {
    if (!protocols.length) return;

    // Filter based on search term
    let filtered = protocols;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = protocols.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.address.toLowerCase().includes(term)
      );
    }
    
    // Sort based on sort config
    filtered = [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredProtocols(filtered);
  }, [searchTerm, sortConfig, protocols]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'bg-green-100 text-green-800' };
    if (score < 70) return { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'High Risk', color: 'bg-red-100 text-red-800' };
  };

  // Handle wallet connection issues
  const handleReconnect = () => {
    window.location.reload();
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
          Please connect your wallet to view protocol data.
        </p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Wallet Connection Issue</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {connectionError}
        </p>
        <button
          onClick={handleReconnect}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading protocols...</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Protocols</h1>
        <Link 
          to="/protocols/manage" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Manage Protocols
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Filter:</span>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              if (e.target.value === 'all') {
                setFilteredProtocols(protocols);
              } else {
                const isActive = e.target.value === 'active';
                setFilteredProtocols(protocols.filter(p => p.isActive === isActive));
              }
            }}
          >
            <option value="all">All Protocols</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Protocol List */}
      {filteredProtocols.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-600">No protocols found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Protocol Name {getSortIndicator('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('riskScore')}
                >
                  Risk Score {getSortIndicator('riskScore')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('isActive')}
                >
                  Status {getSortIndicator('isActive')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('anomalyCount')}
                >
                  Anomalies {getSortIndicator('anomalyCount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProtocols.map((protocol) => {
                const riskInfo = getRiskLabel(protocol.riskScore);
                return (
                  <tr key={protocol.address} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{protocol.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">{protocol.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskInfo.color}`}>
                        {protocol.riskScore}% - {riskInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {protocol.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {protocol.anomalyCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/protocols/${protocol.address}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Protocols; 