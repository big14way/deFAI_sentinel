import React from 'react';
import InsurancePanel from '../insurance/InsurancePanel';
import { Protocol } from '../../types';
import { useUserExposure } from '../../hooks/useUserExposure';

interface ProtocolInsuranceProps {
  protocol: Protocol;
}

const ProtocolInsurance: React.FC<ProtocolInsuranceProps> = ({ protocol }) => {
  const { exposure, loading } = useUserExposure(protocol.address);
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Insurance Coverage</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InsurancePanel protocol={protocol} userExposure={exposure} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Why Get Insurance?</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Protection against protocol exploits</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Coverage for smart contract vulnerabilities</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Fast, automated claims processing</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Risk-adjusted premiums based on real-time analytics</span>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Premium Calculation</h4>
            <p className="text-sm">
              Premiums are calculated based on the protocol's current risk score,
              coverage amount, and policy duration. Higher risk protocols have
              higher premiums to reflect increased likelihood of exploits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolInsurance; 