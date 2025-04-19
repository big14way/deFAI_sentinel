import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import RiskNotifications from './notifications/RiskNotifications'; 
import { useAccount } from 'wagmi';

export const Header: React.FC = () => {
  const location = useLocation();
  const { address } = useAccount();
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
    return location.pathname.includes('/dashboard/institutional') || 
           location.pathname.includes('/dashboard/liquidity') || 
           location.pathname.includes('/dashboard/security-audits') ? 
      'text-blue-700 border-b-2 border-blue-600' : 
      'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">DeFi Sentinel</h1>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/protocols" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/protocols')}`}
              >
                Protocols
              </Link>
              <Link 
                to="/anomalies" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/anomalies')}`}
              >
                Anomalies
              </Link>
              <Link 
                to="/alerts" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/alerts')}`}
              >
                Alerts
              </Link>
              <Link 
                to="/cross-chain" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/cross-chain')}`}
              >
                Cross-Chain
              </Link>
              <Link 
                to="/portfolio" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/portfolio')}`}
              >
                Portfolio Risk
              </Link>
              
              {/* Institutional dropdown */}
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
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        to="/dashboard/institutional" 
                        className={`block px-4 py-2 text-sm ${isActive('/dashboard/institutional') ? 'bg-gray-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setShowInstitutionalMenu(false)}
                      >
                        Enterprise Dashboard
                      </Link>
                      <Link 
                        to="/dashboard/liquidity" 
                        className={`block px-4 py-2 text-sm ${isActive('/dashboard/liquidity') ? 'bg-gray-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setShowInstitutionalMenu(false)}
                      >
                        Liquidity Monitoring
                      </Link>
                      <Link 
                        to="/dashboard/security-audits" 
                        className={`block px-4 py-2 text-sm ${isActive('/dashboard/security-audits') ? 'bg-gray-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setShowInstitutionalMenu(false)}
                      >
                        Security Audit Reports
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            {address && (
              <div className="mr-1 scale-90">
                <RiskNotifications 
                  userAddress={address}
                  onViewProtocol={handleViewProtocol} 
                />
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}; 