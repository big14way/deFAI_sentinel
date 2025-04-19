import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllChains, 
  getProtocolsByChain,
  getAssetFlowsBetweenChains
} from '../services/web3';
import { getChainById, getChainName, getChainColor } from '../utils/chains';
import { Protocol } from '../types/protocol';
import { formatCurrency } from '../utils/formatters';
import { LoadingSpinner } from './LoadingSpinner';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface CrossChainMonitoringProps {
  selectedProtocolAddress?: string;
}

const CrossChainMonitoring: React.FC<CrossChainMonitoringProps> = ({ 
  selectedProtocolAddress 
}) => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chains, setChains] = useState<number[]>([]);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [protocolsByChain, setProtocolsByChain] = useState<{[chainId: number]: Protocol[]}>({});
  const [assetFlows, setAssetFlows] = useState<any>(null);
  const [selectedSourceChain, setSelectedSourceChain] = useState<number | null>(null);
  const [selectedTargetChain, setSelectedTargetChain] = useState<number | null>(null);
  
  // Track if wallet was ever connected to prevent auto-disconnect issues
  const [wasWalletEverConnected, setWasWalletEverConnected] = useState(false);
  
  // Update state when wallet is connected
  useEffect(() => {
    if (address) {
      setWasWalletEverConnected(true);
    }
  }, [address]);
  
  // Check if wallet needs reconnection
  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  // Load chains
  useEffect(() => {
    const fetchChains = async () => {
      try {
        setLoading(true);
        const chainsData = await getAllChains();
        setChains(chainsData);
        
        if (chainsData.length > 0) {
          setSelectedChain(chainsData[0]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching chains:', err);
        setError(err.message || 'Failed to fetch chains');
        setLoading(false);
      }
    };
    
    fetchChains();
  }, []);

  // Load protocols for selected chain
  useEffect(() => {
    if (!selectedChain) return;
    
    const fetchProtocols = async () => {
      try {
        if (protocolsByChain[selectedChain]) {
          // Already loaded
          return;
        }
        
        setLoading(true);
        const protocols = await getProtocolsByChain(selectedChain);
        
        setProtocolsByChain(prev => ({
          ...prev,
          [selectedChain]: protocols
        }));
        
        setLoading(false);
      } catch (err: any) {
        console.error(`Error fetching protocols for chain ${selectedChain}:`, err);
        setError(err.message || `Failed to fetch protocols for ${getChainName(selectedChain)}`);
        setLoading(false);
      }
    };
    
    fetchProtocols();
  }, [selectedChain, protocolsByChain]);

  // Load asset flows between chains
  useEffect(() => {
    if (!selectedSourceChain || !selectedTargetChain) return;
    
    const fetchAssetFlows = async () => {
      try {
        setLoading(true);
        const flows = await getAssetFlowsBetweenChains(selectedSourceChain, selectedTargetChain);
        
        // Ensure data exists even if the API returns null
        if (!flows) {
          // Create default data
          setAssetFlows({
            sourceChainId: selectedSourceChain,
            targetChainId: selectedTargetChain,
            totalVolume: 0,
            flowCount: 0,
            avgRiskScore: 0,
            links: [],
            historicalData: Array.from({ length: 7 }, (_, i) => {
              const day = new Date();
              day.setDate(day.getDate() - i);
              return {
                date: day.toISOString().split('T')[0],
                volume: 0,
                flowCount: 0
              };
            }).reverse()
          });
        } else {
          setAssetFlows(flows);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching asset flows:', err);
        setError(err.message || 'Failed to fetch asset flows');
        
        // Set default data on error
        setAssetFlows({
          sourceChainId: selectedSourceChain,
          targetChainId: selectedTargetChain,
          totalVolume: 0,
          flowCount: 0,
          avgRiskScore: 0,
          links: [],
          historicalData: Array.from({ length: 7 }, (_, i) => {
            const day = new Date();
            day.setDate(day.getDate() - i);
            return {
              date: day.toISOString().split('T')[0],
              volume: 0,
              flowCount: 0
            };
          }).reverse()
        });
        
        setLoading(false);
      }
    };
    
    fetchAssetFlows();
  }, [selectedSourceChain, selectedTargetChain]);

  const handleChainSelect = (chainId: number) => {
    setSelectedChain(chainId);
  };

  const handleProtocolClick = (protocol: Protocol) => {
    navigate(`/protocols/${protocol.address}`);
  };

  const handleFlowSelect = (sourceChainId: number, targetChainId: number) => {
    setSelectedSourceChain(sourceChainId);
    setSelectedTargetChain(targetChainId);
  };

  const renderChainSelector = () => (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {chains.map(chainId => (
        <button
          key={chainId}
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${
            selectedChain === chainId
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => handleChainSelect(chainId)}
        >
          {getChainById(chainId).iconUrl && (
            <img 
              src={getChainById(chainId).iconUrl} 
              alt={getChainName(chainId)} 
              className="w-5 h-5 rounded-full"
            />
          )}
          <span>{getChainName(chainId)}</span>
        </button>
      ))}
    </div>
  );

  const renderProtocolsByChain = () => {
    if (!selectedChain || !protocolsByChain[selectedChain]) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Select a chain to view protocols</p>
        </div>
      );
    }

    const protocols = protocolsByChain[selectedChain];

    if (protocols.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No protocols found on {getChainName(selectedChain)}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map(protocol => (
          <div 
            key={protocol.address}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProtocolClick(protocol)}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {protocol.logoUrl ? (
                    <img src={protocol.logoUrl} alt={protocol.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-semibold text-sm">{protocol.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <h3 className="font-semibold">{protocol.name}</h3>
                </div>
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getChainColor(protocol.chainId)}20`,
                    color: getChainColor(protocol.chainId)
                  }}
                >
                  {getChainName(protocol.chainId)}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 text-sm">Risk Score</span>
                <span className="font-medium">
                  {protocol.riskScore}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${
                    protocol.riskScore >= 75 ? 'bg-red-600' :
                    protocol.riskScore >= 50 ? 'bg-orange-500' :
                    protocol.riskScore >= 25 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${protocol.riskScore}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-600">Anomalies</div>
                  <div className="font-medium">{protocol.anomalyCount || 0}</div>
                </div>
                <div>
                  <div className="text-gray-600">TVL</div>
                  <div className="font-medium">{protocol.tvl ? formatCurrency(protocol.tvl) : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCrossChainConnections = () => {
    if (chains.length < 2) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Not enough chains to show connections</p>
        </div>
      );
    }

    // Create a matrix of connections
    const connections: Array<{sourceChainId: number, targetChainId: number, count: number}> = [];
    
    for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        const sourceChainId = chains[i];
        const targetChainId = chains[j];
        
        // Count connections (in a real app, this would be actual data)
        const count = Math.floor(Math.random() * 5) + 1;
        
        connections.push({
          sourceChainId,
          targetChainId,
          count
        });
      }
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cross-Chain Connections</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map(({ sourceChainId, targetChainId, count }) => (
            <div
              key={`${sourceChainId}-${targetChainId}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFlowSelect(sourceChainId, targetChainId)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getChainColor(sourceChainId)}20` }}
                  >
                    {getChainById(sourceChainId).iconUrl ? (
                      <img 
                        src={getChainById(sourceChainId).iconUrl!} 
                        alt={getChainName(sourceChainId)} 
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <span style={{ color: getChainColor(sourceChainId) }}>
                        {getChainName(sourceChainId).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500">→</div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getChainColor(targetChainId)}20` }}
                  >
                    {getChainById(targetChainId).iconUrl ? (
                      <img 
                        src={getChainById(targetChainId).iconUrl!} 
                        alt={getChainName(targetChainId)} 
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <span style={{ color: getChainColor(targetChainId) }}>
                        {getChainName(targetChainId).charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs">
                  {count} bridge{count !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium">
                  {getChainName(sourceChainId)} ⟷ {getChainName(targetChainId)}
                </div>
                <div className="text-gray-600 mt-1">
                  Click to view asset flows and risk analysis
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssetFlows = () => {
    if (!assetFlows) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Select a connection to view asset flows</p>
        </div>
      );
    }

    const { sourceChainId, targetChainId, totalVolume, flowCount, avgRiskScore, links, historicalData } = assetFlows;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Asset Flows: {getChainName(sourceChainId)} ⟷ {getChainName(targetChainId)}</h3>
            <button 
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setAssetFlows(null)}
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 text-sm">24h Volume</div>
              <div className="text-xl font-semibold">{formatCurrency(totalVolume)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 text-sm">Active Bridges</div>
              <div className="text-xl font-semibold">{flowCount}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-600 text-sm">Avg. Risk Score</div>
              <div className="text-xl font-semibold">{avgRiskScore.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Historical Volume (7 Days)</h4>
            <div className="h-48 bg-gray-50 rounded-lg p-4">
              {/* In a real app, this would be a proper chart using a library like recharts */}
              <div className="h-full flex items-end justify-around">
                {historicalData.map((day: any, i: number) => (
                  <div key={day.date} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-8 rounded-t-sm" 
                      style={{ 
                        height: `${(day.volume / Math.max(...historicalData.map((d: any) => d.volume))) * 100}%`,
                        minHeight: '10%'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">{day.date.slice(-5)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">Active Bridges</h4>
            <div className="space-y-3">
              {links.map((link: any) => (
                <div key={link.bridgeAddress} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium truncate max-w-xs">{link.bridgeAddress}</div>
                      <div className="text-sm text-gray-600">24h Volume: {formatCurrency(link.volumeLast24h)}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      link.riskScore >= 75 ? 'bg-red-100 text-red-800' :
                      link.riskScore >= 50 ? 'bg-orange-100 text-orange-800' :
                      link.riskScore >= 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Risk: {link.riskScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && chains.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-gray-600">Loading chain data...</span>
      </div>
    );
  }

  // Error state
  if (error && chains.length === 0) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Cross-Chain Monitoring</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor protocols across multiple chains and analyze inter-chain risks
          </p>
        </div>
        
        <div className="p-4">
          {renderChainSelector()}
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="md" />
              <span className="ml-4 text-gray-600">Loading data...</span>
            </div>
          ) : (
            <div className="mt-4">
              {renderProtocolsByChain()}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Cross-Chain Connections</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyze asset flows between chains and identify bridge vulnerabilities
          </p>
        </div>
        
        <div className="p-4">
          {renderCrossChainConnections()}
        </div>
      </div>
      
      {assetFlows && (
        <div className="mt-6">
          {renderAssetFlows()}
        </div>
      )}
    </div>
  );
};

export default CrossChainMonitoring; 