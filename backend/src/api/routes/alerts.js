const express = require('express');
const router = express.Router();
const Alert = require('../../models/Alert');
const { isUsingMockData, generateMockAlerts, getMockAlertStats } = require('../../config/database');

// Get all alerts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    // Check if we're using mock data
    if (req.usingMockData || isUsingMockData()) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const type = req.query.type;
      const minRiskScore = parseFloat(req.query.minRiskScore);
      
      // Generate mock alerts
      let mockAlerts = generateMockAlerts(50);
      
      // Apply filters if provided
      if (status) {
        mockAlerts = mockAlerts.filter(alert => alert.status === status);
      }
      if (type) {
        mockAlerts = mockAlerts.filter(alert => alert.type === type);
      }
      if (minRiskScore) {
        mockAlerts = mockAlerts.filter(alert => alert.riskScore >= minRiskScore);
      }
      
      // Sort by createdAt in descending order
      mockAlerts.sort((a, b) => b.createdAt - a.createdAt);
      
      // Apply pagination
      const total = mockAlerts.length;
      const paginatedAlerts = mockAlerts.slice((page - 1) * limit, page * limit);
      
      return res.json({
        alerts: paginatedAlerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // Normal database flow
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
    // If there's an error, fall back to mock data
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const mockAlerts = generateMockAlerts(50);
    const paginatedAlerts = mockAlerts.slice((page - 1) * limit, page * limit);
    
    res.json({
      alerts: paginatedAlerts,
      pagination: {
        page,
        limit,
        total: mockAlerts.length,
        pages: Math.ceil(mockAlerts.length / limit)
      },
      _mockData: true
    });
  }
});

// Get recent alerts
router.get('/recent', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockAlerts = generateMockAlerts(10)
        .filter(alert => alert.status === 'open')
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json(mockAlerts);
    }
    
    const alerts = await Alert.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    // Fall back to mock data on error
    const mockAlerts = generateMockAlerts(10)
      .filter(alert => alert.status === 'open')
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json(mockAlerts);
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const mockId = req.params.id;
      const mockAlert = generateMockAlerts(1)[0];
      mockAlert._id = mockId;
      return res.json(mockAlert);
    }
    
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    // Fall back to mock data on error
    const mockId = req.params.id;
    const mockAlert = generateMockAlerts(1)[0];
    mockAlert._id = mockId;
    res.json(mockAlert);
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      const { status, resolution } = req.body;
      const mockAlert = generateMockAlerts(1)[0];
      mockAlert._id = req.params.id;
      mockAlert.status = status;
      
      if (resolution) {
        mockAlert.resolution = {
          ...resolution,
          timestamp: Date.now()
        };
      }
      
      return res.json(mockAlert);
    }
    
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
    // Fall back to mock data on error
    const { status, resolution } = req.body;
    const mockAlert = generateMockAlerts(1)[0];
    mockAlert._id = req.params.id;
    mockAlert.status = status;
    
    if (resolution) {
      mockAlert.resolution = {
        ...resolution,
        timestamp: Date.now()
      };
    }
    
    res.json(mockAlert);
  }
});

// Get alerts statistics
router.get('/stats/summary', async (req, res) => {
  try {
    if (req.usingMockData || isUsingMockData()) {
      return res.json(getMockAlertStats());
    }
    
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
    // Fall back to mock data on error
    res.json(getMockAlertStats());
  }
});

module.exports = router; 