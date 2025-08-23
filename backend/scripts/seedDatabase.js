const mongoose = require('mongoose');
const { connectMongoDB } = require('../config/database');
const { User, Stock, Recommendation, Portfolio } = require('../models');
const { logger } = require('../middleware/errorHandler');

// Sample data
const sampleUsers = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    profile: {
      name: 'John Doe',
      investmentExperience: 'intermediate',
      riskTolerance: 'medium',
      preferredTimeHorizon: ['daily', 'weekly']
    },
    preferences: {
      sectors: ['Technology', 'Banking'],
      maxInvestmentAmount: 500000,
      notifications: {
        email: true,
        push: true
      }
    }
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    profile: {
      name: 'Jane Smith',
      investmentExperience: 'expert',
      riskTolerance: 'high',
      preferredTimeHorizon: ['monthly', 'yearly']
    },
    preferences: {
      sectors: ['Pharmaceuticals', 'FMCG', 'Energy'],
      maxInvestmentAmount: 1000000,
      notifications: {
        email: true,
        push: false
      }
    }
  }
];

const sampleStocks = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Limited',
    sector: 'Energy',
    exchange: 'NSE',
    currentPrice: 2450.75,
    priceChange: 25.30,
    priceChangePercent: 1.04,
    volume: 2500000,
    marketCap: 1650000000000,
    dayHigh: 2465.80,
    dayLow: 2420.50,
    weekHigh52: 2856.15,
    weekLow52: 2220.30,
    technicalIndicators: {
      rsi: 65.5,
      macd: {
        value: 12.5,
        signal: 10.2,
        histogram: 2.3
      },
      movingAverage50: 2380.25,
      movingAverage200: 2320.80,
      supportLevel: 2400.00,
      resistanceLevel: 2500.00
    },
    fundamentalData: {
      peRatio: 28.5,
      pbRatio: 2.1,
      debtToEquity: 0.35,
      roe: 12.8,
      eps: 86.2,
      dividendYield: 0.8,
      bookValue: 1165.50
    }
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Limited',
    sector: 'Technology',
    exchange: 'NSE',
    currentPrice: 3520.40,
    priceChange: -15.60,
    priceChangePercent: -0.44,
    volume: 1800000,
    marketCap: 1280000000000,
    dayHigh: 3545.20,
    dayLow: 3510.80,
    weekHigh52: 4150.65,
    weekLow52: 3200.25,
    technicalIndicators: {
      rsi: 45.2,
      macd: {
        value: -8.5,
        signal: -6.2,
        histogram: -2.3
      },
      movingAverage50: 3580.75,
      movingAverage200: 3650.20,
      supportLevel: 3480.00,
      resistanceLevel: 3600.00
    },
    fundamentalData: {
      peRatio: 25.8,
      pbRatio: 12.5,
      debtToEquity: 0.08,
      roe: 45.2,
      eps: 136.5,
      dividendYield: 1.2,
      bookValue: 281.60
    }
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Limited',
    sector: 'Banking',
    exchange: 'NSE',
    currentPrice: 1685.30,
    priceChange: 8.75,
    priceChangePercent: 0.52,
    volume: 3200000,
    marketCap: 1240000000000,
    dayHigh: 1692.80,
    dayLow: 1675.20,
    weekHigh52: 1725.90,
    weekLow52: 1363.55,
    technicalIndicators: {
      rsi: 58.7,
      macd: {
        value: 5.2,
        signal: 3.8,
        histogram: 1.4
      },
      movingAverage50: 1650.40,
      movingAverage200: 1580.90,
      supportLevel: 1650.00,
      resistanceLevel: 1720.00
    },
    fundamentalData: {
      peRatio: 18.5,
      pbRatio: 2.8,
      debtToEquity: 0.95,
      roe: 16.8,
      eps: 91.2,
      dividendYield: 1.0,
      bookValue: 602.30
    }
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    sector: 'Technology',
    exchange: 'NSE',
    currentPrice: 1456.85,
    priceChange: 12.40,
    priceChangePercent: 0.86,
    volume: 2100000,
    marketCap: 620000000000,
    dayHigh: 1465.20,
    dayLow: 1440.75,
    weekHigh52: 1953.90,
    weekLow52: 1351.65,
    technicalIndicators: {
      rsi: 62.3,
      macd: {
        value: 8.7,
        signal: 6.5,
        histogram: 2.2
      },
      movingAverage50: 1420.60,
      movingAverage200: 1480.25,
      supportLevel: 1420.00,
      resistanceLevel: 1500.00
    },
    fundamentalData: {
      peRatio: 22.4,
      pbRatio: 7.8,
      debtToEquity: 0.12,
      roe: 31.5,
      eps: 65.1,
      dividendYield: 2.8,
      bookValue: 186.90
    }
  },
  {
    symbol: 'ITC.NS',
    name: 'ITC Limited',
    sector: 'FMCG',
    exchange: 'NSE',
    currentPrice: 425.60,
    priceChange: 3.20,
    priceChangePercent: 0.76,
    volume: 4500000,
    marketCap: 530000000000,
    dayHigh: 428.90,
    dayLow: 421.30,
    weekHigh52: 475.25,
    weekLow52: 385.40,
    technicalIndicators: {
      rsi: 55.8,
      macd: {
        value: 2.1,
        signal: 1.8,
        histogram: 0.3
      },
      movingAverage50: 415.80,
      movingAverage200: 420.45,
      supportLevel: 410.00,
      resistanceLevel: 450.00
    },
    fundamentalData: {
      peRatio: 28.9,
      pbRatio: 4.2,
      debtToEquity: 0.18,
      roe: 15.6,
      eps: 14.7,
      dividendYield: 4.2,
      bookValue: 101.30
    }
  }
];

