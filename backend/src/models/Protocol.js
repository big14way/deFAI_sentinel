const mongoose = require('mongoose');

const ProtocolSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['restaking', 'liquid_staking', 'other']
  },
  metrics: {
    tvl: {
      type: Number,
      required: true,
      default: 0
    },
    totalSupply: {
      type: Number,
      required: true,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    dailyVolume: {
      type: Number,
      default: 0
    }
  },
  risk: {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.1
    },
    factors: [{
      name: String,
      weight: Number,
      score: Number,
      lastUpdated: Date
    }],
    history: [{
      score: Number,
      timestamp: Date,
      factors: [{
        name: String,
        score: Number
      }]
    }]
  },
  security: {
    audited: {
      type: Boolean,
      default: false
    },
    auditReports: [{
      auditor: String,
      date: Date,
      report: String,
      issues: {
        critical: Number,
        high: Number,
        medium: Number,
        low: Number
      }
    }],
    knownVulnerabilities: [{
      description: String,
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      },
      status: {
        type: String,
        enum: ['open', 'fixed', 'in_progress']
      },
      discoveredAt: Date,
      fixedAt: Date
    }]
  },
  monitoring: {
    lastChecked: Date,
    checkFrequency: {
      type: Number,
      default: 300 // 5 minutes in seconds
    },
    alerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      thresholds: {
        riskScore: {
          type: Number,
          default: 0.7
        },
        tvlChange: {
          type: Number,
          default: 20 // 20% change
        },
        transactionSize: {
          type: Number,
          default: 100 // 100 ETH
        }
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
ProtocolSchema.index({ address: 1 });
ProtocolSchema.index({ 'risk.score': -1 });
ProtocolSchema.index({ 'metrics.tvl': -1 });
ProtocolSchema.index({ type: 1, 'risk.score': -1 });

// Update the updatedAt timestamp on save
ProtocolSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Protocol', ProtocolSchema); 