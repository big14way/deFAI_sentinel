import React from 'react';
import { Protocol, RiskAssessment } from '../../types';

interface ProtocolListProps {
  protocols: Protocol[];
  onViewDetails: (id: string) => void;
}

const ProtocolList: React.FC<ProtocolListProps> = ({ protocols, onViewDetails }) => {
  // Helper functions for risk scores
  const getRiskClass = (score: number) => {
    if (score < 30) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  if (protocols.length === 0) {
    return <p className="text-gray-500">No protocols found.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {protocols.map((protocol) => (
          <div 
            key={protocol.id || protocol.address} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onViewDetails(protocol.id || protocol.address)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {protocol.logoUrl && (
                  <img 
                    src={protocol.logoUrl} 
                    alt={protocol.name} 
                    className="w-10 h-10 mr-3 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; 
                      target.src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg';
                    }}
                  />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{protocol.name}</h3>
                  <div className="text-sm text-gray-500">
                    TVL: ${(typeof protocol.tvl === 'number' ? protocol.tvl : 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskClass(protocol.riskScore || 0)}`}>
                  {getRiskLabel(protocol.riskScore || 0)}
                </span>
                <span className="text-sm text-gray-500">
                  {protocol.riskScore?.toFixed(1) || 'N/A'}/100
                </span>
              </div>
            </div>
            
            {/* Risk Components */}
            {typeof protocol.riskComponents === 'object' && protocol.riskComponents && (
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <div className="flex flex-col items-center p-1 rounded bg-gray-50">
                  <span className="text-gray-600">TVL</span>
                  <span className={`font-medium ${getRiskClass((protocol.riskComponents as RiskAssessment).tvlRisk || 0)}`}>
                    {(protocol.riskComponents as RiskAssessment).tvlRisk || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-1 rounded bg-gray-50">
                  <span className="text-gray-600">Volatility</span>
                  <span className={`font-medium ${getRiskClass((protocol.riskComponents as RiskAssessment).volatilityRisk || 0)}`}>
                    {(protocol.riskComponents as RiskAssessment).volatilityRisk || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-1 rounded bg-gray-50">
                  <span className="text-gray-600">Age</span>
                  <span className={`font-medium ${getRiskClass((protocol.riskComponents as RiskAssessment).ageRisk || 0)}`}>
                    {(protocol.riskComponents as RiskAssessment).ageRisk || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-1 rounded bg-gray-50">
                  <span className="text-gray-600">Audit</span>
                  <span className={`font-medium ${getRiskClass((protocol.riskComponents as RiskAssessment).auditRisk || 0)}`}>
                    {(protocol.riskComponents as RiskAssessment).auditRisk || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtocolList; 