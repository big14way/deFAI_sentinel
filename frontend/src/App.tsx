import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, injectedWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { baseSepolia } from './config/chains';
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import Protocols from './pages/Protocols';
import Anomalies from './pages/Anomalies';
import AlertsPage from './pages/Alerts';

const App: React.FC = () => {
  const walletConnectProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '3fa446903c59d3d217c44e18d8a5d978';
  
  // Configure chains
  const { chains, publicClient } = configureChains(
    [mainnet, baseSepolia],
    [publicProvider()]
  );

  // Set up wallet connectors
  const connectors = connectorsForWallets([
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({ projectId: walletConnectProjectId, chains }),
        walletConnectWallet({ projectId: walletConnectProjectId, chains }),
      ],
    },
  ]);

  // Create Wagmi config
  const wagmiConfig = createConfig({
    autoConnect: false,
    connectors,
    publicClient,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={
                  <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 opacity-10 z-0"></div>
                      <div className="relative z-10 px-8 py-12 md:py-20">
                        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">DeFi Sentinel</h1>
                        <p className="text-xl md:text-2xl text-blue-700 font-light mb-6 max-w-3xl">
                          The next generation security monitoring and risk analysis platform for decentralized finance protocols.
                        </p>
                        <p className="text-gray-600 mb-8 max-w-2xl">
                          Leverage advanced machine learning algorithms to detect anomalies, assess risks, and secure your DeFi investments in real-time.
                        </p>
                      </div>
                    </div>
                    
                    <div className="px-8 py-12">
                      <h2 className="text-2xl font-bold text-gray-800 mb-8">Explore Our Platform</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-50">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Protocol Analytics</h3>
                          <p className="text-gray-600 mb-6">Track risk scores and monitor protocol health metrics in real-time with comprehensive dashboards.</p>
                          <Link 
                            to="/dashboard" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            View Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-green-50">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Protocol Security</h3>
                          <p className="text-gray-600 mb-6">Evaluate and compare DeFi protocols based on comprehensive risk profiles and security metrics.</p>
                          <Link 
                            to="/protocols" 
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            View Protocols
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-amber-50">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-time Alerts</h3>
                          <p className="text-gray-600 mb-6">Stay informed with instant notifications about security threats and anomalous activity.</p>
                          <Link 
                            to="/alerts" 
                            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                          >
                            View Alerts
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-16 text-center">
                        <div className="inline-flex items-center px-6 py-4 bg-blue-50 rounded-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-blue-800">Running on Base Sepolia Network with enterprise-grade security monitoring</span>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/protocols" element={<Protocols />} />
                <Route path="/anomalies" element={<Anomalies />} />
                <Route path="/alerts" element={<AlertsPage />} />
                {/* Remove diagnostics route */}
              </Routes>
            </main>
          </div>
        </Router>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;