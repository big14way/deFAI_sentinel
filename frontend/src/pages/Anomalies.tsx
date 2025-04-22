import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAnomalies } from '../services/web3';
import { Link } from 'react-router-dom';

const Anomalies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'timestamp',
    direction: 'desc'
  });
  const [filter, setFilter] = useState('all');

  // Load anomalies on component mount
  useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getAnomalies();
        setAnomalies(data);
        setFilteredAnomalies(data);
      } catch (err: any) {
        console.error('Error loading anomalies:', err);
        setError('Failed to load anomalies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadAnomalies();
  }, []);

  // Filter and sort anomalies when search term or sort config changes
  useEffect(() => {
    if (!anomalies.length) return;

    // Filter based on search term and selected filter
    let filtered = anomalies;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.protocolName.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.type.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.type.toLowerCase() === filter.toLowerCase());
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
    
    setFilteredAnomalies(filtered);
  }, [searchTerm, sortConfig, filter, anomalies]);

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

  // Function to format timestamp as readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return { label: 'Critical', color: 'bg-red-100 text-red-800' };
      case 'high':
        return { label: 'High', color: 'bg-orange-100 text-orange-800' };
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
      case 'low':
        return { label: 'Low', color: 'bg-green-100 text-green-800' };
      default:
        return { label: severity, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading anomalies data...</p>
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
        <h1 className="text-2xl font-semibold text-gray-900">Anomalies</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search anomalies..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Filter:</span>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Anomalies</option>
            <option value="security">Security</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="governance">Governance</option>
          </select>
        </div>
      </div>

      {filteredAnomalies.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No anomalies found.</p>
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
                    onClick={() => handleSort('timestamp')}
                  >
                    Time {getSortIndicator('timestamp')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('protocolName')}
                  >
                    Protocol {getSortIndicator('protocolName')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    Type {getSortIndicator('type')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('severity')}
                  >
                    Severity {getSortIndicator('severity')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
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
                {filteredAnomalies.map((anomaly) => {
                  const severity = getSeverityLabel(anomaly.severity);
                  return (
                    <tr key={anomaly.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(anomaly.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-blue-600">
                          <Link to={`/protocols/${anomaly.protocolAddress}`}>
                            {anomaly.protocolName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {anomaly.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${severity.color}`}>
                          {severity.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {anomaly.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          to={`/anomalies/${anomaly.id}`} 
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

export default Anomalies; 