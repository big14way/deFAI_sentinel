import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
  braveWallet,
  argentWallet,
  imTokenWallet,
  rainbowWallet,
  omniWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains';

// Base Sepolia chain definition
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

// Get walletconnect project ID from environment variable
const WALLETCONNECT_PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || process.env.REACT_APP_WC_PROJECT_ID || "3fa446903c59d3d217c44e18d8a5d978";

// Define chains to use across the app
const chains = [mainnet, sepolia, polygon, arbitrum, optimism, baseSepolia];

// Enhanced configuration with more wallet options
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      coinbaseWallet({ appName: "DeFi Sentinel", chains }),
      rainbowWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      trustWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      injectedWallet({ chains }),
    ]
  },
  {
    groupName: "Hardware",
    wallets: [
      ledgerWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
    ]
  },
  {
    groupName: "More Options",
    wallets: [
      braveWallet({ chains }),
      argentWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      imTokenWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      omniWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
      walletConnectWallet({ projectId: WALLETCONNECT_PROJECT_ID, chains }),
    ]
  },
]); 