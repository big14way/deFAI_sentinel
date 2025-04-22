import { Protocol, ProtocolCategory, ProtocolStatus } from '../types/protocol';
import axios from 'axios';
import { Anomaly, RiskAssessment } from '../types';

// Default logo URL for protocols without a specific logo
export const defaultLogoUrl = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg';

// Mock protocols data for development
export const mockProtocols: Protocol[] = [
  {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    name: 'Aave',
    riskScore: 25,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    anomalyCount: 0,
    tvl: 7850000000, // $7.85B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/aave.svg',
    category: ProtocolCategory.LENDING,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {},
    description: 'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
    // Reputation data
    trustScore: 85,
    reputationDetails: {
      transparencyScore: 90,
      auditHistory: [
        {
          id: 'audit-1-aave',
          auditor: 'OpenZeppelin',
          date: Date.now() - 1000 * 60 * 60 * 24 * 60, // 60 days ago
          reportUrl: 'https://blog.openzeppelin.com/aave-protocol-audit/',
          severity: 'low',
          score: 95,
          verified: true
        },
        {
          id: 'audit-2-aave',
          auditor: 'PeckShield',
          date: Date.now() - 1000 * 60 * 60 * 24 * 120, // 120 days ago
          reportUrl: 'https://github.com/peckshield/publications/blob/master/audit_reports/peckshield-audit-report-aave-v2-20201102.pdf',
          severity: 'medium',
          score: 88,
          verified: true
        }
      ],
      incidentResponseScore: 80,
      developerScore: 92,
      communityScore: 85,
      communityFeedback: [
        {
          id: 'feedback-1-aave',
          source: 'twitter',
          sentiment: 'positive',
          category: 'development',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
          weight: 0.8
        },
        {
          id: 'feedback-2-aave',
          source: 'discord',
          sentiment: 'positive',
          category: 'transparency',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
          weight: 0.7
        },
        {
          id: 'feedback-3-aave',
          source: 'forum',
          sentiment: 'neutral',
          category: 'incident',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 21, // 21 days ago
          weight: 0.6
        }
      ],
      lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
      verificationStatus: 'verified'
    }
  },
  {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    name: 'Uniswap',
    riskScore: 30,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    anomalyCount: 1,
    lastAnomalyTime: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    tvl: 6250000000, // $6.25B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/uni.svg',
    category: ProtocolCategory.DEX,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {},
    description: 'Uniswap is a decentralized trading protocol on Ethereum known for its role in facilitating automated trading of decentralized finance tokens.',
    // Reputation data
    trustScore: 80,
    reputationDetails: {
      transparencyScore: 85,
      auditHistory: [
        {
          id: 'audit-1-uni',
          auditor: 'Trail of Bits',
          date: Date.now() - 1000 * 60 * 60 * 24 * 45, // 45 days ago
          reportUrl: 'https://github.com/Uniswap/v3-core/blob/main/audits/20210315_Trail_of_Bits.pdf',
          severity: 'medium',
          score: 85,
          verified: true
        }
      ],
      incidentResponseScore: 75,
      developerScore: 90,
      communityScore: 80,
      communityFeedback: [
        {
          id: 'feedback-1-uni',
          source: 'twitter',
          sentiment: 'positive',
          category: 'development',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
          weight: 0.9
        },
        {
          id: 'feedback-2-uni',
          source: 'github',
          sentiment: 'positive',
          category: 'development',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
          weight: 0.7
        }
      ],
      lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      verificationStatus: 'verified'
    }
  },
  {
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    name: 'Compound',
    riskScore: 35,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    anomalyCount: 2,
    tvl: 4830000000, // $4.83B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/comp.svg',
    category: ProtocolCategory.LENDING,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {},
    description: 'Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications.',
    // Reputation data
    trustScore: 75,
    reputationDetails: {
      transparencyScore: 80,
      auditHistory: [
        {
          id: 'audit-1-comp',
          auditor: 'OpenZeppelin',
          date: Date.now() - 1000 * 60 * 60 * 24 * 90, // 90 days ago
          reportUrl: 'https://blog.openzeppelin.com/compound-audit/',
          severity: 'medium',
          score: 80,
          verified: true
        }
      ],
      incidentResponseScore: 60,
      developerScore: 85,
      communityScore: 75,
      communityFeedback: [
        {
          id: 'feedback-1-comp',
          source: 'forum',
          sentiment: 'neutral',
          category: 'general',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
          weight: 0.7
        }
      ],
      lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
      verificationStatus: 'partial'
    }
  },
  {
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    name: 'MakerDAO',
    riskScore: 38,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 60, // 1 hour ago
    anomalyCount: 1,
    tvl: 5920000000, // $5.92B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/mkr.svg',
    category: ProtocolCategory.LENDING,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {}
  },
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    name: 'DAI',
    riskScore: 20,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
    anomalyCount: 0,
    tvl: 6480000000, // $6.48B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/dai.svg',
    category: ProtocolCategory.ASSET,
    status: ProtocolStatus.ACTIVE,
    deployments: {},
    chain: 'Base',
    chainId: 8453
  },
  {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    name: 'Wrapped Bitcoin',
    riskScore: 15,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 120, // 2 hours ago
    anomalyCount: 0,
    tvl: 5750000000, // $5.75B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/wbtc.svg',
    category: ProtocolCategory.ASSET,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {}
  },
  {
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    name: 'Chainlink',
    riskScore: 40,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 150, // 2.5 hours ago
    anomalyCount: 1,
    tvl: 2870000000, // $2.87B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/link.svg',
    category: ProtocolCategory.DERIVATIVES,
    status: ProtocolStatus.WARNING,
    chain: 'Base',
    chainId: 8453,
    deployments: {},
    // Reputation data - example of a protocol with some issues
    trustScore: 60,
    reputationDetails: {
      transparencyScore: 65,
      auditHistory: [
        {
          id: 'audit-1-link',
          auditor: 'Certik',
          date: Date.now() - 1000 * 60 * 60 * 24 * 75, // 75 days ago
          reportUrl: 'https://example.com/chainlink-audit',
          severity: 'high',
          score: 60,
          verified: true
        }
      ],
      incidentResponseScore: 55,
      developerScore: 75,
      communityScore: 70,
      communityFeedback: [
        {
          id: 'feedback-1-link',
          source: 'twitter',
          sentiment: 'neutral',
          category: 'incident',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
          weight: 0.6
        },
        {
          id: 'feedback-2-link',
          source: 'forum',
          sentiment: 'negative',
          category: 'transparency',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
          weight: 0.7
        }
      ],
      lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
      verificationStatus: 'partial'
    }
  },
  {
    address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
    name: 'Yearn Finance',
    riskScore: 55,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 75, // 1.25 hours ago
    anomalyCount: 2,
    tvl: 1320000000, // $1.32B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/yfi.svg',
    category: ProtocolCategory.YIELD,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {}
  },
  {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    name: 'Polygon',
    riskScore: 45,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 240, // 4 hours ago
    anomalyCount: 1,
    tvl: 3760000000, // $3.76B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/matic.svg',
    category: ProtocolCategory.BRIDGE,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {}
  },
  {
    address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    name: 'Binance USD',
    riskScore: 25,
    isActive: true,
    lastUpdateTime: Date.now() - 1000 * 60 * 360, // 6 hours ago
    anomalyCount: 0,
    tvl: 5120000000, // $5.12B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/busd.svg',
    category: ProtocolCategory.ASSET,
    status: ProtocolStatus.ACTIVE,
    chain: 'Base',
    chainId: 8453,
    deployments: {}
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USDC',
    riskScore: 80,
    isActive: false,
    lastUpdateTime: Date.now() - 1000 * 60 * 400, // 6.67 hours ago
    anomalyCount: 8,
    lastAnomalyTime: Date.now() - 1000 * 60 * 60,
    tvl: 4280000000, // $4.28B
    logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/usdc.svg',
    category: ProtocolCategory.ASSET,
    status: ProtocolStatus.CRITICAL,
    chain: 'Base',
    chainId: 8453,
    deployments: {},
    // Reputation data - example of a protocol with significant issues
    trustScore: 35,
    reputationDetails: {
      transparencyScore: 30,
      auditHistory: [
        {
          id: 'audit-1-usdc',
          auditor: 'Unknown Auditor',
          date: Date.now() - 1000 * 60 * 60 * 24 * 180, // 180 days ago
          reportUrl: '',
          severity: 'critical',
          score: 35,
          verified: false
        }
      ],
      incidentResponseScore: 25,
      developerScore: 50,
      communityScore: 30,
      communityFeedback: [
        {
          id: 'feedback-1-usdc',
          source: 'twitter',
          sentiment: 'negative',
          category: 'incident',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
          weight: 0.9
        },
        {
          id: 'feedback-2-usdc',
          source: 'discord',
          sentiment: 'negative',
          category: 'transparency',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
          weight: 0.8
        },
        {
          id: 'feedback-3-usdc',
          source: 'forum',
          sentiment: 'negative',
          category: 'development',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
          weight: 0.7
        }
      ],
      lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      verificationStatus: 'unverified'
    }
  }
];

