import React, { useState, useEffect } from 'react';
import { getAllProtocols } from '../services/web3';
import RiskScoreCard from './RiskScoreCard';
import { Protocol } from '../types';
import { ProtocolHealthScore } from './protocols';
import AssetFlows from './dashboard/AssetFlows';
import DashboardStats from './dashboard/DashboardStats';

const Dashboard: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const data = await getAllProtocols();
        setProtocols(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching protocols:', err);
        setError('Failed to fetch protocols. Please try again later.');
        setLoading(false);
      }
    };

    fetchProtocols();

    // Set up real-time updates or polling if needed
    const intervalId = setInterval(fetchProtocols, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  // Filter valid protocols
  const validProtocols = protocols.filter(p => p && p.address);
  
  // Calculate stats for DashboardStats
  const totalProtocols = validProtocols.length;
  const activeProtocols = validProtocols.filter(p => p.isActive).length;
  const highRiskProtocols = validProtocols.filter(p => p.riskScore > 70).length;
  const totalTVL = validProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
  const recentAnomalies = validProtocols.reduce((sum, p) => sum + (p.anomalyCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DeFi Protocol Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {selectedProtocol ? (
            <div className="mb-8">
              <button 
                onClick={() => setSelectedProtocol(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center mb-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Dashboard
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskScoreCard protocol={selectedProtocol} />
                <ProtocolHealthScore protocol={selectedProtocol} />
              </div>
            </div>
          ) : (
            <>
              <DashboardStats 
                totalProtocols={totalProtocols}
                activeProtocols={activeProtocols}
                highRiskProtocols={highRiskProtocols}
                totalTVL={totalTVL}
                recentAnomalies={recentAnomalies}
              />
              
              <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {validProtocols.slice(0, 4).map((protocol) => (
                  <div key={protocol.address} onClick={() => setSelectedProtocol(protocol)} className="cursor-pointer">
                    <RiskScoreCard protocol={protocol} />
                  </div>
                ))}
              </div>
              
              <div className="my-8">
                <AssetFlows />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 