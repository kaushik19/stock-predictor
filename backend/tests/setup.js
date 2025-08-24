const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Mock Redis functions
jest.mock('../config/database', () => {
  const originalModule = jest.requireActual('../config/database');
  const mockCache = new Map();
  
  return {
    ...originalModule,
    getFromCache: jest.fn(async (key) => {
      return mockCache.get(key) || null;
    }),
    setCache: jest.fn(async (key, data, expireInSeconds = 300) => {
      mockCache.set(key, data);
      return true;
    }),
    deleteFromCache: jest.fn(async (key) => {
      mockCache.delete(key);
      return true;
    }),
    clearCache: jest.fn(async () => {
      mockCache.clear();
      return true;
    }),
    redisClient: {
      isOpen: true,
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      ping: jest.fn()
    }
  };
});

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
  process.env.MONGODB_URI = mongoUri;
  process.env.REDIS_URL = 'redis://localhost:6379'; // Will be mocked
  process.env.NEWS_API_KEY = 'test-news-api-key';
  process.env.ALPHA_VANTAGE_API_KEY = 'test-alpha-vantage-key';
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test timeout
jest.setTimeout(30000);