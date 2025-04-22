import { wagmiConnectors } from "./wagmiConnectors";
import { configureChains, createClient } from "wagmi";
import { mainnet, polygon, arbitrum, optimism, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// Add Base Sepolia chain definition
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

// Define chains to match the ones in wagmiConnectors
const chains = [
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  baseSepolia  // Add Base Sepolia to the list
];

// Get client and chains config
const { provider, webSocketProvider } = configureChains(
  chains,
  [publicProvider()]
);

// Use createClient instead of createConfig for wagmi v0.12.x
export const wagmiConfig = createClient({
  autoConnect: true,
  connectors: wagmiConnectors,
  provider,
  webSocketProvider,
});

// Export chains for use in RainbowKit
export { chains }; 