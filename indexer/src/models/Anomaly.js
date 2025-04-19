const mongoose = require('mongoose');

const AnomalySchema = new mongoose.Schema({
  protocol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocol',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'price_manipulation', 
      'flash_loan_attack', 
      'unusual_tvl_change',
      'governance_attack',
      'oracle_manipulation',
      'smart_contract_vulnerability',
      'liquidity_pool_imbalance',
      'unusual_transaction_volume',
      'reentrancy',
      'other'
    ],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  detectionMethod: {
    type: String,
    enum: ['ml_model', 'rules_based', 'manual', 'on_chain', 'external'],
    required: true
  },
  features: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  alertsGenerated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Add compound indexes for efficient querying
AnomalySchema.index({ protocol: 1, timestamp: -1 });
AnomalySchema.index({ severity: 1, resolved: 1 });
AnomalySchema.index({ type: 1, severity: 1 });

module.exports = mongoose.model('Anomaly', AnomalySchema); 