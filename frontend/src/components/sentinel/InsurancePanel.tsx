import React, { useState } from 'react';
import { Protocol } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InsurancePlan {
  id: string;
  name: string;
  coverage: number;
  premium: number;
  duration: number; // in days
  description: string;
}

interface InsurancePanelProps {
  protocol: Protocol;
  onPurchase: (plan: InsurancePlan) => void;
  isPurchased: boolean;
}

export const InsurancePanel: React.FC<InsurancePanelProps> = ({ 
  protocol, 
  onPurchase,
  isPurchased
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Generate insurance plans based on protocol risk score
  const getInsurancePlans = (protocol: Protocol): InsurancePlan[] => {
    const basePremiumRate = 0.005; // 0.5% base rate
    const riskMultiplier = protocol.riskScore / 50; // Higher risk = higher premium
    
    return [
      {
        id: 'basic',
        name: 'Basic Protection',
        coverage: protocol.tvl * 0.1, // 10% of TVL
        premium: protocol.tvl * 0.1 * basePremiumRate * riskMultiplier,
        duration: 30,
        description: 'Basic coverage for minimal protection against protocol failures.'
      },
      {
        id: 'standard',
        name: 'Standard Protection',
        coverage: protocol.tvl * 0.25, // 25% of TVL
        premium: protocol.tvl * 0.25 * basePremiumRate * riskMultiplier * 0.95, // Small discount for larger coverage
        duration: 30,
        description: 'Standard coverage offering balanced protection for most users.'
      },
      {
        id: 'premium',
        name: 'Premium Protection',
        coverage: protocol.tvl * 0.5, // 50% of TVL
        premium: protocol.tvl * 0.5 * basePremiumRate * riskMultiplier * 0.9, // Larger discount for premium
        duration: 30,
        description: 'Comprehensive coverage for users with significant exposure.'
      }
    ];
  };

  const insurancePlans = getInsurancePlans(protocol);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = () => {
    if (selectedPlan) {
      const plan = insurancePlans.find(p => p.id === selectedPlan);
      if (plan) {
        onPurchase(plan);
      }
    }
  };

  if (isPurchased) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-medium text-green-800">Insurance Active</h3>
        </div>
        <p className="mt-2 text-sm text-green-700">
          Your investment in {protocol.name} is now protected. You'll receive notifications about any changes in risk status.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Options</h3>
      
      <div className="space-y-4">
        {insurancePlans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">{plan.name}</h4>
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {plan.duration} days
              </span>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">{plan.description}</div>
            
            <div className="mt-4 flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-500">Coverage</div>
                <div className="font-medium text-gray-900">{formatCurrency(plan.coverage)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Premium</div>
                <div className="font-medium text-gray-900">{formatCurrency(plan.premium)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        className={`mt-6 w-full py-2 px-4 rounded-md ${
          selectedPlan 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!selectedPlan}
        onClick={handlePurchase}
      >
        Purchase Insurance
      </button>
      
      <p className="mt-2 text-xs text-gray-500 text-center">
        Insurance is provided by DeFAI Sentinel Risk Pool and reserves the right to adjust terms based on protocol risk changes.
      </p>
    </div>
  );
};

export default InsurancePanel; 