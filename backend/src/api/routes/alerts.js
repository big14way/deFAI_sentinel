const express = require('express');
const router = express.Router();
const Alert = require('../../models/Alert');

// Get all alerts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const minRiskScore = parseFloat(req.query.minRiskScore);

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (minRiskScore) query.riskScore = { $gte: minRiskScore };

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Alert.countDocuments(query)
    ]);

    res.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent alerts
router.get('/recent', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          ...(resolution && {
            resolution: {
              ...resolution,
              timestamp: Date.now()
            }
          })
        }
      },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      totalOpen,
      totalResolved,
      highRiskCount,
      recentAlerts
    ] = await Promise.all([
      Alert.countDocuments({ status: 'open' }),
      Alert.countDocuments({ status: 'resolved' }),
      Alert.countDocuments({ riskScore: { $gte: 0.7 }, status: 'open' }),
      Alert.find({ status: 'open' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type riskScore createdAt')
    ]);

    res.json({
      totalOpen,
      totalResolved,
      highRiskCount,
      recentAlerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 