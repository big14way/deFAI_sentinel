import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getAllProtocols } from '../../services/web3';
import { Protocol } from '../../types/protocol';
import { ComplianceReportCard } from '../../components/institutional/ComplianceReportCard';
import { RiskExposureChart } from '../../components/institutional/RiskExposureChart';
import { ApiKeyManager } from '../../components/institutional/ApiKeyManager';
import { InstitutionalMetrics } from '../../components/institutional/InstitutionalMetrics';

const InstitutionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [exposureData, setExposureData] = useState<any>({});
  const [reportData, setReportData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'api' | 'reports'>('overview');

  // Fetch protocol data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const protocolData = await getAllProtocols();
        setProtocols(protocolData);
        
        // Generate mock exposure data based on protocols
        const exposureByRisk = {
          high: protocolData.filter(p => p.riskScore > 70).reduce((sum, p) => sum + (p.tvl || 0), 0),
          medium: protocolData.filter(p => p.riskScore >= 30 && p.riskScore <= 70).reduce((sum, p) => sum + (p.tvl || 0), 0),
          low: protocolData.filter(p => p.riskScore < 30).reduce((sum, p) => sum + (p.tvl || 0), 0),
        };
        
        const exposureByCategory = protocolData.reduce((acc: any, protocol) => {
          const category = protocol.category || 'other';
          acc[category] = (acc[category] || 0) + (protocol.tvl || 0);
          return acc;
        }, {});
        
        setExposureData({
          byRisk: exposureByRisk,
          byCategory: exposureByCategory,
        });
        
        // Mock compliance report data
        setReportData([
          { id: 'rep-001', title: 'Quarterly Risk Assessment', date: new Date().toISOString(), status: 'ready' },
          { id: 'rep-002', title: 'Monthly Compliance Audit', date: new Date().toISOString(), status: 'ready' },
          { id: 'rep-003', title: 'Weekly DeFi Exposure Report', date: new Date().toISOString(), status: 'ready' },
        ]);
        
      } catch (error) {
        console.error('Error fetching protocols:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDownloadReport = (reportId: string) => {
    // In a real application, this would generate and download the actual report
    console.log(`Downloading report ${reportId}`);
    alert(`Report ${reportId} would be downloaded in production mode`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institutional Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Enterprise risk management and compliance tools</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/api-docs')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          API Documentation
        </button>
      </div>

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
              <InstitutionalMetrics 
                totalExposure={Object.values(exposureData.byRisk).reduce((a: number, b: number) => a + b, 0)}
                highRiskExposure={exposureData.byRisk.high}
                protocolCount={protocols.length}
                anomalyCount={protocols.reduce((sum, p) => sum + (p.anomalyCount || 0), 0)}
              />
              <div className="mt-6">
                <RiskExposureChart 
                  exposureByRisk={exposureData.byRisk}
                  exposureByCategory={exposureData.byCategory}
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Compliance Reports</h2>
              <div className="space-y-4">
                {reportData.map((report) => (
                  <ComplianceReportCard
                    key={report.id}
                    title={report.title}
                    date={new Date(report.date)}
                    status={report.status}
                    onDownload={() => handleDownloadReport(report.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Compliance Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Compliance report cards would go here */}
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
            <ApiKeyManager />
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
                  {protocols.map((protocol) => (
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