// Mock anomalies for development/demo purposes
export const mockAnomalies = [
  {
    id: '1',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    protocol: {
      id: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      name: 'Aave',
      riskScore: 35,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 60 * 24,
      anomalyCount: 3,
      status: 'active',
      chain: 'Ethereum',
      category: 'lending',
      deployments: {}
    },
    type: 'price_deviation',
    severity: 'medium',
    description: 'Unusual price movement detected',
    score: 65,
    features: [
      {
        name: 'priceChange',
        value: 12.5,
        description: 'Percentage change in price'
      }
    ],
    detectionMethod: 'ml_model',
    falsePositive: false
  },
  {
    id: '2',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    protocol: {
      id: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      name: 'Uniswap',
      riskScore: 28,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 60 * 12,
      anomalyCount: 1,
      status: 'active',
      chain: 'Ethereum',
      category: 'dex',
      deployments: {}
    },
    type: 'volume_spike',
    severity: 'high',
    description: 'Sudden increase in transaction volume',
    score: 78,
    features: [
      {
        name: 'volumeChange',
        value: 345.2,
        description: 'Percentage increase in volume'
      }
    ],
    detectionMethod: 'threshold',
    falsePositive: false
  },
  {
    id: '3',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    protocol: {
      id: '0x514910771af9ca656af840dff83e8264ecf986ca',
      address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      name: 'Chainlink',
      riskScore: 72,
      isActive: true,
      lastUpdateTime: Date.now() - 1000 * 60 * 60 * 6,
      anomalyCount: 5,
      status: 'warning',
      chain: 'Ethereum',
      category: 'oracle',
      deployments: {}
    },
    type: 'smart_contract_interaction',
    severity: 'critical',
    description: 'Unexpected contract interaction pattern',
    score: 92,
    features: [
      {
        name: 'interactionPattern',
        value: 'atypical',
        description: 'Type of interaction pattern'
      }
    ],
    detectionMethod: 'rule_based',
    falsePositive: false
  }
];

