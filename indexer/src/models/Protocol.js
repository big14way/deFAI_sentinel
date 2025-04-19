const mongoose = require('mongoose');

const ProtocolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  address: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['lending', 'dex', 'yield', 'derivatives', 'staking', 'insurance', 'bridge', 'other'],
    required: true,
    index: true
  },
  chain: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  website: String,
  tvl: {
    type: Number,
    default: 0
  },
  riskScore: {
    current: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    history: [{
      score: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      reason: String
    }]
  },
  healthMetrics: {
    smartContractSecurity: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      auditCount: { type: Number, default: 0 },
      lastAuditDate: Date,
      vulnerabilities: [{ severity: String, description: String, fixed: Boolean }]
    },
    liquidityDepth: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      value: { type: Number, default: 0 }
    },
    governance: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      decentralizationLevel: { type: String, default: 'medium' }
    },
    transparency: {
      score: { type: Number, default: 50, min: 0, max: 100 }
    },
    marketRisk: {
      score: { type: Number, default: 50, min: 0, max: 100 }
    }
  },
  monitoringConfig: {
    active: {
      type: Boolean,
      default: true
    },
    anomalyThreshold: {
      type: Number,
      default: 75
    },
    alertThreshold: {
      type: Number,
      default: 80
    },
    notificationChannels: {
      email: [String],
      slack: String,
      webhook: String
    }
  },
  contracts: [{
    address: { type: String, required: true },
    name: String,
    type: String,
    description: String
  }],
  integrations: [{
    protocol: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protocol'
    },
    relationship: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'high_risk'],
    default: 'active',
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Add compound indexes
ProtocolSchema.index({ type: 1, chain: 1 });
ProtocolSchema.index({ 'riskScore.current': -1 });
ProtocolSchema.index({ status: 1, 'riskScore.current': -1 });

module.exports = mongoose.model('Protocol', ProtocolSchema); 