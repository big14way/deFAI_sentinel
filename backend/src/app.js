require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, isUsingMockData } = require('./config/database');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB
(async () => {
  await connectDB();
})();

// Redis client setup
let redisClient = null;
try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
    redisClient = null; // Set to null on error so we can check if it's available
  });

  // Initialize Redis connection
  (async () => {
    try {
      await redisClient.connect();
      console.log('Connected to Redis');
    } catch (err) {
      console.error('Redis connection error:', err);
      redisClient = null;
    }
  })();
} catch (err) {
  console.error('Redis setup error:', err);
}

// Status middleware to provide info to frontend
app.use((req, res, next) => {
  req.usingMockData = isUsingMockData();
  req.redisAvailable = !!redisClient;
  next();
});

// Routes
app.use('/api/protocols', require('./api/routes/protocols'));
app.use('/api/alerts', require('./api/routes/alerts'));
app.use('/api/analytics', require('./api/routes/analytics'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseMode: isUsingMockData() ? 'mock' : 'connected',
    redisAvailable: !!redisClient
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Database mode: ${isUsingMockData() ? 'MOCK (fallback)' : 'CONNECTED'}`);
}); 