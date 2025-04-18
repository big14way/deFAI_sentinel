import React, { useEffect, useRef, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import { Protocol } from '../../types/protocol';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../LoadingSpinner';

interface RiskVisualizationProps {
  protocols: Protocol[];
  loading?: boolean;
  mode?: 'network' | 'heatmap' | 'timeline';
}

const RiskVisualization: React.FC<RiskVisualizationProps> = ({ 
  protocols, 
  loading = false,
  mode = 'network' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  // Create graph data when protocols change
  useEffect(() => {
    if (!protocols.length) return;

    // Transform protocols to graph nodes
    const nodes = protocols.map(protocol => ({
      id: protocol.address,
      name: protocol.name,
      val: Math.max(10, protocol.tvl ? protocol.tvl / 1e8 : 20), // Node size based on TVL
      color: getRiskColor(protocol.riskScore),
      protocol // Store full protocol data
    }));

    // Create links between protocols (for demo purposes - in production this would be based on actual interactions)
    const links: any[] = [];
    
    // Create connections between protocols with similar risk scores or categories
    protocols.forEach((source, i) => {
      protocols.slice(i + 1).forEach(target => {
        // Connect if they have similar risk scores or same category
        if (
          Math.abs(source.riskScore - target.riskScore) < 15 || 
          source.category === target.category
        ) {
          links.push({
            source: source.address,
            target: target.address,
            value: 1 - Math.abs(source.riskScore - target.riskScore) / 100, // Strength based on risk similarity
          });
        }
      });
    });

    setGraphData({ nodes, links });
  }, [protocols]);

  // Adjust dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(500, window.innerHeight * 0.6)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Get color based on risk score
  const getRiskColor = (score: number): string => {
    if (score >= 75) return '#e53e3e'; // red
    if (score >= 50) return '#dd6b20'; // orange
    if (score >= 25) return '#d69e2e'; // yellow
    return '#38a169'; // green
  };

  const getRiskLabel = (score: number): string => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low-Medium Risk';
    return 'Low Risk';
  };

  const handleNodeClick = (node: any) => {
    setSelectedProtocol(node.protocol);
  };

  const renderNetworkGraph = () => (
    <ForceGraph3D
      graphData={graphData}
      width={dimensions.width}
      height={dimensions.height}
      nodeLabel={(node: any) => `${node.name}: Risk ${node.protocol.riskScore}%`}
      nodeColor="color"
      nodeVal="val"
      linkWidth={(link: any) => link.value * 3}
      linkOpacity={0.5}
      backgroundColor="#f9fafb"
      onNodeClick={handleNodeClick}
      nodeResolution={16} // Higher resolution for smoother nodes
      controlType="orbit"
    />
  );

  const renderHeatMap = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Protocol Risk Heatmap</h3>
      <div className="grid grid-cols-10 gap-1 mb-4">
        {protocols.sort((a, b) => b.riskScore - a.riskScore).map(protocol => (
          <div 
            key={protocol.address}
            className="aspect-square rounded-sm hover:transform hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
            style={{ 
              backgroundColor: getRiskColor(protocol.riskScore),
              opacity: 0.2 + protocol.riskScore / 125 // Adjust opacity based on risk
            }}
            onClick={() => setSelectedProtocol(protocol)}
            title={`${protocol.name}: ${protocol.riskScore}% risk`}
          >
            <span className="text-xs font-bold text-white text-center">
              {protocol.name.substring(0, 1)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Low Risk</span>
        <span>Medium Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Risk Score Evolution</h3>
      <div className="relative h-64 border border-gray-200 rounded p-4">
        {/* This is a placeholder - in a real implementation, we'd use a charting library */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-300"></div>
        <div className="absolute left-0 bottom-0 h-full w-px bg-gray-300"></div>
        
        {protocols.map((protocol, index) => (
          <div 
            key={protocol.address}
            className="absolute bottom-0 rounded-t cursor-pointer transition-all hover:opacity-80"
            style={{
              left: `${(index / protocols.length) * 100}%`,
              height: `${protocol.riskScore}%`,
              width: '20px',
              backgroundColor: getRiskColor(protocol.riskScore),
              transform: 'translateX(-10px)'
            }}
            onClick={() => setSelectedProtocol(protocol)}
            title={`${protocol.name}: ${protocol.riskScore}% risk`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        {protocols.slice(0, 5).map(p => (
          <span key={p.address} className="truncate max-w-[100px]">{p.name}</span>
        ))}
        {protocols.length > 5 && <span>+{protocols.length - 5} more</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={containerRef}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Risk Visualization</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => mode === 'network'}
              className={`px-3 py-1 text-sm rounded-md ${mode === 'network' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Network
            </button>
            <button 
              onClick={() => mode === 'heatmap'}
              className={`px-3 py-1 text-sm rounded-md ${mode === 'heatmap' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Heatmap
            </button>
            <button 
              onClick={() => mode === 'timeline'}
              className={`px-3 py-1 text-sm rounded-md ${mode === 'timeline' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" />
          <span className="ml-4 text-gray-500">Loading visualization data...</span>
        </div>
      ) : protocols.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No protocol data available for visualization
        </div>
      ) : (
        <div>
          <div className="visualization-container">
            {mode === 'network' && renderNetworkGraph()}
            {mode === 'heatmap' && renderHeatMap()}
            {mode === 'timeline' && renderTimeline()}
          </div>
          
          {selectedProtocol && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{selectedProtocol.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProtocol.address}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium bg-opacity-20`} style={{ backgroundColor: getRiskColor(selectedProtocol.riskScore), color: getRiskColor(selectedProtocol.riskScore) }}>
                  {selectedProtocol.riskScore}% - {getRiskLabel(selectedProtocol.riskScore)}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">TVL</p>
                  <p className="font-medium">{selectedProtocol.tvl ? formatCurrency(selectedProtocol.tvl) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Anomalies</p>
                  <p className="font-medium">{selectedProtocol.anomalyCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{selectedProtocol.category || 'DeFi'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskVisualization; 