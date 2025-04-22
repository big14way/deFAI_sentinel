const express = require('express');
const router = express.Router();
const Protocol = require('../../models/Protocol');
const SwellService = require('../../services/blockchain/SwellService');
const { isUsingMockData, generateMockProtocols } = require('../../config/database');

// Get all protocols
router.get('/', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockProtocols = generateMockProtocols(10);
      // Remove fields to match the select in the DB query
      const responseProtocols = mockProtocols.map(protocol => {
        const { security, ...rest } = protocol;
        const { auditReports, knownVulnerabilities, ...securityRest } = security;
        return {
          ...rest,
          security: securityRest
        };
      });
      return res.json(responseProtocols);
    }
    
    const protocols = await Protocol.find()
      .select('-security.auditReports -security.knownVulnerabilities')
      .sort({ 'risk.score': -1 });
    res.json(protocols);
  } catch (error) {
    // Fall back to mock data on error
    const mockProtocols = generateMockProtocols(10);
    const responseProtocols = mockProtocols.map(protocol => {
      const { security, ...rest } = protocol;
      const { auditReports, knownVulnerabilities, ...securityRest } = security;
      return {
        ...rest,
        security: securityRest
      };
    });
    res.json(responseProtocols);
  }
});

// Get protocol metrics
router.get('/metrics', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockProtocols = generateMockProtocols(10);
      const totalTVL = mockProtocols.reduce((sum, protocol) => sum + protocol.metrics.tvl, 0);
      const avgRiskScore = mockProtocols.reduce((sum, protocol) => sum + protocol.risk.score, 0) / mockProtocols.length;
      
      return res.json({
        totalTVL,
        avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
        protocolCount: mockProtocols.length,
        highRiskCount: mockProtocols.filter(p => p.risk.score > 0.7).length,
        mediumRiskCount: mockProtocols.filter(p => p.risk.score > 0.4 && p.risk.score <= 0.7).length,
        lowRiskCount: mockProtocols.filter(p => p.risk.score <= 0.4).length
      });
    }
    
    const metrics = await SwellService.getProtocolMetrics();
    res.json(metrics);
  } catch (error) {
    // Fall back to mock data on error
    const mockProtocols = generateMockProtocols(10);
    const totalTVL = mockProtocols.reduce((sum, protocol) => sum + protocol.metrics.tvl, 0);
    const avgRiskScore = mockProtocols.reduce((sum, protocol) => sum + protocol.risk.score, 0) / mockProtocols.length;
    
    res.json({
      totalTVL,
      avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
      protocolCount: mockProtocols.length,
      highRiskCount: mockProtocols.filter(p => p.risk.score > 0.7).length,
      mediumRiskCount: mockProtocols.filter(p => p.risk.score > 0.4 && p.risk.score <= 0.7).length,
      lowRiskCount: mockProtocols.filter(p => p.risk.score <= 0.4).length
    });
  }
});

// Get protocol by address
router.get('/:address', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockProtocols = generateMockProtocols(10);
      // Use the first mock protocol and set its address to the requested one
      const mockProtocol = {...mockProtocols[0]};
      mockProtocol.address = req.params.address;
      return res.json(mockProtocol);
    }
    
    const protocol = await Protocol.findOne({ address: req.params.address });
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol);
  } catch (error) {
    // Fall back to mock data on error
    const mockProtocols = generateMockProtocols(10);
    const mockProtocol = {...mockProtocols[0]};
    mockProtocol.address = req.params.address;
    res.json(mockProtocol);
  }
});

// Get protocol risk history
router.get('/:address/risk-history', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockProtocols = generateMockProtocols(1);
      return res.json(mockProtocols[0].risk.history);
    }
    
    const protocol = await Protocol.findOne({ address: req.params.address })
      .select('risk.history');
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    res.json(protocol.risk.history);
  } catch (error) {
    // Fall back to mock data on error
    const mockProtocols = generateMockProtocols(1);
    res.json(mockProtocols[0].risk.history);
  }
});

// Update protocol monitoring settings
router.patch('/:address/monitoring', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockProtocols = generateMockProtocols(1);
      const mockProtocol = {...mockProtocols[0]};
      mockProtocol.address = req.params.address;
      mockProtocol.monitoring.alerts.enabled = req.body.alertsEnabled;
      mockProtocol.monitoring.alerts.thresholds = req.body.thresholds;
      mockProtocol.monitoring.checkFrequency = req.body.checkFrequency;
      return res.json(mockProtocol);
    }
    
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
    // Fall back to mock data on error
    const mockProtocols = generateMockProtocols(1);
    const mockProtocol = {...mockProtocols[0]};
    mockProtocol.address = req.params.address;
    mockProtocol.monitoring.alerts.enabled = req.body.alertsEnabled;
    mockProtocol.monitoring.alerts.thresholds = req.body.thresholds;
    mockProtocol.monitoring.checkFrequency = req.body.checkFrequency;
    res.json(mockProtocol);
  }
});

module.exports = router; 