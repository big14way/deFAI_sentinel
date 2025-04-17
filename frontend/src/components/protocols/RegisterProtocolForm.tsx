import React, { useState } from 'react';
import { registerProtocol } from '../../services/web3';

interface RegisterProtocolFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const RegisterProtocolForm: React.FC<RegisterProtocolFormProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [initialRiskScore, setInitialRiskScore] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !name) {
      setError('Address and name are required');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await registerProtocol(address, name, initialRiskScore);
      setSuccess(`Protocol registered successfully! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Reset form
      setAddress('');
      setName('');
      setInitialRiskScore(50);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to register protocol: ${errorMessage}`);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Register New Protocol</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="protocol-address" className="block text-sm font-medium text-gray-700 mb-1">
              Protocol Address
            </label>
            <input
              id="protocol-address"
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="protocol-name" className="block text-sm font-medium text-gray-700 mb-1">
              Protocol Name
            </label>
            <input
              id="protocol-name"
              type="text"
              placeholder="e.g. Uniswap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="risk-score" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Risk Score: {initialRiskScore}
            </label>
            <input
              id="risk-score"
              type="range"
              min="1"
              max="100"
              value={initialRiskScore}
              onChange={(e) => setInitialRiskScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Risk (1)</span>
              <span>High Risk (100)</span>
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
              {isSubmitting ? 'Registering...' : 'Register Protocol'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterProtocolForm; 