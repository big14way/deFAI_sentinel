import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllProtocols } from '../services/web3';
import { Link } from 'react-router-dom';

const Protocols: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'riskScore',
    direction: 'desc'
  });

  // Load protocols on mount
  useEffect(() => {
    async function loadProtocols() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getAllProtocols();
        
        // Filter out fake protocols
        const validProtocols = data.filter(
          p => p.address.length === 42 && !p.address.includes('123456789012345')
        );
        
        setProtocols(validProtocols);
        setFilteredProtocols(validProtocols);
      } catch (err: any) {
        console.error('Error loading protocols:', err);
        setError('Failed to load protocols. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadProtocols();
  }, []);

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
              const value = e.target.value;
              if (value === 'all') {
                setFilteredProtocols(protocols);
              } else if (value === 'high') {
                setFilteredProtocols(protocols.filter(p => p.riskScore >= 70));
              } else if (value === 'medium') {
                setFilteredProtocols(protocols.filter(p => p.riskScore >= 30 && p.riskScore < 70));
              } else if (value === 'low') {
                setFilteredProtocols(protocols.filter(p => p.riskScore < 30));
              }
            }}
          >
            <option value="all">All Protocols</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {filteredProtocols.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No protocols found.</p>
          <Link 
            to="/protocols/add" 
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Protocol
          </Link>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Protocol {getSortIndicator('name')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('riskScore')}
                  >
                    Risk Score {getSortIndicator('riskScore')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('tvl')}
                  >
                    TVL {getSortIndicator('tvl')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProtocols.map((protocol) => {
                  const risk = getRiskLabel(protocol.riskScore);
                  return (
                    <tr key={protocol.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {protocol.logoUrl ? (
                            <img 
                              src={protocol.logoUrl} 
                              alt={protocol.name} 
                              className="h-10 w-10 rounded-full mr-3 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/generic-protocol-icon.png";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 mr-3 flex items-center justify-center">
                              <span className="text-blue-800 font-semibold">
                                {protocol.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{protocol.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {protocol.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${risk.color}`}>
                            {risk.label}
                          </div>
                          <span className="ml-2 text-gray-900 font-medium">{protocol.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(protocol.tvl / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          protocol.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {protocol.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          to={`/protocols/${protocol.address}`}
                          className="text-blue-600 hover:text-blue-900"
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
        </div>
      )}
    </div>
  );
};

export default Protocols; 