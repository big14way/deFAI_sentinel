import React from 'react';
import { RiskAssessment } from '../../types';

interface RiskComponentsProps {
  riskComponents: RiskAssessment;
}

const RiskComponents: React.FC<RiskComponentsProps> = ({ riskComponents }) => {
  // Helper for risk class
  const getRiskClass = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper for risk label
  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Components</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TVL Risk */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">TVL Risk</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskClass(riskComponents.tvlRisk || 0)}`}>
              {riskComponents.tvlRisk || 'N/A'}/100
            </span>
            <span className="text-xs mt-1">{getRiskLabel(riskComponents.tvlRisk || 0)}</span>
          </div>
        </div>
        
        {/* Volatility Risk */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Volatility Risk</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskClass(riskComponents.volatilityRisk || 0)}`}>
              {riskComponents.volatilityRisk || 'N/A'}/100
            </span>
            <span className="text-xs mt-1">{getRiskLabel(riskComponents.volatilityRisk || 0)}</span>
          </div>
        </div>
        
        {/* Age Risk */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Age Risk</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskClass(riskComponents.ageRisk || 0)}`}>
              {riskComponents.ageRisk || 'N/A'}/100
            </span>
            <span className="text-xs mt-1">{getRiskLabel(riskComponents.ageRisk || 0)}</span>
          </div>
        </div>
        
        {/* Audit Risk */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">Audit Risk</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskClass(riskComponents.auditRisk || 0)}`}>
              {riskComponents.auditRisk || 'N/A'}/100
            </span>
            <span className="text-xs mt-1">{getRiskLabel(riskComponents.auditRisk || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Total Risk Score */}
      <div className="mt-4 flex justify-center">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-1">Total Risk Score</span>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskClass(riskComponents.totalScore || 0)}`}>
            {riskComponents.totalScore || 'N/A'}/100
          </span>
          <span className="text-xs mt-1">{getRiskLabel(riskComponents.totalScore || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskComponents; 