// Mock cross-chain links for development/demo purposes
export const mockCrossChainLinks = [
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 8453, // Base
    sourceProtocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Aave on Ethereum
    targetProtocolAddress: '0x7dd703de0f5b39c5c5d05f503f587f4648414924', // Aave on Base (mock)
    bridgeAddress: '0x4200000000000000000000000000000000000010', // Base bridge
    linkType: 'bridge',
    riskScore: 35,
    lastActivity: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    volumeLast24h: 12500000 // $12.5M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 42161, // Arbitrum
    sourceProtocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Uniswap on Ethereum
    targetProtocolAddress: '0xfA7F8980b0f1E64A2062791cc3b0871572f1F7f0', // Uniswap on Arbitrum
    bridgeAddress: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', // Arbitrum bridge
    linkType: 'bridge',
    riskScore: 28,
    lastActivity: Date.now() - 1000 * 60 * 120, // 2 hours ago
    volumeLast24h: 18700000 // $18.7M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 137, // Polygon
    sourceProtocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888', // Compound on Ethereum
    targetProtocolAddress: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4', // Compound on Polygon
    bridgeAddress: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77', // Polygon bridge
    linkType: 'bridge',
    riskScore: 42,
    lastActivity: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    volumeLast24h: 9800000 // $9.8M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 10, // Optimism
    sourceProtocolAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MakerDAO on Ethereum
    targetProtocolAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // MakerDAO on Optimism
    bridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1', // Optimism bridge
    linkType: 'bridge',
    riskScore: 25,
    lastActivity: Date.now() - 1000 * 60 * 80, // 80 minutes ago
    volumeLast24h: 15300000 // $15.3M
  },
  {
    sourceChainId: 1, // Ethereum
    targetChainId: 43114, // Avalanche
    sourceProtocolAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI on Ethereum
    targetProtocolAddress: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI on Avalanche
    bridgeAddress: '0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0', // Avalanche bridge
    linkType: 'bridge',
    riskScore: 32,
    lastActivity: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    volumeLast24h: 7400000 // $7.4M
  }
];

