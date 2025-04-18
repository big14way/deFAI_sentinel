import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 
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
            </nav>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}; 