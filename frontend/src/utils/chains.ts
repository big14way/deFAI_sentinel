import { ChainInfo } from '../types/protocol';

// Common Ethereum chains with basic information
export const CHAINS: Record<number, ChainInfo> = {
  // Mainnets
  1: {
    id: 1,
    name: 'Ethereum',
    iconUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    explorerUrl: 'https://etherscan.io',
    color: '#627EEA',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  10: {
    id: 10,
    name: 'Optimism',
    iconUrl: 'https://optimism.io/images/optimism-logo.svg',
    explorerUrl: 'https://optimistic.etherscan.io',
    color: '#FF0420',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  56: {
    id: 56,
    name: 'BNB Chain',
    iconUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    explorerUrl: 'https://bscscan.com',
    color: '#F0B90B',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  137: {
    id: 137,
    name: 'Polygon',
    iconUrl: 'https://polygon.technology/favicon.png',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247E5',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    iconUrl: 'https://arbitrum.io/wp-content/uploads/2023/03/cropped-Arbitrum_Icon_FullColor.png',
    explorerUrl: 'https://arbiscan.io',
    color: '#28A0F0',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  43114: {
    id: 43114,
    name: 'Avalanche',
    iconUrl: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    explorerUrl: 'https://snowtrace.io',
    color: '#E84142',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  8453: {
    id: 8453,
    name: 'Base',
    iconUrl: 'https://pbs.twimg.com/profile_images/1675247132178059264/t5l_GQzD_400x400.jpg',
    explorerUrl: 'https://basescan.org',
    color: '#0052FF',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  
  // Testnets
  5: {
    id: 5,
    name: 'Goerli',
    iconUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    explorerUrl: 'https://goerli.etherscan.io',
    color: '#627EEA',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  84531: {
    id: 84531,
    name: 'Base Goerli',
    iconUrl: 'https://pbs.twimg.com/profile_images/1675247132178059264/t5l_GQzD_400x400.jpg',
    explorerUrl: 'https://goerli.basescan.org',
    color: '#0052FF',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Helper function to get a chain by ID
export const getChainById = (chainId: number): ChainInfo => {
  return CHAINS[chainId] || {
    id: chainId,
    name: `Chain ${chainId}`,
    color: '#6B7280',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  };
};

// Get chain name with fallback
export const getChainName = (chainId: number | undefined): string => {
  if (!chainId) return 'Unknown Chain';
  return CHAINS[chainId]?.name || `Chain ${chainId}`;
};

// Get chain icon URL with fallback
export const getChainIconUrl = (chainId: number | undefined): string => {
  if (!chainId) return '';
  return CHAINS[chainId]?.iconUrl || '';
};

// Helper to format address for a specific chain explorer
export const getExplorerUrl = (chainId: number, address: string): string => {
  const chain = CHAINS[chainId];
  if (!chain || !chain.explorerUrl) return `https://etherscan.io/address/${address}`;
  return `${chain.explorerUrl}/address/${address}`;
};

// Get chain color with fallback
export const getChainColor = (chainId: number | undefined): string => {
  if (!chainId) return '#6B7280';
  return CHAINS[chainId]?.color || '#6B7280';
}; 