const express = require('express');
const router = express.Router();
const Protocol = require('../../models/Protocol');
const SwellService = require('../../services/blockchain/SwellService');

// Get all protocols
router.get('/', async (req, res) => {
  try {
    const protocols = await Protocol.find()
      .select('-security.auditReports -security.knownVulnerabilities')
      .sort({ 'risk.score': -1 });
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get protocol metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await SwellService.getProtocolMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get protocol by address
router.get('/:address', async (req, res) => {
  try {
    const protocol = await Protocol.findOne({ address: req.params.address });
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get protocol risk history
router.get('/:address/risk-history', async (req, res) => {
  try {
    const protocol = await Protocol.findOne({ address: req.params.address })
      .select('risk.history');
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol.risk.history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update protocol monitoring settings
router.patch('/:address/monitoring', async (req, res) => {
  try {
    const protocol = await Protocol.findOneAndUpdate(
      { address: req.params.address },
      { 
        $set: {
          'monitoring.alerts.enabled': req.body.alertsEnabled,
          'monitoring.alerts.thresholds': req.body.thresholds,
          'monitoring.checkFrequency': req.body.checkFrequency
        }
      },
      { new: true }
    );
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 