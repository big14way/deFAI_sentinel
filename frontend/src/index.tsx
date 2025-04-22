import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './config/wagmiConfig';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { chains } from './config/wagmiConfig';
import { Web3ModalProvider } from './contexts/Web3ModalContext';
import '@rainbow-me/rainbowkit/styles.css';

// Create root and render App
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the main app
root.render(
  <WagmiConfig client={wagmiConfig}>
    <RainbowKitProvider chains={chains} theme={darkTheme({
      accentColor: '#3b82f6', // blue-500
      accentColorForeground: 'white',
      borderRadius: 'medium',
      fontStack: 'system'
    })}>
      <Web3ModalProvider>
        <App />
      </Web3ModalProvider>
    </RainbowKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 