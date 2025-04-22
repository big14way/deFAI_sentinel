import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { registerProtocol, updateRiskScore } from '../services/web3';
import { ProtocolCategory } from '../types/protocol';
import { ethers } from 'ethers';

const AddProtocol: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    category: ProtocolCategory.DEX,
    initialRiskScore: 50,
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'initialRiskScore' ? Number(value) : value
    }));
  };

  const validateForm = () => {
    // Reset errors
    setError(null);

    // Validate address
    if (!formData.address) {
      setError('Protocol address is required');
      return false;
    }

    // Check if address is valid Ethereum address
    if (!ethers.utils.isAddress(formData.address)) {
      setError('Invalid Ethereum address');
      return false;
    }

    // Validate name
    if (!formData.name) {
      setError('Protocol name is required');
      return false;
    }

    // Validate risk score
    const riskScore = Number(formData.initialRiskScore);
    if (isNaN(riskScore) || riskScore < 0 || riskScore > 100) {
      setError('Risk score must be a number between 0 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call the contract to register the protocol
      // Note: The registerProtocol function only accepts address and name parameters
      await registerProtocol(
        formData.address,
        formData.name
      );
      
      // After registering, update the risk score if needed
      if (formData.initialRiskScore !== 50) {
        try {
          await updateRiskScore(formData.address, formData.initialRiskScore);
        } catch (riskErr: any) {
          console.warn('Protocol registered but failed to set initial risk score:', riskErr);
          // Continue with success even if risk score update fails
        }
      }
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        address: '',
        name: '',
        category: ProtocolCategory.DEX,
        initialRiskScore: 50,
        logoUrl: ''
      });
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Error registering protocol:', err);
      setError(err.message || 'Failed to register protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Protocol</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Register a new DeFi protocol for monitoring and risk assessment
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Protocol successfully registered! Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Address */}
            <div className="col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Protocol Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="0x..."
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Enter the protocol's contract address</p>
            </div>

            {/* Protocol Name */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Protocol Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Uniswap"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Protocol Category */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {Object.values(ProtocolCategory).map((category) => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Initial Risk Score */}
            <div className="col-span-2">
              <label htmlFor="initialRiskScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Initial Risk Score: {formData.initialRiskScore}
              </label>
              <input
                type="range"
                id="initialRiskScore"
                name="initialRiskScore"
                min="0"
                max="100"
                step="5"
                value={formData.initialRiskScore}
                onChange={handleInputChange}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Safe (0)</span>
                <span>Moderate (50)</span>
                <span>High Risk (100)</span>
              </div>
            </div>

            {/* Logo URL */}
            <div className="col-span-2">
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo URL (optional)
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">URL to the protocol's logo (square format recommended)</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Registering Protocol...
                </>
              ) : (
                'Register Protocol'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-md font-medium text-blue-800">Why register your protocol?</h3>
        <ul className="mt-2 ml-4 text-sm text-blue-700 list-disc space-y-1">
          <li>Real-time risk monitoring for your protocol's security</li>
          <li>Anomaly detection using AI and on-chain analytics</li>
          <li>Build trust with users by demonstrating commitment to security</li>
          <li>Receive alerts about potential vulnerabilities or suspicious activities</li>
        </ul>
      </div>
    </div>
  );
};

export default AddProtocol; 