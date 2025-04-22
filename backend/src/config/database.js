const mongoose = require('mongoose');
require('dotenv').config();

// Flag to indicate if we're using mock data
let usingMockData = false;

// Get the mock data status
const isUsingMockData = () => usingMockData;

// Generate mock alerts data
const generateMockAlerts = (count = 20) => {
  const types = ['high_risk_deposit', 'high_risk_withdrawal', 'suspicious_pattern', 'network_anomaly'];
  const statuses = ['open', 'investigating', 'resolved', 'false_positive'];
  const protocols = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'Avalanche'];
  
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const riskScore = parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)); // Between 0.5 and 1.0
    
    return {
      _id: `mock-alert-${i}`,
      type,
      riskScore,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      details: {
        transaction: {
          hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          from: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          to: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          value: `${Math.floor(Math.random() * 10000000000)}`,
          timestamp: Math.floor(createdAt.getTime() / 1000)
        },
        anomalyFactors: [
          {
            factor: 'Transaction size',
            score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
            description: 'Unusually large transaction amount'
          },
          {
            factor: 'Wallet age',
            score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
            description: 'Recently created wallet'
          }
        ]
      },
      status,
      resolution: status === 'resolved' || status === 'false_positive' ? {
        resolvedBy: 'system',
        resolution: status === 'resolved' ? 'Verified as legitimate' : 'False positive',
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400)
      } : null,
      createdAt,
      updatedAt: new Date()
    };
  });
};

// Mock data for alerts statistics
const getMockAlertStats = () => {
  return {
    totalOpen: Math.floor(Math.random() * 30) + 10,
    totalResolved: Math.floor(Math.random() * 100) + 50,
    highRiskCount: Math.floor(Math.random() * 15) + 5,
    recentAlerts: Array.from({ length: 5 }, (_, i) => ({
      _id: `mock-recent-${i}`,
      type: ['high_risk_deposit', 'high_risk_withdrawal', 'suspicious_pattern', 'network_anomaly'][Math.floor(Math.random() * 4)],
      riskScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000)
    }))
  };
};

// Generate mock protocol data
const generateMockProtocols = (count = 10) => {
  const protocolTypes = ['Liquid Staking', 'Restaking', 'Oracle', 'Node Operator'];
  const names = ['Swell Protocol', 'EigenLayer', 'Renzo', 'Puffer Finance', 'Kelp DAO', 'StakeWise', 'Lido', 'Rocket Pool', 'Mantle', 'Obol'];
  
  return Array.from({ length: count }, (_, i) => {
    const tvl = Math.floor(Math.random() * 50000000) + 10000000; // $10M to $60M
    const riskScore = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)); // 0.1 to 0.9
    
    // Generate risk history
    const history = [];
    const today = new Date();
    for (let j = 30; j >= 0; j--) {
      const date = new Date(today);
      date.setDate(date.getDate() - j);
      history.push({
        timestamp: date,
        score: parseFloat((riskScore + (Math.random() * 0.2 - 0.1)).toFixed(2)) // Fluctuate around the risk score
      });
    }
    
    // Generate risk factors
    const factors = [
      {
        name: 'Smart Contract Risk',
        score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
        weight: 0.4
      },
      {
        name: 'Market Risk',
        score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
        weight: 0.2
      },
      {
        name: 'Operational Risk',
        score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
        weight: 0.15
      },
      {
        name: 'Governance Risk',
        score: parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
        weight: 0.25
      }
    ];
    
    return {
      _id: `mock-protocol-${i}`,
      name: names[i % names.length],
      address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      type: protocolTypes[Math.floor(Math.random() * protocolTypes.length)],
      metrics: {
        tvl,
        validators: Math.floor(Math.random() * 1000) + 100,
        apr: parseFloat((Math.random() * 8 + 3).toFixed(2)) // 3% to 11%
      },
      risk: {
        score: riskScore,
        level: riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low',
        factors,
        history
      },
      security: {
        auditCount: Math.floor(Math.random() * 5) + 1,
        lastAuditDate: new Date(today.getTime() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000)
      },
      monitoring: {
        alerts: {
          enabled: true,
          thresholds: {
            riskScore: 0.7,
            tvlChange: 15,
            validatorChange: 10
          }
        },
        checkFrequency: 'hourly'
      }
    };
  });
};

// Generate mock analytics data
const getMockAnalytics = () => {
  // Simulated alert trends
  const alertTrends = [];
  const today = new Date();
  const alertTypes = ['high_risk_deposit', 'high_risk_withdrawal', 'suspicious_pattern', 'network_anomaly'];
  
  // Generate hourly trends for the last 24 hours
  for (let i = 24; i >= 0; i--) {
    for (let type of alertTypes) {
      const date = new Date(today);
      date.setHours(date.getHours() - i);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
      
      alertTrends.push({
        _id: {
          type,
          time: formattedDate
        },
        count: Math.floor(Math.random() * 10),
        avgRiskScore: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2))
      });
    }
  }
  
  // Simulated protocol statistics
  const protocolStats = [
    {
      _id: 'Liquid Staking',
      count: 4,
      totalTVL: 120000000,
      avgRiskScore: 0.45,
      protocols: generateMockProtocols(4).map(p => ({
        address: p.address,
        name: p.name,
        tvl: p.metrics.tvl,
        riskScore: p.risk.score
      }))
    },
    {
      _id: 'Restaking',
      count: 3,
      totalTVL: 90000000,
      avgRiskScore: 0.65,
      protocols: generateMockProtocols(3).map(p => ({
        address: p.address,
        name: p.name,
        tvl: p.metrics.tvl,
        riskScore: p.risk.score
      }))
    },
    {
      _id: 'Oracle',
      count: 2,
      totalTVL: 50000000,
      avgRiskScore: 0.55,
      protocols: generateMockProtocols(2).map(p => ({
        address: p.address,
        name: p.name,
        tvl: p.metrics.tvl,
        riskScore: p.risk.score
      }))
    }
  ];
  
  return {
    alertTrends,
    protocolStats
  };
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/defai_sentinel', {
      // MongoDB Atlas connection options
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Reduced timeout for faster fallback to mock data
      socketTimeoutMS: 45000,
    });
    usingMockData = false;
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Falling back to mock data mode for development');
    usingMockData = true;
    // Don't terminate the application
    return false;
  }
};

module.exports = { 
  connectDB,
  isUsingMockData,
  generateMockAlerts,
  getMockAlertStats,
  generateMockProtocols,
  getMockAnalytics
}; 