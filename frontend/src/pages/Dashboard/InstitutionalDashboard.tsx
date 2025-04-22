import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getAllProtocols } from '../../services/web3';
import { Protocol } from '../../types/protocol';
import { ComplianceReportCard } from '../../components/institutional/ComplianceReportCard';
import { RiskExposureChart } from '../../components/institutional/RiskExposureChart';
import { ApiKeyManager } from '../../components/institutional/ApiKeyManager';
import { InstitutionalMetrics } from '../../components/institutional/InstitutionalMetrics';

// Mock data for compliance reports
const mockReports = [
  {
    id: 'report-1',
    title: 'Q2 2023 DeFi Risk Assessment',
    date: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'report-2',
    title: 'Monthly Protocol Audit Summary',
    date: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
    status: 'completed',
    downloadUrl: '#'
  },
  {
    id: 'report-3',
    title: 'Regulatory Compliance Analysis',
    date: Date.now() - 1000 * 60 * 60 * 24 * 20, // 20 days ago
    status: 'completed',
    downloadUrl: '#'
  }
];

// Mock exposure data
const mockExposureData = {
  byRisk: {
    low: 3500000,
    medium: 5200000,
    high: 1800000,
    critical: 500000
  },
  byCategory: {
    lending: 4200000,
    dex: 3100000,
    derivatives: 1800000,
    yield: 900000,
    asset: 1000000
  }
};

// Mock protocols
const mockProtocols = [
  {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    name: 'Aave',
    riskScore: 35,
    anomalyCount: 0
  },
  {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    name: 'Uniswap',
    riskScore: 25,
    anomalyCount: 1
  },
  {
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    name: 'Compound',
    riskScore: 40,
    anomalyCount: 2
  }
];

const InstitutionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected] = useState(true); // Always assume connected for mock data
  const [loading, setLoading] = useState(true);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<any[]>(mockProtocols);
  const [exposureData, setExposureData] = useState<any>(mockExposureData);
  const [reportData, setReportData] = useState<any[]>(mockReports);
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'api' | 'reports'>('overview');

  // Load protocols on component mount
  useEffect(() => {
    const loadProtocols = async () => {
      try {
        // Clear any previous errors
        setProtocolsError(null);
        setProtocolsLoading(true);
        
        // Try to get protocols but fallback to mock data
        const protocolsData = await getAllProtocols();
        
        // Check if we received valid data
        if (protocolsData && Array.isArray(protocolsData) && protocolsData.length > 0) {
          setProtocols(protocolsData);
        } else {
          console.log('Using mock protocols data as fallback');
          setProtocolsError('No protocols data returned from API. Using fallback data.');
          // Keep the mock data set in the initial state
        }
      } catch (error) {
        console.error('Error loading protocols:', error);
        setProtocolsError('Failed to load protocols data. Using fallback data.');
        // Keep using mock data if there's an error - already set in initial state
      } finally {
        setProtocolsLoading(false);
        setLoading(false);
      }
    };

    // Simulate loading time for demonstration purposes
    const timer = setTimeout(() => {
      loadProtocols();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle download report
  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would trigger a download or open a new tab
    alert(`Downloading report ${reportId}`);
  };

  // Simple metric component
  const MetricCard = ({ title, value, isLoading = false }: { title: string, value: string | number, isLoading?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      {isLoading ? (
        <div className="h-8 mt-2 flex items-center">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <p className="text-2xl font-bold mt-2">{value}</p>
      )}
    </div>
  );

  // Simple chart component
  const Chart = ({ title, data }: { title: string, data: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-around">
        {Object.entries(data).map(([key, value]: [string, any]) => (
          <div key={key} className="flex flex-col items-center">
            <div 
              className="bg-blue-500 w-12 rounded-t-sm" 
              style={{ 
                height: `${(Number(value) / Math.max(...Object.values(data).map(v => Number(v)))) * 100}%`,
                minHeight: '10%'
              }}
            ></div>
            <div className="text-xs text-gray-600 mt-1">{key}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Report card component
  const ReportCard = ({ report }: { report: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-medium text-gray-900 dark:text-white">{report.title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {new Date(report.date).toLocaleDateString()}
      </p>
      <button 
        onClick={() => handleDownloadReport(report.id)}
        className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Download
      </button>
    </div>
  );

  // Show loading spinner when loading
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  // Prepare error messages if there are any
  const errorBanner = error ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {error} Using fallback data instead.
          </p>
        </div>
      </div>
    </div>
  ) : null;

  const protocolsErrorBanner = protocolsError ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {protocolsError}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institutional Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Enterprise risk management and compliance tools</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          API Documentation
        </button>
      </div>

      {/* Display error banners if there are errors */}
      {errorBanner}
      {protocolsErrorBanner}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('compliance')}
          >
            Compliance Reports
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('api')}
          >
            API Access
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            Custom Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Exposure"
                  value={`$${(Object.values(exposureData.byRisk).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0) / 1000000).toFixed(1)}M`}
                  isLoading={protocolsLoading}
                />
                <MetricCard
                  title="High Risk Exposure"
                  value={`$${(exposureData.byRisk.high / 1000000).toFixed(1)}M`}
                  isLoading={protocolsLoading}
                />
                <MetricCard
                  title="Monitored Protocols"
                  value={protocols.length}
                  isLoading={protocolsLoading}
                />
                <MetricCard
                  title="Active Anomalies"
                  value={protocols.reduce((sum: number, p: any) => sum + (p.anomalyCount || 0), 0)}
                  isLoading={protocolsLoading}
                />
              </div>

              {protocolsLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6 h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" />
                  <span className="ml-4 text-gray-600">Loading exposure data...</span>
                </div>
              ) : (
                <>
                  <Chart 
                    title="Exposure by Risk Category"
                    data={exposureData.byRisk}
                  />
                  <Chart 
                    title="Exposure by Protocol Type"
                    data={exposureData.byCategory}
                  />
                </>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Compliance Reports</h2>
              
              {protocolsLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center">
                  <LoadingSpinner size="md" />
                  <span className="ml-4 text-gray-600">Loading reports...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportData.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Compliance Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Compliance report cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quarterly Risk Assessment</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Comprehensive analysis of all DeFi exposure with regulatory considerations.
                </p>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Generate Report
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Protocol Audit Summary</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Security and compliance status of all protocols in portfolio.
                </p>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Generate Report
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Exposure Limits Compliance</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Analysis of exposure against predefined institutional limits.
                </p>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 dark:text-white">API Access Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Active API Keys</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">Production Key</span>
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                    </div>
                    <button className="text-red-600 text-sm">Revoke</button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded font-mono text-sm mb-2">
                    sk_live_51KbdE2CkYuEXXXXXXXXXXXXX
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: 2023-03-15 • Last used: 1 hour ago
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate New API Key
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Custom Report Builder</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option>Portfolio Risk Assessment</option>
                  <option>Protocol Security Audit</option>
                  <option>Regulatory Compliance Analysis</option>
                  <option>TVL Exposure Breakdown</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Included Protocols
                </label>
                <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32">
                  {protocols.map((protocol: any) => (
                    <option key={protocol.address} value={protocol.address}>
                      {protocol.name} (Risk Score: {protocol.riskScore})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionalDashboard; 