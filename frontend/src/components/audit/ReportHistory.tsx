import React, { useState } from 'react';

interface Report {
  id: string;
  protocolName: string;
  protocolAddress: string;
  reportType: string;
  createdAt: Date;
  status: 'completed' | 'archived';
}

export const ReportHistory: React.FC = () => {
  // Sample report data
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'rep-1',
      protocolName: 'Aave',
      protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      reportType: 'Comprehensive Audit',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed'
    },
    {
      id: 'rep-2',
      protocolName: 'Uniswap',
      protocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      reportType: 'Smart Contract Scan',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'completed'
    },
    {
      id: 'rep-3',
      protocolName: 'Compound',
      protocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      reportType: 'Risk Assessment',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: 'completed'
    },
    {
      id: 'rep-4',
      protocolName: 'MakerDAO',
      protocolAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      reportType: 'Compliance Report',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      status: 'archived'
    },
    {
      id: 'rep-5',
      protocolName: 'Chainlink',
      protocolAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
      reportType: 'Comprehensive Audit',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'archived'
    }
  ]);
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter reports based on status and search term
  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = 
      report.protocolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Format date to a more readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Handle viewing a report (in a real application, this would open the report)
  const handleViewReport = (reportId: string) => {
    alert(`Viewing report ${reportId} (this would open the report in a production environment)`);
  };
  
  // Handle archiving a report
  const handleArchiveReport = (reportId: string) => {
    if (confirm('Are you sure you want to archive this report?')) {
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: 'archived' as const } 
          : report
      ));
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4 md:mb-0">Audit Report History</h2>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'archived')}
            className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Reports</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      
      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Protocol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Report Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No reports found
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className={report.status === 'archived' ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {report.protocolName}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {report.protocolAddress.substring(0, 6)}...{report.protocolAddress.substring(38)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {report.reportType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      View
                    </button>
                    
                    {report.status === 'completed' && (
                      <button
                        onClick={() => handleArchiveReport(report.id)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 