import React, { useState } from 'react';
import { getRiskColor } from '../../utils/formatters';
import { Protocol } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InsurancePlanOption {
  id: string;
  name: string;
  coverage: number;
  premium: number;
  description: string;
}

interface InsurancePanelProps {
  protocol: Protocol;
  userExposure: number | null;
  onPurchase?: (planId: string, coverage: number) => void;
}

export const InsurancePanel: React.FC<InsurancePanelProps> = ({
  protocol,
  userExposure,
  onPurchase
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Calculate insurance plans based on risk score and user exposure
  const getInsurancePlans = (): InsurancePlanOption[] => {
    const basePremiumRate = protocol.riskScore / 100;
    const exposure = userExposure && userExposure > 0 ? userExposure : 1000; // Default to $1000 if no exposure
    
    return [
      {
        id: 'basic',
        name: 'Basic Coverage',
        coverage: exposure * 0.5,
        premium: exposure * 0.5 * basePremiumRate * 0.8,
        description: 'Covers 50% of your exposure with a 20% discount on premium.'
      },
      {
        id: 'standard',
        name: 'Standard Coverage',
        coverage: exposure * 0.75,
        premium: exposure * 0.75 * basePremiumRate,
        description: 'Covers 75% of your exposure at standard premium rates.'
      },
      {
        id: 'premium',
        name: 'Premium Coverage',
        coverage: exposure * 1.0,
        premium: exposure * 1.0 * basePremiumRate * 1.2,
        description: 'Full coverage with priority claims processing.'
      }
    ];
  };

  const insurancePlans = getInsurancePlans();
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };
  
  const handlePurchase = () => {
    if (selectedPlanId && onPurchase) {
      const plan = insurancePlans.find(p => p.id === selectedPlanId);
      if (plan) {
        onPurchase(selectedPlanId, plan.coverage);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Available Insurance Plans
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Coverage options based on protocol risk assessment
        </p>
      </div>
      
      <div className="mt-4 space-y-4">
        {userExposure && userExposure > 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your Current Exposure: {formatCurrency(userExposure)}
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No exposure detected. Sample plans shown below.
            </p>
          </div>
        )}
        
        <div className="mt-4 grid gap-4">
          {insurancePlans.map((plan) => (
            <div 
              key={plan.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlanId === plan.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{plan.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                </div>
                <div className={`text-sm font-semibold ${getRiskColor(100 - protocol.riskScore)}`}>
                  {formatCurrency(plan.premium)}/mo
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Coverage Amount</span>
                </div>
                <div className="text-base font-medium text-gray-900 dark:text-white">
                  {formatCurrency(plan.coverage)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={!selectedPlanId}
          className={`w-full mt-4 py-2 px-4 rounded-md font-medium ${
            selectedPlanId 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          Purchase Insurance
        </button>
      </div>
    </div>
  );
}; 