// Mock user exposures for development purposes
export const mockUserExposures = {
  // User 1 exposures
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e': [
    {
      protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Aave
      amount: 15000,
      assets: [
        {
          tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          tokenSymbol: 'WETH',
          tokenName: 'Wrapped Ether',
          amount: '5.25',
          value: 9250
        },
        {
          tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          tokenSymbol: 'WBTC',
          tokenName: 'Wrapped Bitcoin',
          amount: '0.32',
          value: 5750
        }
      ]
    },
    {
      protocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Uniswap
      amount: 22500,
      assets: [
        {
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          tokenSymbol: 'USDC',
          tokenName: 'USD Coin',
          amount: '12500',
          value: 12500
        },
        {
          tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          tokenSymbol: 'WETH',
          tokenName: 'Wrapped Ether',
          amount: '5.7',
          value: 10000
        }
      ]
    },
    {
      protocolAddress: '0x514910771af9ca656af840dff83e8264ecf986ca', // Chainlink (High Risk)
      amount: 8000,
      assets: [
        {
          tokenAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
          tokenSymbol: 'LINK',
          tokenName: 'Chainlink',
          amount: '950',
          value: 8000
        }
      ]
    }
  ],
  // User 2 exposures
  '0x123456789abcdef0123456789abcdef012345678': [
    {
      protocolAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
      amount: 50000,
      assets: [
        {
          tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
          tokenSymbol: 'DAI',
          tokenName: 'Dai Stablecoin',
          amount: '50000',
          value: 50000
        }
      ]
    }
  ]
};

/**
 * Get mock protocol data for testing without a backend
 */
