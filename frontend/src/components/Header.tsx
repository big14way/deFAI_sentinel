import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CustomConnectButton } from './CustomConnectButton';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const [showInstitutionalMenu, setShowInstitutionalMenu] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 
      'text-blue-700 border-b-2 border-blue-600' : 
      'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300';
  };
  
  const handleViewProtocol = (protocolAddress: string) => {
    // Navigate to protocol details
    window.location.href = `/protocols/${protocolAddress}`;
  };
  
  const isInstitutionalActive = () => {
    return location.pathname.includes('/institutional') || 
           location.pathname.includes('/dashboard/liquidity') || 
           location.pathname.includes('/dashboard/security-audits') ? 
      'text-blue-700 border-b-2 border-blue-600' : 
      'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300';
  };
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                DeFi Sentinel
              </Link>
            </div>
            <nav className="ml-6 flex space-x-4 sm:space-x-6">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/protocols"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/protocols')}`}
              >
                Protocols
              </Link>
              <Link
                to="/alerts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/alerts')}`}
              >
                Alerts
              </Link>
              <Link
                to="/anomalies"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/anomalies')}`}
              >
                Anomalies
              </Link>
              <Link
                to="/portfolio-risk"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/portfolio-risk')}`}
              >
                Portfolio Risk
              </Link>
              <Link
                to="/cross-chain"
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/cross-chain')}`}
              >
                Cross-Chain
              </Link>
              <div className="relative">
                <button 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isInstitutionalActive()}`}
                  onClick={() => setShowInstitutionalMenu(!showInstitutionalMenu)}
                >
                  Institutional
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform ${showInstitutionalMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showInstitutionalMenu && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link
                        to="/institutional"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Enterprise Dashboard
                      </Link>
                      <Link
                        to="/dashboard/liquidity"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Liquidity Monitoring
                      </Link>
                      <Link
                        to="/dashboard/security-audits"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Security Audits
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          <div className="flex items-center">
            <CustomConnectButton showBalance={true} chainStatus="icon" />
          </div>
        </div>
      </div>
    </header>
  );
}; 