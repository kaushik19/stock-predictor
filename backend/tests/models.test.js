const mongoose = require('mongoose');
const { User, Stock, Recommendation, Portfolio } = require('../models');

beforeEach(async () => {
  // Clean up test data before each test
  await User.deleteMany({});
  await Stock.deleteMany({});
  await Recommendation.deleteMany({});
  await Portfolio.deleteMany({});
});

describe('User Model', () => {
  test('should create a user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      profile: {
        name: 'Test User',
        investmentExperience: 'beginner',
        riskTolerance: 'medium'
      }
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.profile.name).toBe(userData.profile.name);
    expect(savedUser.password).not.toBe(userData.password); // Should be hashed
  });

  test('should not create user with invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
      profile: {
        name: 'Test User'
      }
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  test('should compare password correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      profile: {
        name: 'Test User'
      }
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    const isNotMatch = await user.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});

describe('Stock Model', () => {
  test('should create a stock with valid data', async () => {
    const stockData = {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries Limited',
      sector: 'Energy',
      currentPrice: 2450.75,
      volume: 2500000,
      marketCap: 1650000000000
    };

    const stock = new Stock(stockData);
    const savedStock = await stock.save();

    expect(savedStock._id).toBeDefined();
    expect(savedStock.symbol).toBe(stockData.symbol);
    expect(savedStock.name).toBe(stockData.name);
    expect(savedStock.sector).toBe(stockData.sector);
  });

  test('should calculate market cap category correctly', async () => {
    const largeCap = new Stock({
      symbol: 'LARGE.NS',
      name: 'Large Cap Stock',
      sector: 'Technology',
      currentPrice: 1000,
      volume: 1000000,
      marketCap: 300000000000 // 3 lakh crore
    });

    const midCap = new Stock({
      symbol: 'MID.NS',
      name: 'Mid Cap Stock',
      sector: 'Banking',
      currentPrice: 500,
      volume: 500000,
      marketCap: 100000000000 // 1 lakh crore
    });

    const smallCap = new Stock({
      symbol: 'SMALL.NS',
      name: 'Small Cap Stock',
      sector: 'FMCG',
      currentPrice: 100,
      volume: 100000,
      marketCap: 10000000000 // 10 thousand crore
    });

    expect(largeCap.marketCapCategory).toBe('large_cap');
    expect(midCap.marketCapCategory).toBe('mid_cap');
    expect(smallCap.marketCapCategory).toBe('small_cap');
  });
});

describe('Recommendation Model', () => {
  test('should create a recommendation with valid data', async () => {
    const recommendationData = {
      symbol: 'RELIANCE.NS',
      timeHorizon: 'daily',
      action: 'buy',
      confidenceScore: 85,
      targetPrice: 2520.00,
      entryPrice: 2450.75,
      expectedReturn: 2.83,
      reasoning: {
        technical: 'Strong technical indicators',
        summary: 'Good buy opportunity'
      },
      riskLevel: 'medium',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      generatedBy: {
        algorithm: 'TestAlgorithm',
        version: '1.0.0'
      }
    };

    const recommendation = new Recommendation(recommendationData);
    const savedRecommendation = await recommendation.save();

    expect(savedRecommendation._id).toBeDefined();
    expect(savedRecommendation.symbol).toBe(recommendationData.symbol);
    expect(savedRecommendation.validUntil).toBeDefined();
  });

  test('should set validUntil based on timeHorizon', async () => {
    const now = new Date();
    const dailyRec = new Recommendation({
      symbol: 'TEST.NS',
      timeHorizon: 'daily',
      action: 'buy',
      confidenceScore: 80,
      targetPrice: 100,
      entryPrice: 95,
      expectedReturn: 5.26,
      reasoning: { technical: 'Test', summary: 'Test' },
      riskLevel: 'low',
      validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
      generatedBy: { algorithm: 'Test', version: '1.0.0' }
    });

    await dailyRec.save();
    
    expect(dailyRec.validUntil).toBeDefined();
    expect(dailyRec.validUntil.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe('Portfolio Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      email: 'portfolio@example.com',
      password: 'password123',
      profile: {
        name: 'Portfolio User'
      }
    });
    await testUser.save();
  });

  test('should create a portfolio for a user', async () => {
    const portfolio = new Portfolio({
      userId: testUser._id,
      holdings: [{
        symbol: 'RELIANCE.NS',
        quantity: 10,
        averagePrice: 2400.00,
        totalInvestment: 24000.00,
        transactions: [{
          type: 'buy',
          quantity: 10,
          price: 2400.00,
          amount: 24000.00
        }]
      }]
    });

    const savedPortfolio = await portfolio.save();

    expect(savedPortfolio._id).toBeDefined();
    expect(savedPortfolio.userId.toString()).toBe(testUser._id.toString());
    expect(savedPortfolio.holdings).toHaveLength(1);
    expect(savedPortfolio.holdings[0].symbol).toBe('RELIANCE.NS');
  });

  test('should add holding to portfolio', async () => {
    const portfolio = new Portfolio({
      userId: testUser._id,
      holdings: []
    });

    await portfolio.save();
    await portfolio.addHolding('TCS.NS', 5, 3500.00);

    expect(portfolio.holdings).toHaveLength(1);
    expect(portfolio.holdings[0].symbol).toBe('TCS.NS');
    expect(portfolio.holdings[0].quantity).toBe(5);
    expect(portfolio.holdings[0].averagePrice).toBe(3500.00);
  });

  test('should add to watchlist', async () => {
    const portfolio = new Portfolio({
      userId: testUser._id,
      holdings: [],
      watchlist: []
    });

    await portfolio.save();
    await portfolio.addToWatchlist('HDFCBANK.NS', 1700.00, 'above', 'Good banking stock');

    expect(portfolio.watchlist).toHaveLength(1);
    expect(portfolio.watchlist[0].symbol).toBe('HDFCBANK.NS');
    expect(portfolio.watchlist[0].alertPrice).toBe(1700.00);
  });
});