export const getMockProtocols = (): Protocol[] => {
  // Create custom protocols with chain breakdown  
  return [
    {
      id: "aave-v3",
      address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      name: "Aave V3",
      description: "Open source and non-custodial liquidity protocol",
      network: "ethereum",
      category: "lending",
      tvl: 6250000000, // $6.25B
      status: "active",
      url: "https://aave.com",
      logoUrl: "https://cryptologos.cc/logos/aave-aave-logo.png",
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365, // ~1 year ago
      audited: true,
      riskScore: 25,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 2,
      deployments: {},
      riskComponents: {
        tvlRisk: 1,
        volatilityRisk: 2,
        ageRisk: 1,
        auditRisk: 1,
        totalScore: 25,
        timestamp: Date.now()
      }
    },
    {
      id: 'compound-v3',
      address: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      name: 'Compound V3',
      description: 'Algorithmic, autonomous interest rate protocol',
      network: 'ethereum',
      category: 'lending',
      tvl: 4380000000,
      status: 'active',
      url: 'https://compound.finance',
      logoUrl: 'https://cryptologos.cc/logos/compound-comp-logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 400, // ~400 days ago
      audited: true,
      riskScore: 30,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 1,
      deployments: {},
      riskComponents: {
        tvlRisk: 1,
        volatilityRisk: 3,
        ageRisk: 2,
        auditRisk: 2,
        totalScore: 35,
        timestamp: Date.now()
      }
    },
    {
      id: 'uniswap-v3',
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      name: 'Uniswap V3',
      description: 'Automated market maker for decentralized token swaps',
      network: 'ethereum',
      category: 'dex',
      tvl: 7240000000,
      status: 'active',
      url: 'https://uniswap.org',
      logoUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 300, // ~300 days ago
      audited: true,
      riskScore: 35,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 3,
      deployments: {},
      riskComponents: {
        tvlRisk: 1,
        volatilityRisk: 3,
        ageRisk: 1,
        auditRisk: 2,
        totalScore: 35,
        timestamp: Date.now()
      }
    },
    {
      id: 'pancakeswap',
      address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
      name: 'PancakeSwap',
      description: 'DEX and yield farming platform on BNB Chain',
      network: 'bnb',
      category: 'dex',
      tvl: 2430000000,
      status: 'active',
      url: 'https://pancakeswap.finance',
      logoUrl: 'https://cryptologos.cc/logos/pancakeswap-cake-logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 450, // ~450 days ago
      audited: true,
      riskScore: 45,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 2,
      deployments: {},
      riskComponents: {
        tvlRisk: 2,
        volatilityRisk: 5,
        ageRisk: 2,
        auditRisk: 2,
        totalScore: 45,
        timestamp: Date.now()
      }
    },
    {
      id: 'olympus-dao',
      address: '0x383518188c0c6d7730d91b2c03a03c837814a899',
      name: 'Olympus DAO',
      description: 'Decentralized reserve currency protocol',
      network: 'ethereum',
      category: 'other',
      tvl: 180000000,
      status: 'active',
      url: 'https://www.olympusdao.finance',
      logoUrl: 'https://cryptologos.cc/logos/olympus-ohm-logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 180, // ~180 days ago
      audited: true,
      riskScore: 70,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 4,
      deployments: {},
      riskComponents: {
        tvlRisk: 5,
        volatilityRisk: 8,
        ageRisk: 3,
        auditRisk: 2,
        totalScore: 70,
        timestamp: Date.now()
      }
    },
    {
      id: 'maple-finance',
      address: '0x33349b282065b805ec10a0d89c9cc996f9f39d85',
      name: 'Maple Finance',
      description: 'Institutional capital markets powered by blockchain',
      network: 'ethereum',
      category: 'lending',
      tvl: 320000000,
      status: 'active',
      url: 'https://maple.finance',
      logoUrl: 'https://cryptologos.cc/logos/maple-mpl-logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 250, // ~250 days ago
      audited: true,
      riskScore: 50,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 1,
      deployments: {},
      riskComponents: {
        tvlRisk: 4,
        volatilityRisk: 4,
        ageRisk: 3,
        auditRisk: 2,
        totalScore: 50,
        timestamp: Date.now()
      }
    },
    {
      id: 'new-protocol',
      address: '0xabcde12345abcde12345abcde12345abcde12345',
      name: 'New DeFi Protocol',
      description: 'A new innovative DeFi protocol with untested features',
      network: 'arbitrum',
      category: 'yield',
      tvl: 28000000,
      status: 'warning',
      url: 'https://newdefiproject.xyz',
      logoUrl: 'https://example.com/logo.png',
      createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 14, // 14 days ago
      audited: false,
      riskScore: 85,
      isActive: true,
      lastUpdateTime: Date.now(),
      anomalyCount: 5,
      deployments: {},
      riskComponents: {
        tvlRisk: 7,
        volatilityRisk: 9,
        ageRisk: 9,
        auditRisk: 10,
        totalScore: 85,
        timestamp: Date.now()
      }
    }
  ];
};

/**
 * Get mock risk assessment for a protocol
 */
