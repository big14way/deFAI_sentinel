import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Dashboard from './pages/Dashboard';
import Protocols from './pages/Protocols';
import Anomalies from './pages/Anomalies';
import Diagnostics from './pages/Diagnostics';
import { Header } from './components/Header';
import CrossChainMonitoring from './components/CrossChainMonitoring';
import PortfolioRiskAssessment from './components/portfolio/PortfolioRiskAssessment';
import AlertsPage from './pages/Alerts';
import InstitutionalDashboard from './pages/Dashboard/InstitutionalDashboard';
import LiquidityMonitoring from './pages/Dashboard/LiquidityMonitoring';
import SecurityAuditReports from './pages/Dashboard/SecurityAuditReports';
import AddProtocol from './pages/AddProtocol';
import ManageProtocols from './pages/Protocols/Manage';

// Simple component to use when there's a rendering error
const ErrorFallback = () => (
  <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
    <h1>DeFi Sentinel</h1>
    <p>There was an error loading the application.</p>
    <p>Please check the console for details.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        marginTop: '20px',
        padding: '8px 16px',
        background: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Refresh Page
    </button>
  </div>
);

// Welcome page for users who haven't connected their wallet
const WelcomePage = () => {
  const { openConnectModal } = useConnectModal();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to DeFi Sentinel</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your comprehensive security and monitoring solution for DeFi protocols
          </p>
          <button
            onClick={openConnectModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors shadow-md"
          >
            Connect Wallet to Begin
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Protocol Security</h2>
            <p className="text-gray-600">
              Real-time monitoring of protocol security metrics with advanced AI-powered risk assessment.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Liquidity Analysis</h2>
            <p className="text-gray-600">
              Track TVL fluctuations and detect potential liquidity crises before they impact your assets.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Cross-Chain Monitoring</h2>
            <p className="text-gray-600">
              Holistic view of cross-chain protocols and bridge security with integrated risk assessment.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-16">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold">How It Works</h2>
          </div>
          <div className="p-6">
            <ol className="list-decimal pl-6 space-y-4">
              <li className="text-gray-700">
                <span className="font-medium">Connect your wallet</span> - Securely connect to access the full suite of monitoring tools
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Select protocols to monitor</span> - Add DeFi protocols you're interested in tracking
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Configure alerts</span> - Set up custom notifications for risk events and anomalies
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Analyze risks</span> - Review detailed security assessments and liquidity reports
              </li>
            </ol>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ready to secure your DeFi investments?</p>
          <button
            onClick={openConnectModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            Connect Wallet
          </button>
        </div>
      </main>
    </div>
  );
};

// Main layout component with header and content
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  console.log('Current route:', location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

// Wallet connection gate component - reverting to previous version
const RequireWallet = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  if (!isConnected) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connection Required</h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access DeFi Sentinel's monitoring and analytics tools.
            </p>
            <p className="text-gray-600 mb-6">
              DeFi Sentinel requires wallet connection to verify access permissions and provide personalized monitoring for your portfolio.
            </p>
            <button
              onClick={openConnectModal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [appReady, setAppReady] = React.useState(false);
  const { isConnected } = useAccount();

  React.useEffect(() => {
    // Log that the app has mounted
    console.log('Main App mounted');
    
    // Initialize app setup with a slight delay to ensure DOM is ready
    setTimeout(() => {
      setAppReady(true);
    }, 500);
    
    // Instead of adding an error handler, we'll let errors happen but log them
    console.log('DeFi Sentinel: Error handling disabled - errors will be logged but app will continue');
  }, []);

  // Show the fallback UI if there's an error
  if (!appReady) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-lg">Loading DeFi Sentinel...</p>
    </div>;
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        {/* Redirect based on connection status */}
        <Route path="/" element={
          isConnected ? 
            <Navigate to="/dashboard" replace /> : 
            <WelcomePage />
        } />
        
        {/* Protected routes - require wallet connection */}
        <Route path="/dashboard" element={
          <RequireWallet>
            <MainLayout><Dashboard /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/protocols" element={
          <RequireWallet>
            <MainLayout><Protocols /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/protocols/add" element={
          <RequireWallet>
            <MainLayout><AddProtocol /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/protocols/manage" element={
          <RequireWallet>
            <MainLayout><ManageProtocols /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/anomalies" element={
          <RequireWallet>
            <MainLayout><Anomalies /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/cross-chain" element={
          <RequireWallet>
            <MainLayout><CrossChainMonitoring /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/diagnostics" element={
          <RequireWallet>
            <MainLayout><Diagnostics /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/portfolio-risk" element={
          <RequireWallet>
            <MainLayout><PortfolioRiskAssessment /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/alerts" element={
          <RequireWallet>
            <MainLayout><AlertsPage /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/institutional" element={
          <RequireWallet>
            <MainLayout><InstitutionalDashboard /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/dashboard/liquidity" element={
          <RequireWallet>
            <MainLayout><LiquidityMonitoring /></MainLayout>
          </RequireWallet>
        } />
        <Route path="/dashboard/security-audits" element={
          <RequireWallet>
            <MainLayout><SecurityAuditReports /></MainLayout>
          </RequireWallet>
        } />
      </Routes>
    </Router>
  );
};

export default App;