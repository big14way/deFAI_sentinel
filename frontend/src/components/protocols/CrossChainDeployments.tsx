import React, { useEffect, useState } from 'react';
import { Protocol } from '../../types/protocol';
import { getProtocolWithDeployments, getProtocolCrossChainLinks } from '../../services/web3';
import { getChainName, getChainColor, getExplorerUrl } from '../../utils/chains';
import { formatCurrency, formatTimestamp } from '../../utils/formatters';
import { LoadingSpinner } from '../LoadingSpinner';

interface CrossChainDeploymentsProps {
  protocol: Protocol;
}

const CrossChainDeployments: React.FC<CrossChainDeploymentsProps> = ({ protocol }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crossChainData, setCrossChainData] = useState<Protocol | null>(null);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchCrossChainData = async () => {
      try {
        setLoading(true);
        
        // Get protocol with all deployments
        const data = await getProtocolWithDeployments(protocol.address);
        setCrossChainData(data);
        
        // Get cross-chain links
        const linksData = await getProtocolCrossChainLinks(protocol.address);
        setLinks(linksData);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching cross-chain data:', err);
        setError(err.message || 'Failed to fetch cross-chain data');
        setLoading(false);
      }
    };
    
    fetchCrossChainData();
  }, [protocol.address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <LoadingSpinner size="md" />
        <span className="ml-3 text-gray-600">Loading cross-chain data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p className="font-medium">Error loading cross-chain data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!crossChainData || !crossChainData.deployments || Object.keys(crossChainData.deployments).length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700">
        <p>This protocol doesn't have any detected cross-chain deployments.</p>
      </div>
    );
  }

  const renderDeployments = () => {
    const chainIds = Object.keys(crossChainData.deployments).map(Number);
    const currentChainId = crossChainData.chainId || 8453; // Default to Base if not set
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Deployments</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current chain */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getChainColor(currentChainId)}50` }}
                >
                  <span className="text-xs font-semibold" style={{ color: getChainColor(currentChainId) }}>
                    {getChainName(currentChainId).charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{getChainName(currentChainId)}</span>
              </div>
              <div className="text-xs text-blue-700 px-2 py-1 bg-blue-100 rounded-full">Primary</div>
            </div>
            
            <div className="text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <a href={getExplorerUrl(currentChainId, protocol.address)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                  {protocol.address.substring(0, 6)}...{protocol.address.substring(protocol.address.length - 4)}
                </a>
              </div>
              
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Risk Score</span>
                <span className="font-medium">{protocol.riskScore}%</span>
              </div>
              
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">TVL</span>
                <span className="font-medium">{protocol.tvl ? formatCurrency(protocol.tvl) : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Other chains */}
          {chainIds.map(chainId => (
            <div key={chainId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getChainColor(chainId)}50` }}
                >
                  <span className="text-xs font-semibold" style={{ color: getChainColor(chainId) }}>
                    {getChainName(chainId).charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{getChainName(chainId)}</span>
              </div>
              
              <div className="text-sm mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address</span>
                  <a href={getExplorerUrl(chainId, crossChainData.deployments[chainId])} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                    {crossChainData.deployments[chainId].substring(0, 6)}...{crossChainData.deployments[chainId].substring(crossChainData.deployments[chainId].length - 4)}
                  </a>
                </div>
                
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="font-medium">{
                    links.find(
                      link => 
                        (link.sourceChainId === chainId && link.targetChainId === currentChainId) ||
                        (link.sourceChainId === currentChainId && link.targetChainId === chainId)
                    )?.lastActivity
                      ? formatTimestamp(links.find(
                          link => 
                            (link.sourceChainId === chainId && link.targetChainId === currentChainId) ||
                            (link.sourceChainId === currentChainId && link.targetChainId === chainId)
                        )?.lastActivity)
                      : 'Unknown'
                  }</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCrossChainRisk = () => {
    if (!crossChainData.crossChainRiskScore) {
      return null;
    }

    const regularRisk = protocol.riskScore;
    const crossChainRisk = crossChainData.crossChainRiskScore;
    const riskDifference = crossChainRisk - regularRisk;
    
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Cross-Chain Risk Assessment</h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="text-gray-600 text-sm">Individual Risk Score</div>
              <div className="font-semibold text-xl">{regularRisk}%</div>
            </div>
            
            <div className="text-gray-500">→</div>
            
            <div className="space-y-1">
              <div className="text-gray-600 text-sm">Cross-Chain Risk Score</div>
              <div className={`font-semibold text-xl ${
                riskDifference > 0 ? 'text-red-600' : 
                riskDifference < 0 ? 'text-green-600' : 
                'text-gray-900'
              }`}>
                {crossChainRisk}%
                {riskDifference !== 0 && (
                  <span className="text-sm ml-1">
                    ({riskDifference > 0 ? '+' : ''}{riskDifference}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Individual Protocol Risk</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    regularRisk >= 75 ? 'bg-red-600' :
                    regularRisk >= 50 ? 'bg-orange-500' :
                    regularRisk >= 25 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${regularRisk}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Cross-Chain Risk</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    crossChainRisk >= 75 ? 'bg-red-600' :
                    crossChainRisk >= 50 ? 'bg-orange-500' :
                    crossChainRisk >= 25 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${crossChainRisk}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <p className="font-medium">Risk Analysis</p>
            <p className="text-gray-600 mt-1">
              {riskDifference > 10 
                ? `The protocol has a significantly higher risk profile when considering its cross-chain deployments. The increased risk is likely due to potential bridge vulnerabilities and cross-chain communication complexities.`
                : riskDifference > 0
                ? `The protocol has a slightly higher risk when considering its cross-chain deployments. Monitor bridge transactions and cross-chain assets closely.`
                : riskDifference < 0
                ? `The protocol benefits from cross-chain diversification, which slightly reduces its overall risk profile.`
                : `The protocol's cross-chain deployments don't significantly impact its risk profile.`
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBridgeConnections = () => {
    if (links.length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">Bridge Connections</h3>
        
        <div className="space-y-3">
          {links.map((link, index) => {
            const sourceName = getChainName(link.sourceChainId);
            const targetName = getChainName(link.targetChainId);
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${getChainColor(link.sourceChainId)}50` }}
                    >
                      <span className="text-xs font-semibold" style={{ color: getChainColor(link.sourceChainId) }}>
                        {sourceName.charAt(0)}
                      </span>
                    </div>
                    <div className="text-gray-500">→</div>
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${getChainColor(link.targetChainId)}50` }}
                    >
                      <span className="text-xs font-semibold" style={{ color: getChainColor(link.targetChainId) }}>
                        {targetName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    link.riskScore >= 75 ? 'bg-red-100 text-red-800' :
                    link.riskScore >= 50 ? 'bg-orange-100 text-orange-800' :
                    link.riskScore >= 25 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Risk: {link.riskScore}%
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bridge</span>
                    <a href={getExplorerUrl(link.sourceChainId, link.bridgeAddress)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                      {link.bridgeAddress.substring(0, 6)}...{link.bridgeAddress.substring(link.bridgeAddress.length - 4)}
                    </a>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">24h Volume</span>
                    <span className="font-medium">{formatCurrency(link.volumeLast24h)}</span>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-medium">{formatTimestamp(link.lastActivity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Cross-Chain Deployments</h2>
          <div 
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              links.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {links.length} Connection{links.length !== 1 ? 's' : ''}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Monitor {protocol.name}'s deployments across multiple blockchain networks
        </p>
      </div>
      
      <div className="p-6">
        {renderDeployments()}
        {renderCrossChainRisk()}
        {renderBridgeConnections()}
      </div>
    </div>
  );
};

export default CrossChainDeployments; 