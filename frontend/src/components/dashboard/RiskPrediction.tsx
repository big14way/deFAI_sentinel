import React, { useState, useEffect } from 'react';
import { Protocol } from '../../types/protocol';
import { formatTimestamp } from '../../utils/formatters';
import { LoadingSpinner } from '../LoadingSpinner';

interface RiskPredictionProps {
  protocol: Protocol;
  loading?: boolean;
}

interface PredictionResult {
  currentRisk: number;
  predictedRisk: number;
  confidenceScore: number;
  factors: PredictionFactor[];
  timeframe: string;
  lastUpdated: number;
}

interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1, negative means reduces risk
  description: string;
}

const RiskPrediction: React.FC<RiskPredictionProps> = ({ protocol, loading = false }) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  // In a real implementation, this would come from an API call to an ML service
  useEffect(() => {
    if (!protocol || loading) return;

    // Simulate loading time for ML prediction
    const timer = setTimeout(() => {
      // This is mock data - in a real app, this would come from the backend ML service
      const mockPrediction: PredictionResult = {
        currentRisk: protocol.riskScore,
        predictedRisk: calculatePredictedRisk(protocol),
        confidenceScore: 0.75 + Math.random() * 0.2,
        timeframe: '30 days',
        lastUpdated: Date.now(),
        factors: generateRiskFactors(protocol)
      };

      setPrediction(mockPrediction);
    }, 1500);

    return () => clearTimeout(timer);
  }, [protocol, loading]);

  // Calculate a simulated predicted risk score
  const calculatePredictedRisk = (protocol: Protocol): number => {
    // For demo purposes, we'll generate a value close to but different from current risk
    // In reality, this would be calculated by a proper ML model
    const volatility = 15; // How much the prediction can differ from current
    const direction = Math.random() > 0.5 ? 1 : -1; // Randomly increase or decrease
    const change = Math.random() * volatility * direction;
    
    // More likely to increase risk for protocols with certain characteristics
    let bias = 0;
    
    // TVL as a factor (lower TVL suggests higher potential risk growth)
    if (protocol.tvl && protocol.tvl < 1000000) bias += 5;
    
    // Anomaly history as a factor
    if (protocol.anomalyCount && protocol.anomalyCount > 0) bias += protocol.anomalyCount * 2;
    
    // Apply constraints to keep within 0-100 range
    return Math.min(100, Math.max(0, protocol.riskScore + change + bias));
  };

  // Generate believable risk factors
  const generateRiskFactors = (protocol: Protocol): PredictionFactor[] => {
    const factors: PredictionFactor[] = [];
    
    // Add TVL-related factor if applicable
    if (protocol.tvl) {
      if (protocol.tvl < 10000000) {
        factors.push({
          name: 'Low TVL',
          impact: 0.35,
          description: 'Low Total Value Locked increases vulnerability to market manipulation and flash loan attacks.'
        });
      } else {
        factors.push({
          name: 'Substantial TVL',
          impact: -0.2,
          description: 'Higher Total Value Locked provides more stability and resistance to price manipulation.'
        });
      }
    }
    
    // Add anomaly-related factor if applicable
    if (protocol.anomalyCount && protocol.anomalyCount > 0) {
      factors.push({
        name: 'Historical Anomalies',
        impact: 0.45,
        description: `${protocol.anomalyCount} previous anomalies detected, suggesting potential recurring vulnerabilities.`
      });
    } else {
      factors.push({
        name: 'Clean History',
        impact: -0.15,
        description: 'No historical anomalies detected, indicating robust security practices.'
      });
    }
    
    // Add time-based factors
    if (protocol.lastUpdateTime) {
      const daysSinceUpdate = Math.floor((Date.now() - protocol.lastUpdateTime) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 30) {
        factors.push({
          name: 'Stagnant Protocol',
          impact: 0.3,
          description: `No updates for ${daysSinceUpdate} days, suggesting potential abandonment or reduced maintenance.`
        });
      }
    }
    
    // Add some random but believable factors
    const possibleFactors = [
      {
        name: 'Smart Contract Complexity',
        impact: 0.25,
        description: 'High code complexity increases the likelihood of unforeseen vulnerabilities.'
      },
      {
        name: 'Governance Concentration',
        impact: 0.4,
        description: 'Voting power is concentrated among a small number of addresses, creating centralization risk.'
      },
      {
        name: 'External Dependency Risk',
        impact: 0.3,
        description: 'Protocol relies on multiple external services or oracles, increasing attack surface.'
      },
      {
        name: 'Recent Security Audit',
        impact: -0.35,
        description: 'Comprehensive security audit conducted within the last 3 months by a reputable firm.'
      },
      {
        name: 'Bug Bounty Program',
        impact: -0.2,
        description: 'Active bug bounty program with substantial rewards incentivizes responsible disclosure.'
      },
      {
        name: 'Oracle Diversification',
        impact: -0.25,
        description: 'Protocol uses multiple oracle sources to mitigate manipulation risk.'
      }
    ];
    
    // Add 2-3 random factors
    const numRandomFactors = 2 + Math.floor(Math.random() * 2);
    const selectedIndexes = new Set<number>();
    
    while (selectedIndexes.size < numRandomFactors && selectedIndexes.size < possibleFactors.length) {
      const randomIndex = Math.floor(Math.random() * possibleFactors.length);
      selectedIndexes.add(randomIndex);
    }
    
    selectedIndexes.forEach(index => {
      factors.push(possibleFactors[index]);
    });
    
    return factors;
  };

  // Render a color based on risk difference trend
  const getRiskDifferenceColor = (current: number, predicted: number): string => {
    const difference = predicted - current;
    if (difference > 5) return 'text-red-600';
    if (difference > 0) return 'text-orange-500';
    if (difference < -5) return 'text-green-600';
    if (difference < 0) return 'text-green-500';
    return 'text-gray-600';
  };

  const getConfidenceLabel = (score: number): string => {
    if (score > 0.9) return 'Very High';
    if (score > 0.7) return 'High';
    if (score > 0.5) return 'Moderate';
    if (score > 0.3) return 'Low';
    return 'Very Low';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">AI Risk Prediction</h2>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-4 text-gray-500">Processing protocol data...</span>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">AI Risk Prediction</h2>
        <div className="text-center py-8 text-gray-500">
          Select a protocol to view risk predictions
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">AI Risk Prediction</h2>
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="mt-4 text-gray-600">Analyzing {protocol.name}...</p>
          <p className="text-sm text-gray-500 mt-2">Our AI is processing on-chain data and smart contract patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">AI Risk Prediction</h2>
          <div className="flex items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Beta
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Forecasted risk assessment for {protocol.name} over the next {prediction.timeframe}
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            {protocol.logoUrl ? (
              <img src={protocol.logoUrl} alt={protocol.name} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">
                  {protocol.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{protocol.name}</h3>
              <p className="text-sm text-gray-500">{protocol.category || 'DeFi Protocol'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-sm text-gray-500">Current Risk</div>
              <div className="text-2xl font-bold">{prediction.currentRisk.toFixed(1)}%</div>
            </div>

            <div className="flex items-center">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500">Predicted Risk</div>
              <div className={`text-2xl font-bold ${getRiskDifferenceColor(prediction.currentRisk, prediction.predictedRisk)}`}>
                {prediction.predictedRisk.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Prediction Confidence</h3>
            <div className="text-sm font-medium">{getConfidenceLabel(prediction.confidenceScore)}</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${prediction.confidenceScore * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Based on available data quality and historical protocol behavior patterns
          </p>
        </div>

        <h3 className="font-semibold mb-3">Contributing Factors</h3>
        <div className="space-y-3">
          {prediction.factors.map((factor) => (
            <div 
              key={factor.name}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedFactor(expandedFactor === factor.name ? null : factor.name)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full mr-3 ${factor.impact > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  ></div>
                  <span className="font-medium">{factor.name}</span>
                </div>
                <div className="flex items-center">
                  <span 
                    className={`text-sm font-medium ${factor.impact > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                  </span>
                  <svg 
                    className={`h-5 w-5 ml-2 transition-transform ${expandedFactor === factor.name ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expandedFactor === factor.name && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-700">{factor.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Last updated: {formatTimestamp(prediction.lastUpdated)}</span>
          <span>Powered by DeFAI ML</span>
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction; 