export const getMockRiskAssessment = (protocol: Protocol): RiskAssessment => {
  if (!protocol) {
    return {
      tvlRisk: 5,
      volatilityRisk: 5,
      ageRisk: 5,
      auditRisk: 5,
      totalScore: 50,
      timestamp: Date.now()
    };
  }

  // If protocol already has risk components defined, return those
  if (protocol.riskComponents) {
    return protocol.riskComponents;
  }

  // Calculate TVL risk (1-10)
  let tvlRisk = 5;
  const tvl = protocol.tvl || 0;
  if (tvl > 1000000000) tvlRisk = 1; // >$1B
  else if (tvl > 500000000) tvlRisk = 2; // >$500M
  else if (tvl > 100000000) tvlRisk = 3; // >$100M
  else if (tvl > 50000000) tvlRisk = 4; // >$50M
  else if (tvl > 10000000) tvlRisk = 5; // >$10M
  else if (tvl > 5000000) tvlRisk = 6; // >$5M
  else if (tvl > 1000000) tvlRisk = 7; // >$1M
  else if (tvl > 500000) tvlRisk = 8; // >$500K
  else if (tvl > 100000) tvlRisk = 9; // >$100K
  else tvlRisk = 10; // <$100K

  // Calculate age risk (1-10)
  let ageRisk = 5;
  const createdAt = protocol.createdAt || Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 365; // default 1 year
  const ageInDays = (Date.now() / 1000 - createdAt) / 86400;
  
  if (ageInDays > 1095) ageRisk = 1; // >3 years
  else if (ageInDays > 730) ageRisk = 2; // >2 years
  else if (ageInDays > 365) ageRisk = 3; // >1 year
  else if (ageInDays > 180) ageRisk = 4; // >6 months
  else if (ageInDays > 90) ageRisk = 5; // >3 months
  else if (ageInDays > 60) ageRisk = 6; // >2 months
  else if (ageInDays > 30) ageRisk = 7; // >1 month
  else if (ageInDays > 14) ageRisk = 8; // >2 weeks
  else if (ageInDays > 7) ageRisk = 9; // >1 week
  else ageRisk = 10; // <1 week

  // Calculate volatility risk (1-10)
  let volatilityRisk = 5;
  if (protocol.volatility) {
    volatilityRisk = Math.min(10, Math.max(1, Math.round(protocol.volatility * 10)));
  } else if (protocol.priceData?.volatility) {
    volatilityRisk = Math.min(10, Math.max(1, Math.round(protocol.priceData.volatility * 10)));
  }
  
  // Calculate audit risk (1-10)
  let auditRisk = protocol.audited === true ? 2 : 8;
  
  // Calculate total score (1-100)
  const totalScore = Math.round((tvlRisk + volatilityRisk + ageRisk + auditRisk) * 100 / 40);
  
  return {
    tvlRisk,
    volatilityRisk,
    ageRisk,
    auditRisk,
    totalScore,
    timestamp: Date.now()
  };
};

/**
 * Get mock anomalies for testing
 */
export const getMockAnomalies = (): Anomaly[] => {
  const protocols = getMockProtocols();
  const now = Math.floor(Date.now() / 1000);
  
  return [
    {
      id: 'anomaly-1',
      protocolId: 'olympus-dao',
      protocol: protocols.find(p => p.id === 'olympus-dao'),
      timestamp: now - 3600, // 1 hour ago
      type: 'price',
      severity: 'high',
      description: 'Unusual price movement: 35% drop in 2 hours',
      status: 'active',
      metrics: {
        priceDrop: 35,
        timeframeMins: 120,
        volumeIncrease: 520,
        previousAverage: 42
      }
    },
    {
      id: 'anomaly-2',
      protocolId: 'aave-v3',
      protocol: protocols.find(p => p.id === 'aave-v3'),
      timestamp: now - 10800, // 3 hours ago
      type: 'tvl',
      severity: 'medium',
      description: 'Unusual TVL outflow: $25M withdrawn in 4 hours',
      status: 'active',
      metrics: {
        tvlChange: -25000000,
        timeframeMins: 240,
        percentChange: 8.5
      }
    },
    {
      id: 'anomaly-3',
      protocolId: 'new-protocol',
      protocol: protocols.find(p => p.id === 'new-protocol'),
      timestamp: now - 7200, // 2 hours ago
      type: 'governance',
      severity: 'high',
      description: 'Suspicious governance proposal passed with 98% votes from new addresses',
      status: 'active',
      metrics: {
        proposalId: 'XP-23',
        votePercentage: 98,
        newAddressPercentage: 87,
        timeToExecution: 3600
      }
    },
    {
      id: 'anomaly-4',
      protocolId: 'compound-v3',
      protocol: protocols.find(p => p.id === 'compound-v3'),
      timestamp: now - 86400, // 1 day ago
      type: 'utilization',
      severity: 'low',
      description: 'Increased utilization rate for USDC from 65% to 82%',
      status: 'resolved',
      metrics: {
        asset: 'USDC',
        previousUtilization: 65,
        currentUtilization: 82,
        timeframeMins: 360
      }
    },
    {
      id: 'anomaly-5',
      protocolId: 'maple-finance',
      protocol: protocols.find(p => p.id === 'maple-finance'),
      timestamp: now - 43200, // 12 hours ago
      type: 'liquidation',
      severity: 'medium',
      description: 'Large liquidation event: $4.2M in positions liquidated',
      status: 'active',
      metrics: {
        liquidationVolume: 4200000,
        affectedPositions: 18,
        largestLiquidation: 760000,
        timeframeMins: 90
      }
    }
  ];
};

// Add generateMockProtocols function that was referenced in API.ts
export function generateMockProtocols(): Protocol[] {
  return getMockProtocols();
} 