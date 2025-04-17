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
import Diagnostics from './pages/Diagnostics';
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
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-3xl font-bold mb-4">DeFi Sentinel</h1>
                    <p className="mb-4">Welcome to the DeFi Sentinel platform.</p>
                    <p className="mb-6">A security monitoring and risk analysis platform for DeFi protocols.</p>
                    
                    <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-2">Available Services</h2>
                      <ul className="list-disc pl-5">
                        <li>Backend API: {process.env.REACT_APP_API_URL}</li>
                        <li>WebSocket: {process.env.REACT_APP_WS_URL}</li>
                        <li>ML Model: {process.env.REACT_APP_ML_MODEL_ENDPOINT}</li>
                        <li>Smart Contract: {process.env.REACT_APP_DEFI_SENTINEL_ADDRESS}</li>
                        <li>Network: {process.env.REACT_APP_CHAIN_NAME}</li>
                      </ul>
                    </div>
                    
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Get Started</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                          <h3 className="text-lg font-medium text-blue-800 mb-2">Monitor DeFi Protocols</h3>
                          <p className="text-blue-600 mb-4">Track risk scores and identify anomalies in real-time.</p>
                          <Link 
                            to="/dashboard" 
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                          >
                            View Dashboard
                          </Link>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100">
                          <h3 className="text-lg font-medium text-green-800 mb-2">Analyze Protocols</h3>
                          <p className="text-green-600 mb-4">Investigate protocols and their risk metrics.</p>
                          <Link 
                            to="/protocols" 
                            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                          >
                            View Protocols
                          </Link>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-100">
                          <h3 className="text-lg font-medium text-yellow-800 mb-2">Analyze Anomalies</h3>
                          <p className="text-yellow-600 mb-4">Investigate detected anomalies and verify security threats.</p>
                          <Link 
                            to="/anomalies" 
                            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
                          >
                            View Anomalies
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Link 
                          to="/diagnostics" 
                          className="text-gray-600 hover:text-blue-600 text-sm"
                        >
                          System Diagnostics & Troubleshooting
                        </Link>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/protocols" element={<Protocols />} />
                <Route path="/anomalies" element={<Anomalies />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="/alerts" element={<AlertsPage />} />
                {/* Add more routes as needed */}
              </Routes>
            </main>
          </div>
        </Router>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;