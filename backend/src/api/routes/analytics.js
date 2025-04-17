const express = require('express');
const router = express.Router();
const Protocol = require('../../models/Protocol');
const Alert = require('../../models/Alert');

// Get risk history for all protocols
router.get('/risk-history', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const now = new Date();
    let startTime;

    switch (timeframe) {
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }

    const protocols = await Protocol.find()
      .select('address name risk.history')
      .lean();

    const riskHistory = protocols.map(protocol => ({
      address: protocol.address,
      name: protocol.name,
      history: protocol.risk.history.filter(h => 
        new Date(h.timestamp) >= startTime
      )
    }));

    res.json(riskHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert trends
router.get('/alert-trends', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const now = new Date();
    let startTime;
    let interval;

    switch (timeframe) {
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        interval = 'hour';
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        interval = 'day';
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        interval = 'day';
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        interval = 'hour';
    }

    const alerts = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            time: {
              $dateToString: {
                format: interval === 'hour' ? '%Y-%m-%d-%H' : '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' }
        }
      },
      {
        $sort: {
          '_id.time': 1
        }
      }
    ]);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get protocol statistics
router.get('/protocol-stats', async (req, res) => {
  try {
    const stats = await Protocol.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalTVL: { $sum: '$metrics.tvl' },
          avgRiskScore: { $avg: '$risk.score' },
          protocols: {
            $push: {
              address: '$address',
              name: '$name',
              tvl: '$metrics.tvl',
              riskScore: '$risk.score'
            }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk factor analysis
router.get('/risk-factors', async (req, res) => {
  try {
    const protocols = await Protocol.find()
      .select('risk.factors')
      .lean();

    const factorAnalysis = {};
    protocols.forEach(protocol => {
      protocol.risk.factors.forEach(factor => {
        if (!factorAnalysis[factor.name]) {
          factorAnalysis[factor.name] = {
            totalScore: 0,
            count: 0,
            avgScore: 0,
            highRiskCount: 0
          };
        }

        factorAnalysis[factor.name].totalScore += factor.score;
        factorAnalysis[factor.name].count += 1;
        if (factor.score >= 0.7) {
          factorAnalysis[factor.name].highRiskCount += 1;
        }
      });
    });

    // Calculate averages
    Object.keys(factorAnalysis).forEach(factor => {
      factorAnalysis[factor].avgScore = 
        factorAnalysis[factor].totalScore / factorAnalysis[factor].count;
    });

    res.json(factorAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 