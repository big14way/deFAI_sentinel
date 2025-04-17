import React, { useState } from 'react';
import { updateProtocolMonitoring, getProtocolByAddress } from '../../services/web3';

interface MonitorProtocolFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const MonitorProtocolForm: React.FC<MonitorProtocolFormProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [protocolInfo, setProtocolInfo] = useState<any | null>(null);

  const handleCheckProtocol = async () => {
    if (!address) {
      setError('Address is required');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsChecking(true);
    setError(null);
    setProtocolInfo(null);

    try {
      const protocol = await getProtocolByAddress(address);
      
      if (!protocol) {
        setError('Protocol not found. You may need to register it first.');
        return;
      }
      
      setProtocolInfo(protocol);
      setIsActive(protocol.isActive);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to find protocol: ${errorMessage}`);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Address is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProtocolMonitoring(address, isActive);
      
      if (result) {
        setSuccess(`Protocol monitoring status updated to: ${isActive ? 'Active' : 'Inactive'}`);
        
        // Update protocol info
        const updatedProtocol = await getProtocolByAddress(address);
        setProtocolInfo(updatedProtocol);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Failed to update monitoring status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to update protocol: ${errorMessage}`);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitor Protocol</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-grow">
            <label htmlFor="monitor-address" className="block text-sm font-medium text-gray-700 mb-1">
              Protocol Address
            </label>
            <input
              id="monitor-address"
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isChecking || isSubmitting}
            />
          </div>
          
          <div className="self-end">
            <button
              type="button"
              onClick={handleCheckProtocol}
              className={`px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                isChecking ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isChecking || isSubmitting}
            >
              {isChecking ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>
        
        {protocolInfo && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">{protocolInfo.name}</h4>
            <div className="text-sm text-gray-700 mt-1">
              <p>Risk Score: {protocolInfo.riskScore}</p>
              <p>Current Status: <span className={protocolInfo.isActive ? 'text-green-600' : 'text-red-600'}>
                {protocolInfo.isActive ? 'Active' : 'Inactive'}
              </span></p>
              <p>Anomalies: {protocolInfo.anomalyCount || 0}</p>
            </div>
          </div>
        )}
        
        {protocolInfo && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monitoring Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="monitoring-status"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="monitoring-status"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Monitoring Status'}
                </button>
              </div>
            </div>
          </form>
        )}
        
        {!protocolInfo && error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorProtocolForm; 