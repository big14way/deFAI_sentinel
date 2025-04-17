const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['high_risk_deposit', 'high_risk_withdrawal', 'suspicious_pattern', 'network_anomaly']
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  protocol: {
    type: String,
    required: true
  },
  details: {
    transaction: {
      hash: String,
      from: String,
      to: String,
      value: String,
      timestamp: Number
    },
    anomalyFactors: [{
      factor: String,
      score: Number,
      description: String
    }]
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'investigating', 'resolved', 'false_positive'],
    default: 'open'
  },
  resolution: {
    resolvedBy: String,
    resolution: String,
    timestamp: Number
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

// Index for efficient querying
AlertSchema.index({ type: 1, status: 1, createdAt: -1 });
AlertSchema.index({ protocol: 1, createdAt: -1 });
AlertSchema.index({ riskScore: -1 });

// Update the updatedAt timestamp on save
AlertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Alert', AlertSchema); 