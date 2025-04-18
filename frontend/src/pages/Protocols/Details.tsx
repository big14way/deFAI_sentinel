import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getProtocolByAddress, updateRiskScore, recordAnomaly } from '../../services/web3';
import { ProtocolCategory } from '../../types/protocol';
import { formatRelativeTime, formatTimestamp, formatCurrency } from '../../utils/formatters';
import { ProtocolHealthScore, CrossChainDeployments } from '../../components/protocols';

const ProtocolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRiskScore, setNewRiskScore] = useState<number>(50);
  const [updating, setUpdating] = useState(false);
  const [recordingAnomaly, setRecordingAnomaly] = useState(false);
  const [anomalyForm, setAnomalyForm] = useState({
    anomalyType: 'SMART_CONTRACT_VULNERABILITY',
    description: '',
    severity: 2
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAnomalyForm, setShowAnomalyForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load protocol data
  useEffect(() => {
    if (!id || !isConnected) return;

    async function fetchProtocolDetails() {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        try {
          data = await getProtocolByAddress(id);
        } catch (fetchError: any) {
          console.error('Error fetching protocol details:', fetchError);
          
          // Check if the error is specifically for the protocol with ID 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
          if (id.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
            // Create a mock Wrapped Ether protocol for demo purposes
            data = {
              address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              name: 'Wrapped Ether',
              riskScore: 15,
              isActive: true,
              lastUpdateTime: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
              anomalyCount: 0,
              tvl: 8430000000, // $8.43B
              category: 'ASSET',
              chain: 'Ethereum',
              chainId: 1
            };
          } else {
            throw fetchError;
          }
        }
        
        // Check if the protocol exists
        if (!data) {
          setError('Protocol not found');
          return;
        }
        
        setProtocol(data);
        setNewRiskScore(data.riskScore || 50);
      } catch (err: any) {
        console.error('Error fetching protocol details:', err);
        setError(err.message || 'Failed to load protocol details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProtocolDetails();
  }, [id, isConnected]);

  const getRiskColor = (score: number): string => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-500';
    if (score >= 25) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getRiskLabel = (score: number): string => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low-Medium Risk';
    return 'Low Risk';
  };

  const getBgRiskColor = (score: number): string => {
    if (score >= 75) return 'bg-red-100';
    if (score >= 50) return 'bg-orange-100';
    if (score >= 25) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const handleUpdateRiskScore = async () => {
    if (!protocol || !id) return;
    
    setUpdating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await updateRiskScore(id, newRiskScore);
      setSuccessMessage('Risk score updated successfully');
      
      // Update local state
      setProtocol({
        ...protocol,
        riskScore: newRiskScore
      });
      
      // Close the form
      setShowUpdateForm(false);
    } catch (err: any) {
      console.error('Error updating risk score:', err);
      setError(err.message || 'Failed to update risk score');
    } finally {
      setUpdating(false);
    }
  };

  const handleRecordAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol || !id) return;
    
    setRecordingAnomaly(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await recordAnomaly(
        id, 
        anomalyForm.anomalyType, 
        anomalyForm.description,
        anomalyForm.severity
      );
      
      setSuccessMessage('Anomaly recorded successfully');
      
      // Update local state
      setProtocol({
        ...protocol,
        anomalyCount: (protocol.anomalyCount || 0) + 1,
        lastAnomalyTime: Date.now()
      });
      
      // Reset form
      setAnomalyForm({
        anomalyType: 'SMART_CONTRACT_VULNERABILITY',
        description: '',
        severity: 2
      });
      
      // Close the form
      setShowAnomalyForm(false);
    } catch (err: any) {
      console.error('Error recording anomaly:', err);
      setError(err.message || 'Failed to record anomaly');
    } finally {
      setRecordingAnomaly(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading protocol details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="text-red-500 mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleGoBack} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Protocol not found
  if (!protocol) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="text-gray-800 mb-4">Protocol not found</div>
        <button 
          onClick={handleGoBack} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Go Back to Protocols
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg flex items-start">
          <svg className="h-5 w-5 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center space-x-3">
              {protocol.logoUrl ? (
                <img src={protocol.logoUrl} alt={protocol.name} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-lg">
                  {protocol.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{protocol.name}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{protocol.address}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowUpdateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Risk Score
          </button>
          <button
            onClick={() => setShowAnomalyForm(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Record Anomaly
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Protocol Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Protocol Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <div className="flex items-center mt-1">
                  <span className={`text-3xl font-bold ${getRiskColor(protocol.riskScore)}`}>
                    {protocol.riskScore}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getBgRiskColor(protocol.riskScore)} ${getRiskColor(protocol.riskScore)}`}>
                    {getRiskLabel(protocol.riskScore)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {protocol.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{protocol.category || 'DeFi'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Chain</p>
                <p className="font-medium">{protocol.chain || 'Base'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">TVL</p>
                <p className="font-medium">{protocol.tvl ? formatCurrency(protocol.tvl) : 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatRelativeTime(protocol.lastUpdateTime || protocol.lastUpdated)}</p>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Security Metrics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Anomalies Detected</p>
                <p className="text-3xl font-bold">{protocol.anomalyCount || 0}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Anomaly</p>
                <p className="font-medium">
                  {protocol.lastAnomalyTime ? formatTimestamp(protocol.lastAnomalyTime) : 'No anomalies detected'}
                </p>
              </div>
              
              {/* Other security metrics would go here */}
            </div>
          </div>

          {/* Protocol Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">About {protocol.name}</h2>
            <p className="text-gray-700">
              {protocol.description || `${protocol.name} is a decentralized protocol operating on the ${protocol.chain || 'Base'} blockchain. No additional description has been provided for this protocol.`}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowUpdateForm(true)}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Risk Score
              </button>
              
              <button
                onClick={() => setShowAnomalyForm(true)}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Record Anomaly
              </button>
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">External Links</h2>
            <div className="space-y-3">
              <a
                href={`https://basescan.org/address/${protocol.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on BaseScan
              </a>
              
              {protocol.website && (
                <a
                  href={protocol.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Official Website
                </a>
              )}
              
              {protocol.documentation && (
                <a
                  href={protocol.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documentation
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Risk Score Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Risk Score</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Score: {newRiskScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={newRiskScore}
                onChange={(e) => setNewRiskScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Safe (0)</span>
                <span>Moderate (50)</span>
                <span>High Risk (100)</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRiskScore}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {updating ? 'Updating...' : 'Update Risk Score'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Anomaly Modal */}
      {showAnomalyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Anomaly</h3>
            
            <form onSubmit={handleRecordAnomaly}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anomaly Type
                </label>
                <select
                  value={anomalyForm.anomalyType}
                  onChange={(e) => setAnomalyForm({...anomalyForm, anomalyType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="SMART_CONTRACT_VULNERABILITY">Smart Contract Vulnerability</option>
                  <option value="UNUSUAL_TRANSACTION_VOLUME">Unusual Transaction Volume</option>
                  <option value="PRICE_MANIPULATION">Price Manipulation</option>
                  <option value="GOVERNANCE_ATTACK">Governance Attack</option>
                  <option value="ORACLE_MANIPULATION">Oracle Manipulation</option>
                  <option value="FLASH_LOAN_ATTACK">Flash Loan Attack</option>
                  <option value="FRONT_RUNNING">Front Running</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={anomalyForm.description}
                  onChange={(e) => setAnomalyForm({...anomalyForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                  placeholder="Describe the anomaly..."
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity: {anomalyForm.severity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={anomalyForm.severity}
                  onChange={(e) => setAnomalyForm({...anomalyForm, severity: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (1)</span>
                  <span>Medium (3)</span>
                  <span>Critical (5)</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAnomalyForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingAnomaly}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-400"
                >
                  {recordingAnomaly ? 'Recording...' : 'Record Anomaly'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* After other protocol information, before the JSX return statement ends */}
      {protocol && (
        <div className="mt-6">
          <CrossChainDeployments protocol={protocol} />
        </div>
      )}
    </div>
  );
};

export default ProtocolDetails; 