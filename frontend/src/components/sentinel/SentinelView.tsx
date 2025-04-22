import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProtocolByAddress } from '../../services/web3';
import { formatTimestamp, formatAddress, getRiskColor } from '../../utils/formatters';
import { LoadingSpinner } from '../LoadingSpinner';
import { InsurancePanel } from './InsurancePanel';
import { useUserExposure } from '../../hooks/useUserExposure';
import { Protocol } from '../../types';

const SentinelView: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insurancePurchased, setInsurancePurchased] = useState(false);
  
  const { exposure, loading: exposureLoading, error: exposureError } = useUserExposure(address);

  useEffect(() => {
    const fetchProtocol = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        const data = await getProtocolByAddress(address);
        setProtocol(data);
      } catch (err) {
        setError('Failed to load protocol details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProtocol();
  }, [address]);

  const handlePurchaseInsurance = (plan: any) => {
    // In a real implementation, this would call a service to process the purchase
    console.log('Purchasing plan:', plan);
    setInsurancePurchased(true);
    
    // Mock successful purchase
    setTimeout(() => {
      setInsurancePurchased(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-red-600 mt-2">{error || 'Protocol not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Protocol Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{protocol.name}</h1>
                <p className="text-gray-500 mt-1">
                  {formatAddress(protocol.address)}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full ${getRiskColor(protocol.riskScore)}`}>
                <span className="font-semibold">Risk Score: {protocol.riskScore}/100</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className={`mt-1 font-semibold ${protocol.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {protocol.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1 font-semibold text-gray-800">
                  {formatTimestamp(protocol.lastUpdateTime)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Anomalies Detected</h3>
                <p className="mt-1 font-semibold text-gray-800">
                  {protocol.anomalyCount || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">TVL</h3>
                <p className="mt-1 font-semibold text-gray-800">
                  {protocol.tvl ? `$${protocol.tvl.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </div>
            
            {protocol.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800">About</h3>
                <p className="mt-2 text-gray-600">{protocol.description}</p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800">Your Exposure</h3>
              {exposureLoading ? (
                <div className="mt-2 flex items-center">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-500">Loading your exposure data...</span>
                </div>
              ) : exposureError ? (
                <p className="mt-2 text-red-600">Failed to load exposure data</p>
              ) : exposure ? (
                <p className="mt-2 text-xl font-bold text-blue-700">${exposure.toLocaleString()}</p>
              ) : (
                <p className="mt-2 text-gray-600">You don't have any exposure to this protocol</p>
              )}
            </div>
          </div>
          
          {/* Risk Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Analysis</h2>
            
            {/* Here you would include more detailed risk metrics components */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Smart Contract Security</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {Math.floor(70 + Math.random() * 20)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Liquidity Depth</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {Math.floor(60 + Math.random() * 30)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Governance Structure</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {Math.floor(65 + Math.random() * 25)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Market Risk</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {Math.floor(50 + Math.random() * 30)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Insurance Panel */}
        <div className="lg:col-span-1">
          {insurancePurchased ? (
            <div className="bg-green-50 rounded-lg p-6 shadow-md text-center">
              <svg className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-xl font-semibold text-green-800 mt-4">Insurance Purchased!</h2>
              <p className="text-green-600 mt-2">
                Your assets are now protected. You can view your coverage details in your account.
              </p>
            </div>
          ) : (
            <InsurancePanel
              protocol={protocol}
              onPurchase={handlePurchaseInsurance}
              isPurchased={insurancePurchased}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SentinelView; 