import React, { useState, useEffect } from 'react';
import { Protocol } from '../../types/protocol';
import { LoadingSpinner } from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

interface SimulationEnvironmentProps {
  protocol?: Protocol;
}

type ScenarioType = 'stress-test' | 'attack-vector' | 'historical-exploit';

interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number; // Percentage impact on protocol TVL
  complexity: 'simple' | 'moderate' | 'complex';
  duration: number; // Simulation duration in minutes
}

const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: 'flash-loan-attack',
    name: 'Flash Loan Attack',
    type: 'attack-vector',
    description: 'Simulates a flash loan attack that attempts to manipulate market prices temporarily to exploit the protocol.',
    riskLevel: 'high',
    estimatedImpact: 35,
    complexity: 'complex',
    duration: 5
  },
  {
    id: 'liquidity-drain',
    name: 'Rapid Liquidity Drain',
    type: 'stress-test',
    description: 'Tests how the protocol handles a scenario where 80% of liquidity is withdrawn in a short time period.',
    riskLevel: 'medium',
    estimatedImpact: 20,
    complexity: 'moderate',
    duration: 3
  },
  {
    id: 'governance-attack',
    name: 'Governance Takeover',
    type: 'attack-vector',
    description: 'Simulates an attack where an entity acquires enough governance tokens to force through malicious proposals.',
    riskLevel: 'critical',
    estimatedImpact: 65,
    complexity: 'complex',
    duration: 8
  },
  {
    id: 'price-oracle-manipulation',
    name: 'Price Oracle Manipulation',
    type: 'attack-vector',
    description: 'Tests the protocol's resistance to price oracle manipulation attacks.',
    riskLevel: 'high',
    estimatedImpact: 45,
    complexity: 'complex',
    duration: 6
  },
  {
    id: 'wormhole-exploit',
    name: 'Wormhole Bridge Exploit Replay',
    type: 'historical-exploit',
    description: 'Replays the $320M Wormhole bridge exploit to test if your protocol has similar vulnerabilities.',
    riskLevel: 'critical',
    estimatedImpact: 80,
    complexity: 'complex',
    duration: 10
  },
  {
    id: 'cream-finance-exploit',
    name: 'Cream Finance Flash Loan Replay',
    type: 'historical-exploit',
    description: 'Replays the Cream Finance $130M flash loan exploit from October 2021.',
    riskLevel: 'high',
    estimatedImpact: 55,
    complexity: 'complex',
    duration: 7
  },
  {
    id: 'market-crash',
    name: 'Market Crash Simulation',
    type: 'stress-test',
    description: 'Simulates how the protocol behaves during a 60% market downturn within a short time period.',
    riskLevel: 'medium',
    estimatedImpact: 30,
    complexity: 'moderate',
    duration: 4
  },
  {
    id: 're-entrancy',
    name: 'Re-entrancy Attack',
    type: 'attack-vector',
    description: 'Tests the protocol for re-entrancy vulnerabilities by attempting to exploit callback functions.',
    riskLevel: 'high',
    estimatedImpact: 50,
    complexity: 'moderate',
    duration: 5
  }
];