const sampleRecommendations = [
  {
    symbol: 'RELIANCE.NS',
    timeHorizon: 'daily',
    action: 'buy',
    confidenceScore: 85,
    targetPrice: 2520.00,
    stopLoss: 2380.00,
    entryPrice: 2450.75,
    expectedReturn: 2.83,
    reasoning: {
      technical: 'RSI at 65.5 shows bullish momentum, MACD positive crossover, price above 50-day MA',
      fundamental: 'Strong Q3 results, expanding petrochemical business, debt reduction progress',
      sentiment: 'Positive news flow on green energy initiatives and retail expansion',
      summary: 'Strong technical setup with positive fundamentals and sentiment'
    },
    riskLevel: 'medium',
    factors: {
      technicalScore: 82,
      fundamentalScore: 88,
      sentimentScore: 85,
      volumeScore: 78
    },
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    generatedBy: {
      algorithm: 'MultiFactorAnalysis',
      version: '1.0.0'
    }
  },
  {
    symbol: 'TCS.NS',
    timeHorizon: 'weekly',
    action: 'hold',
    confidenceScore: 65,
    targetPrice: 3650.00,
    stopLoss: 3450.00,
    entryPrice: 3520.40,
    expectedReturn: 3.68,
    reasoning: {
      technical: 'RSI at 45.2 shows neutral momentum, below 50-day MA, MACD negative',
      fundamental: 'Consistent revenue growth, strong margin profile, healthy order book',
      sentiment: 'Mixed sentiment due to IT sector concerns but strong company fundamentals',
      summary: 'Neutral technical setup but strong fundamental position warrants hold'
    },
    riskLevel: 'low',
    factors: {
      technicalScore: 55,
      fundamentalScore: 92,
      sentimentScore: 68,
      volumeScore: 72
    },
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    generatedBy: {
      algorithm: 'MultiFactorAnalysis',
      version: '1.0.0'
    }
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Connect to database
    await connectMongoDB();
    
    // Clear existing data
    logger.info('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Stock.deleteMany({});
    await Recommendation.deleteMany({});
    await Portfolio.deleteMany({});
    
    // Seed users
    logger.info('👥 Seeding users...');
    const users = await User.insertMany(sampleUsers);
    logger.info(`✅ Created ${users.length} users`);
    
    // Seed stocks
    logger.info('📈 Seeding stocks...');
    const stocks = await Stock.insertMany(sampleStocks);
    logger.info(`✅ Created ${stocks.length} stocks`);
    
    // Seed recommendations
    logger.info('💡 Seeding recommendations...');
    const recommendations = await Recommendation.insertMany(sampleRecommendations);
    logger.info(`✅ Created ${recommendations.length} recommendations`);
    
    // Create sample portfolios
    logger.info('💼 Creating sample portfolios...');
    for (let user of users) {
      const portfolio = new Portfolio({
        userId: user._id,
        holdings: [
          {
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
          },
          {
            symbol: 'TCS.NS',
            quantity: 5,
            averagePrice: 3500.00,
            totalInvestment: 17500.00,
            transactions: [{
              type: 'buy',
              quantity: 5,
              price: 3500.00,
              amount: 17500.00
            }]
          }
        ],
        watchlist: [
          { symbol: 'HDFCBANK.NS', alertPrice: 1700.00, alertType: 'above' },
          { symbol: 'INFY.NS', alertPrice: 1400.00, alertType: 'below' }
        ]
      });
      
      await portfolio.save();
    }
    logger.info(`✅ Created ${users.length} portfolios`);
    
    logger.info('🎉 Database seeding completed successfully!');
    
    // Display summary
    const userCount = await User.countDocuments();
    const stockCount = await Stock.countDocuments();
    const recommendationCount = await Recommendation.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();
    
    logger.info('📊 Database Summary:');
    logger.info(`   Users: ${userCount}`);
    logger.info(`   Stocks: ${stockCount}`);
    logger.info(`   Recommendations: ${recommendationCount}`);
    logger.info(`   Portfolios: ${portfolioCount}`);
    
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };