import React, { useState, useEffect } from 'react';
import { registerProtocol, getProtocolByAddress } from '../../services/web3';

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
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State to keep track of whether the entered address has already been checked
  const [checkedAddress, setCheckedAddress] = useState('');
  const [isAddressRegistered, setIsAddressRegistered] = useState(false);

  // Check if protocol is already registered when address changes
  useEffect(() => {
    const checkAddressRegistration = async () => {
      if (!address || address === checkedAddress) return;
      
      if (!address.startsWith('0x') || address.length !== 42) {
        // Don't check invalid addresses
        return;
      }
      
      setIsChecking(true);
      setError(null);
      
      try {
        const protocol = await getProtocolByAddress(address);
        if (protocol) {
          setIsAddressRegistered(true);
          setError(`Protocol at address ${address} is already registered as "${protocol.name}"`);
        } else {
          setIsAddressRegistered(false);
          setError(null);
        }
        setCheckedAddress(address);
      } catch (err) {
        console.warn('Error checking protocol registration:', err);
        // Don't set error here, just continue
        setIsAddressRegistered(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Use a debounce to avoid too many checks while typing
    const timeoutId = setTimeout(checkAddressRegistration, 500);
    return () => clearTimeout(timeoutId);
  }, [address, checkedAddress]);

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

    if (isAddressRegistered) {
      setError(`This protocol is already registered. Please use a different address.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await registerProtocol(address, name, initialRiskScore);
      setSuccess(`Protocol registered successfully!`);
      
      // Reset form
      setAddress('');
      setName('');
      setInitialRiskScore(50);
      setCheckedAddress('');
      setIsAddressRegistered(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases
        if (errorMessage.includes('Protocol already registered')) {
          errorMessage = 'This protocol is already registered. Please use a different address.';
          setIsAddressRegistered(true);
        } else if (errorMessage.includes('user rejected')) {
          errorMessage = 'Transaction was rejected. Please try again.';
        } else if (errorMessage.includes('cannot estimate gas')) {
          errorMessage = 'Transaction cannot be processed. It may fail or require manual gas settings.';
        }
      }
      
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
            <div className="relative">
              <input
                id="protocol-address"
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value.trim())}
                className={`w-full px-3 py-2 border ${isAddressRegistered ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isChecking ? 'bg-gray-50' : ''}`}
                disabled={isSubmitting || isChecking}
              />
              {isChecking && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            {isAddressRegistered && (
              <p className="mt-1 text-xs text-red-600">
                This protocol is already registered
              </p>
            )}
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
              <div className="flex justify-between items-start">
                <div className="break-words whitespace-pre-wrap overflow-auto max-h-32">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(error);
                    // Optional: Add a visual indicator that the text was copied
                    const btn = document.activeElement as HTMLButtonElement;
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                      btn.textContent = originalText;
                    }, 2000);
                  }}
                  className="ml-2 p-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex-shrink-0"
                  title="Copy error message"
                >
                  Copy
                </button>
              </div>
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
                (isSubmitting || isChecking || isAddressRegistered) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting || isChecking || isAddressRegistered}
            >
              {isSubmitting ? 'Registering...' : isChecking ? 'Checking...' : 'Register Protocol'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterProtocolForm; 