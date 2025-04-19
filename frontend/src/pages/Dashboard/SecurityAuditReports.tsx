import React, { useState, useEffect } from 'react';
import { getAllProtocols } from '../../services/web3';
import { Protocol } from '../../types/protocol';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AuditReportGenerator } from '../../components/audit/AuditReportGenerator';
import { ReportHistory } from '../../components/audit/ReportHistory';

const SecurityAuditReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const protocolData = await getAllProtocols();
        setProtocols(protocolData);
      } catch (error) {
        console.error('Error fetching protocols:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automated Audit Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-generated security analysis and risk assessment reports for DeFi protocols</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generator'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('generator')}
          >
            Report Generator
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Report History
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'generator' && (
          <AuditReportGenerator protocols={protocols} />
        )}
        
        {activeTab === 'history' && (
          <ReportHistory />
        )}
      </div>
    </div>
  );
};

export default SecurityAuditReports; 