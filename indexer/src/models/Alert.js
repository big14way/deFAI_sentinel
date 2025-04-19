const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  protocol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocol',
    required: true,
    index: true
  },
  anomaly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anomaly',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'governance', 'financial', 'operational', 'other'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'in_progress', 'resolved', 'dismissed'],
    default: 'new',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notificationChannels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      recipients: [{ type: String }]
    },
    slack: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      channel: { type: String, default: null }
    },
    webhook: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
      endpoint: { type: String, default: null }
    }
  },
  actions: [{
    type: { type: String },
    timestamp: { type: Date, default: Date.now },
    user: { type: String },
    notes: { type: String }
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
AlertSchema.index({ protocol: 1, timestamp: -1 });
AlertSchema.index({ severity: 1, status: 1 });
AlertSchema.index({ category: 1, severity: 1 });

module.exports = mongoose.model('Alert', AlertSchema); 