const SimulationEnvironment: React.FC<SimulationEnvironmentProps> = ({ protocol }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>(SAMPLE_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>(SAMPLE_SCENARIOS);
  const [filterType, setFilterType] = useState<ScenarioType | 'all'>('all');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<any | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredScenarios(scenarios);
    } else {
      setFilteredScenarios(scenarios.filter(scenario => scenario.type === filterType));
    }
  }, [filterType, scenarios]);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSimulationResults(null);
    setSimulationProgress(0);
    // Initialize custom parameters based on scenario type
    if (scenario.type === 'stress-test') {
      setCustomParams({
        intensityLevel: 5,
        duration: 10,
        recoveryPeriod: 5,
      });
    } else if (scenario.type === 'attack-vector') {
      setCustomParams({
        attackerFunds: 1000000,
        multiBlockExecution: true,
        flashLoanProvider: 'Aave',
      });
    } else if (scenario.type === 'historical-exploit') {
      setCustomParams({
        replaySpeed: 1,
        includePostExploitPatches: false,
        analyzeVulnerabilities: true,
      });
    }
  };

  const runSimulation = () => {
    if (!selectedScenario) return;

    setSimulationRunning(true);
    setSimulationProgress(0);
    setSimulationResults(null);

    // Mock simulation progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        const newProgress = prev + (100 / (selectedScenario.duration * 12));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setSimulationRunning(false);
          generateSimulationResults();
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
  };

  const generateSimulationResults = () => {
    // In a real app, this would come from a backend simulation service
    // Here we're generating mock results
    const protocolTVL = protocol?.tvl || 10000000;
    const impactPercentage = selectedScenario!.estimatedImpact;
    const impactAmount = (protocolTVL * impactPercentage) / 100;
    
    const vulnerabilities = [];
    if (Math.random() > 0.5) vulnerabilities.push('Input validation weakness');
    if (Math.random() > 0.7) vulnerabilities.push('Oracle dependency risks');
    if (Math.random() > 0.8) vulnerabilities.push('Access control issues');
    if (Math.random() > 0.9) vulnerabilities.push('Re-entrancy vulnerability');

    const result = {
      successful: Math.random() > 0.3, // 70% chance of successful exploit
      impactAmount,
      impactPercentage,
      vulnerabilities,
      recommendations: [
        'Implement additional slippage controls',
        'Enhance oracle security with multiple data sources',
        'Add time-locks for governance actions',
        'Implement circuit breakers for unusual activity',
      ],
      affectedUsers: Math.floor(Math.random() * 1000) + 100,
      logs: [
        'Simulation initialized',
        'Contract state snapshot created',
        'Applying attack vector...',
        'Monitoring protocol responses...',
        vulnerabilities.length > 0 ? 'Vulnerabilities detected!' : 'No critical vulnerabilities found',
        'Simulation completed',
      ],
      riskAssessment: {
        beforeSimulation: protocol?.riskScore || 50,
        afterSimulation: Math.min(100, (protocol?.riskScore || 50) + (vulnerabilities.length * 5)),
      }
    };

    setSimulationResults(result);
  };

  const handleCustomParamChange = (paramName: string, value: any) => {
    setCustomParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const renderScenarioFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className={`px-3 py-1 rounded-lg text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        onClick={() => setFilterType('all')}
      >
        All Scenarios
      </button>
      <button
        className={`px-3 py-1 rounded-lg text-sm ${filterType === 'stress-test' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        onClick={() => setFilterType('stress-test')}
      >
        Stress Tests
      </button>
      <button
        className={`px-3 py-1 rounded-lg text-sm ${filterType === 'attack-vector' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        onClick={() => setFilterType('attack-vector')}
      >
        Attack Vectors
      </button>
      <button
        className={`px-3 py-1 rounded-lg text-sm ${filterType === 'historical-exploit' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        onClick={() => setFilterType('historical-exploit')}
      >
        Historical Exploits
      </button>
    </div>
  );

  const renderScenarioList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredScenarios.map(scenario => (
        <div 
          key={scenario.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => handleSelectScenario(scenario)}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{scenario.name}</h3>
            <div className={`px-2 py-0.5 rounded-full text-xs ${
              scenario.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
              scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              scenario.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {scenario.riskLevel.charAt(0).toUpperCase() + scenario.riskLevel.slice(1)} Risk
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {scenario.description}
          </div>
          
          <div className="mt-3 flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Impact: {scenario.estimatedImpact}%</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{scenario.duration} min</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{scenario.complexity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCustomParameters = () => {
    if (!selectedScenario) return null;

    return (
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Customize Simulation Parameters</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(customParams).map(([param, value]) => {
            if (typeof value === 'number') {
              return (
                <div key={param} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={value}
                      onChange={(e) => handleCustomParamChange(param, parseInt(e.target.value))}
                      className="flex-grow"
                    />
                    <span className="text-sm font-medium w-7 text-center">{value}</span>
                  </div>
                </div>
              );
            } else if (typeof value === 'boolean') {
              return (
                <div key={param} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id={`toggle-${param}`}
                      checked={value}
                      onChange={(e) => handleCustomParamChange(param, e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"
                    />
                    <label
                      htmlFor={`toggle-${param}`}
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    ></label>
                  </div>
                </div>
              );
            } else if (typeof value === 'string') {
              return (
                <div key={param} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => handleCustomParamChange(param, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {param === 'flashLoanProvider' ? (
                      <>
                        <option value="Aave">Aave</option>
                        <option value="Compound">Compound</option>
                        <option value="dYdX">dYdX</option>
                        <option value="Maker">Maker</option>
                      </>
                    ) : (
                      <>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </>
                    )}
                  </select>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const renderSimulationProgress = () => {
    if (!simulationRunning && !simulationResults) return null;

    return (
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Simulation Progress</h3>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${simulationProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>0%</span>
          <span>Simulating {selectedScenario?.name}</span>
          <span>100%</span>
        </div>

        {simulationRunning && (
          <div className="mt-4 flex items-center justify-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-600">Running simulation...</span>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!simulationResults) return null;

    return (
      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="font-medium text-gray-900">Simulation Results</h3>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                {simulationResults.successful ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <h4 className="font-medium">
                  {simulationResults.successful 
                    ? `Vulnerability Detected: ${selectedScenario?.name} was successful`
                    : `Passed: ${selectedScenario?.name} was unsuccessful`
                  }
                </h4>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Impact Assessment</h4>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">Potential Financial Impact</div>
                  <div className="font-bold text-lg">{formatCurrency(simulationResults.impactAmount)}</div>
                  <div className="text-xs text-gray-500">Represents {simulationResults.impactPercentage}% of protocol TVL</div>
                </div>
                
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">Affected Users</div>
                  <div className="font-bold text-lg">{simulationResults.affectedUsers.toLocaleString()}</div>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm text-gray-600">Risk Score Impact</div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className={`px-2 py-1 rounded text-xs ${
                      simulationResults.riskAssessment.beforeSimulation >= 75 ? 'bg-red-100 text-red-800' :
                      simulationResults.riskAssessment.beforeSimulation >= 50 ? 'bg-orange-100 text-orange-800' :
                      simulationResults.riskAssessment.beforeSimulation >= 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Before: {simulationResults.riskAssessment.beforeSimulation}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className={`px-2 py-1 rounded text-xs ${
                      simulationResults.riskAssessment.afterSimulation >= 75 ? 'bg-red-100 text-red-800' :
                      simulationResults.riskAssessment.afterSimulation >= 50 ? 'bg-orange-100 text-orange-800' :
                      simulationResults.riskAssessment.afterSimulation >= 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      After: {simulationResults.riskAssessment.afterSimulation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Vulnerabilities Detected</h4>
              {simulationResults.vulnerabilities.length > 0 ? (
                <ul className="space-y-2">
                  {simulationResults.vulnerabilities.map((vuln: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-green-50 text-green-800 p-3 rounded">
                  No vulnerabilities detected
                </div>
              )}
              
              <h4 className="font-medium text-gray-900 mt-6 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {simulationResults.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Simulation Logs</h4>
            <div className="bg-gray-800 text-gray-200 rounded-lg p-4 text-sm font-mono">
              {simulationResults.logs.map((log: string, idx: number) => (
                <div key={idx}>{`[${idx + 1}] ${log}`}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Smart Contract Simulation Environment</h2>
          <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Beta</div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Test protocols under different scenarios to identify potential vulnerabilities
        </p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Select a Simulation Scenario</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose from pre-configured scenarios to simulate different attack vectors and stress tests
          </p>
          
          {renderScenarioFilters()}
          {renderScenarioList()}
        </div>
        
        {selectedScenario && (
          <>
            {renderCustomParameters()}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={runSimulation}
                disabled={simulationRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {simulationRunning ? 'Simulation Running...' : 'Run Simulation'}
              </button>
            </div>
            
            {renderSimulationProgress()}
            {renderResults()}
          </>
        )}
      </div>
    </div>
  );
};

export default SimulationEnvironment; 