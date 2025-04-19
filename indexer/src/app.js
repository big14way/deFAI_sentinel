const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./database/db');
const logger = require('./utils/logger');
const Protocol = require('./models/Protocol');
const Anomaly = require('./models/Anomaly');
const Alert = require('./models/Alert');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Function to generate mock data
async function generateMockData() {
  try {
    // Check if data already exists
    const protocolCount = await Protocol.countDocuments();
    if (protocolCount > 0) {
      logger.info('Mock data already exists, skipping generation');
      return;
    }

    logger.info('Generating mock data...');
    
    // Create protocols
    const protocols = [
      {
        name: 'Aave',
        address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        type: 'lending',
        chain: 'ethereum',
        description: 'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
        website: 'https://aave.com',
        tvl: 5200000000,
        riskScore: {
          current: 30,
          history: [{
            score: 30,
            timestamp: new Date(),
            reason: 'Initial score'
          }]
        },
        status: 'active'
      },
      {
        name: 'Compound',
        address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        type: 'lending',
        chain: 'ethereum',
        description: 'Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications.',
        website: 'https://compound.finance',
        tvl: 3800000000,
        riskScore: {
          current: 35,
          history: [{
            score: 35,
            timestamp: new Date(),
            reason: 'Initial score'
          }]
        },
        status: 'active'
      },
      {
        name: 'Uniswap',
        address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        type: 'dex',
        chain: 'ethereum',
        description: 'Uniswap is a decentralized protocol for automated token exchange on Ethereum.',
        website: 'https://uniswap.org',
        tvl: 7500000000,
        riskScore: {
          current: 25,
          history: [{
            score: 25,
            timestamp: new Date(),
            reason: 'Initial score'
          }]
        },
        status: 'active'
      },
      {
        name: 'MakerDAO',
        address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        type: 'lending',
        chain: 'ethereum',
        description: 'MakerDAO is a decentralized credit platform on Ethereum that supports Dai, a stablecoin whose value is pegged to USD.',
        website: 'https://makerdao.com',
        tvl: 8200000000,
        riskScore: {
          current: 28,
          history: [{
            score: 28,
            timestamp: new Date(),
            reason: 'Initial score'
          }]
        },
        status: 'active'
      },
      {
        name: 'Wrapped Ethereum',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        type: 'other',
        chain: 'ethereum',
        description: 'Wrapped Ether is an ERC-20 token pegged to Ether.',
        website: 'https://weth.io',
        tvl: 12000000000,
        riskScore: {
          current: 20,
          history: [{
            score: 20,
            timestamp: new Date(),
            reason: 'Initial score'
          }]
        },
        status: 'active'
      }
    ];

    const createdProtocols = await Protocol.insertMany(protocols);
    logger.info(`Created ${createdProtocols.length} protocols`);

    // Create anomalies
    const anomalyTypes = [
      'price_manipulation', 
      'flash_loan_attack', 
      'unusual_tvl_change',
      'governance_attack',
      'oracle_manipulation',
      'smart_contract_vulnerability'
    ];
    
    const anomalySeverities = ['low', 'medium', 'high', 'critical'];
    const detectionMethods = ['ml_model', 'rules_based', 'on_chain', 'external'];
    
    const anomalies = [];
    
    for (const protocol of createdProtocols) {
      // Create 1-3 anomalies per protocol
      const anomalyCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < anomalyCount; i++) {
        const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity = anomalySeverities[Math.floor(Math.random() * anomalySeverities.length)];
        const detectionMethod = detectionMethods[Math.floor(Math.random() * detectionMethods.length)];
        
        // Create anomaly with random timestamp in the past week
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7));
        
        anomalies.push({
          protocol: protocol._id,
          type,
          severity,
          timestamp,
          description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} severity ${type.replace(/_/g, ' ')} detected on ${protocol.name}`,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 range
          detectionMethod,
          resolved: Math.random() > 0.7, // 30% chance of being resolved
          features: {
            impactedValue: `$${Math.floor(Math.random() * 1000000)}`,
            transactionCount: Math.floor(Math.random() * 50) + 1
          }
        });
      }
    }
    
    const createdAnomalies = await Anomaly.insertMany(anomalies);
    logger.info(`Created ${createdAnomalies.length} anomalies`);
    
    // Create alerts
    const alertCategories = ['security', 'performance', 'governance', 'financial', 'operational'];
    const alertStatuses = ['new', 'acknowledged', 'in_progress', 'resolved', 'dismissed'];
    
    const alerts = [];
    
    for (const anomaly of createdAnomalies) {
      // Create 1-2 alerts per anomaly
      const alertCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < alertCount; i++) {
        const category = alertCategories[Math.floor(Math.random() * alertCategories.length)];
        const status = alertStatuses[Math.floor(Math.random() * alertStatuses.length)];
        
        const protocolDoc = await Protocol.findById(anomaly.protocol);
        
        alerts.push({
          protocol: anomaly.protocol,
          anomaly: anomaly._id,
          title: `${anomaly.severity.toUpperCase()} - ${anomaly.type.replace(/_/g, ' ').toUpperCase()} on ${protocolDoc.name}`,
          message: `An ${anomaly.severity} severity ${anomaly.type.replace(/_/g, ' ')} was detected on ${protocolDoc.name}. Immediate action is recommended.`,
          severity: anomaly.severity,
          category,
          status,
          timestamp: anomaly.timestamp,
          notificationChannels: {
            email: {
              sent: true,
              sentAt: new Date(),
              recipients: ['admin@defai-sentinel.io']
            }
          }
        });
      }
    }
    
    const createdAlerts = await Alert.insertMany(alerts);
    logger.info(`Created ${createdAlerts.length} alerts`);
    
    // Update anomalies with alertsGenerated
    for (const alert of createdAlerts) {
      await Anomaly.findByIdAndUpdate(alert.anomaly, { 
        $push: { alertsGenerated: alert._id } 
      });
    }
    
    logger.info('Mock data generation completed');
  } catch (error) {
    logger.error(`Error generating mock data: ${error.message}`);
  }
}

// Connect to MongoDB
connectDB().then(() => {
  logger.info('MongoDB connected successfully');
  // Generate mock data
  generateMockData();
}).catch(err => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DeFAI Sentinel Indexer is running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Math.floor(Date.now() / 1000)
  });
});

// Protocol routes
app.get('/api/protocols', async (req, res) => {
  try {
    const protocols = await Protocol.find().sort({ 'riskScore.current': -1 });
    res.json(protocols);
  } catch (error) {
    logger.error(`Error fetching protocols: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/protocols/:address', async (req, res) => {
  try {
    const protocol = await Protocol.findOne({ address: req.params.address });
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol);
  } catch (error) {
    logger.error(`Error fetching protocol: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Anomaly routes
app.get('/api/anomalies', async (req, res) => {
  try {
    const anomalies = await Anomaly.find()
      .populate('protocol')
      .sort({ timestamp: -1 });
    res.json(anomalies);
  } catch (error) {
    logger.error(`Error fetching anomalies: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/protocols/:protocolId/anomalies', async (req, res) => {
  try {
    const anomalies = await Anomaly.find({ protocol: req.params.protocolId })
      .sort({ timestamp: -1 });
    res.json(anomalies);
  } catch (error) {
    logger.error(`Error fetching protocol anomalies: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alert routes
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('protocol')
      .populate('anomaly')
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    logger.error(`Error fetching alerts: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Network stats
app.get('/api/network-stats', async (req, res) => {
  try {
    const networks = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base'];
    const stats = networks.map(network => ({
      name: network,
      volume24h: Math.floor(Math.random() * 1000000000) + 500000000, // $500M-$1.5B
      activeBridges: Math.floor(Math.random() * 20) + 5, // 5-25
      avgRiskScore: Math.floor(Math.random() * 30) + 20, // 20-50
      volume7d: [
        Math.floor(Math.random() * 1000000000) + 300000000,
        Math.floor(Math.random() * 1000000000) + 400000000,
        Math.floor(Math.random() * 1000000000) + 500000000,
        Math.floor(Math.random() * 1000000000) + 600000000,
        Math.floor(Math.random() * 1000000000) + 500000000,
        Math.floor(Math.random() * 1000000000) + 400000000,
        Math.floor(Math.random() * 1000000000) + 300000000
      ]
    }));
    
    res.json(stats);
  } catch (error) {
    logger.error(`Error fetching network stats: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Indexer service running on port ${PORT}`);
}); 