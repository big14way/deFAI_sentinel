import React, { useState } from 'react';
import InsurancePanel from './InsurancePanel';
import { Protocol } from '../../types';

interface InsurancePlan {
  id: string;
  name: string;
  coverage: number;
  premium: number;
  duration: number;
  description: string;
}

export const InsuranceDemo: React.FC = () => {
  const [isPurchased, setIsPurchased] = useState(false);
  const [activePlan, setActivePlan] = useState<InsurancePlan | null>(null);
  
  // Sample protocol data
  const sampleProtocol: Protocol = {
    address: '0x1234567890123456789012345678901234567890',
    name: 'SampleFi Protocol',
    riskScore: 65,
    isActive: true,
    lastUpdateTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    anomalyCount: 2,
    lastAnomalyTime: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    tvl: 10000000, // $10M TVL
    description: 'A sample DeFi protocol for demonstration purposes'
  };

  const handlePurchase = (plan: InsurancePlan) => {
    setActivePlan(plan);
    setIsPurchased(true);
    
    // In a real app, you would integrate with a smart contract here
    console.log('Insurance purchased:', plan);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{sampleProtocol.name}</h2>
        <div className="text-sm text-gray-500">
          <p>Risk Score: <span className="font-medium">{sampleProtocol.riskScore}/100</span></p>
          <p>TVL: <span className="font-medium">${(sampleProtocol.tvl / 1000000).toFixed(2)}M</span></p>
        </div>
        
        {isPurchased && activePlan && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800">Active Insurance Plan</h3>
            <p className="text-sm text-blue-600 mt-1">
              {activePlan.name} - Coverage: ${(activePlan.coverage / 1000000).toFixed(2)}M
            </p>
          </div>
        )}
      </div>
      
      <InsurancePanel 
        protocol={sampleProtocol}
        onPurchase={handlePurchase}
        isPurchased={isPurchased}
      />
      
      {isPurchased && (
        <button
          className="mt-6 w-full py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          onClick={() => setIsPurchased(false)}
        >
          Reset Demo
        </button>
      )}
    </div>
  );
};

export default InsuranceDemo; 