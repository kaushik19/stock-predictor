const mongoose = require('mongoose');
const redis = require('redis');
const { logger } = require('../middleware/errorHandler');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-predictor';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Redis connection
let redisClient = null;

const connectRedis = async () => {
  try {
    const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = redis.createClient({
      url: redisURL,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis connection attempts exceeded');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });
    
    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });
    
    await redisClient.connect();
    
    // Test Redis connection
    await redisClient.ping();
    logger.info('Redis ping successful');
    
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't exit process for Redis failure, app can work without cache
  }
};

// Redis utility functions
const getFromCache = async (key) => {
  if (!redisClient || !redisClient.isOpen) {
    return null;
  }
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

const setCache = async (key, data, expireInSeconds = 300) => {
  if (!redisClient || !redisClient.isOpen) {
    return false;
  }
  
  try {
    await redisClient.setEx(key, expireInSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

const deleteFromCache = async (key) => {
  if (!redisClient || !redisClient.isOpen) {
    return false;
  }
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  if (!redisClient || !redisClient.isOpen) {
    return false;
  }
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear error:', error);
    return false;
  }
};

module.exports = {
  connectMongoDB,
  connectRedis,
  redisClient,
  getFromCache,
  setCache,
  deleteFromCache,
  clearCache
};