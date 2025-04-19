import { Protocol, ProtocolCategory, ProtocolStatus } from '../types/protocol';

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
    chainId: 8453
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
    chainId: 8453
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
    chainId: 8453
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
    chainId: 8453
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
    chainId: 8453
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

// Mock anomalies data
export const mockAnomalies = [
  {
    protocol: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    anomalyType: 'PRICE_DEVIATION',
    description: 'Unusual price movement detected',
    severity: 2,
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    resolved: false
  },
  {
    protocol: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    anomalyType: 'VOLUME_SPIKE',
    description: 'Sudden increase in transaction volume',
    severity: 3,
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    resolved: false
  },
  {
    protocol: '0x514910771af9ca656af840dff83e8264ecf986ca',
    anomalyType: 'SMART_CONTRACT_INTERACTION',
    description: 'Unexpected contract interaction pattern',
    severity: 4,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    resolved: false
  }
];

// Mock cross-chain links
export const mockCrossChainLinks = [
  {
    id: '1',
    sourceChainId: 8453, // Base
    sourceProtocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Aave on Base
    targetChainId: 1, // Ethereum
    targetProtocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Aave on Ethereum
    bridgeAddress: '0x4200000000000000000000000000000000000010', // Base Bridge
    riskScore: 30,
    lastSyncTime: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    isActive: true
  },
  {
    id: '2',
    sourceChainId: 8453, // Base
    sourceProtocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Uniswap on Base
    targetChainId: 1, // Ethereum
    targetProtocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Uniswap on Ethereum
    bridgeAddress: '0x4200000000000000000000000000000000000010', // Base Bridge
    riskScore: 35,
    lastSyncTime: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    isActive: true
  },
  {
    id: '3',
    sourceChainId: 8453, // Base
    sourceProtocolAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // Polygon on Base
    targetChainId: 137, // Polygon
    targetProtocolAddress: '0x0000000000000000000000000000000000001010', // Polygon on Polygon
    bridgeAddress: '0x7d6015dd3173f7d6db9f46640eaa3f36a1a14ee2', // Mock bridge address
    riskScore: 50,
    lastSyncTime: Date.now() - 1000 * 60 * 60, // 1 hour ago
    isActive: true
  }
];

// Mock user exposures
export const mockUserExposures: Record<string, any[]> = {
  // Demo user address
  '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE': [
    {
      protocolAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      protocolName: 'Aave',
      amount: 12500,
      assets: [
        { symbol: 'AAVE', amount: 125, value: 12500 }
      ]
    },
    {
      protocolAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      protocolName: 'Uniswap',
      amount: 8750,
      assets: [
        { symbol: 'UNI', amount: 875, value: 8750 }
      ]
    },
    {
      protocolAddress: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      protocolName: 'Compound',
      amount: 5000,
      assets: [
        { symbol: 'COMP', amount: 10, value: 5000 }
      ]
    }
  ]
}; 