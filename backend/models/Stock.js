const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9.-]+$/, 'Invalid stock symbol format']
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    enum: [
      'Technology', 'Banking', 'Pharmaceuticals', 'Automotive', 
      'FMCG', 'Energy', 'Infrastructure', 'Metals', 'Textiles',
      'Chemicals', 'Telecom', 'Media', 'Real Estate', 'Healthcare',
      'Utilities', 'Consumer Services', 'Oil & Gas', 'Construction'
    ]
  },
  exchange: {
    type: String,
    required: [true, 'Exchange is required'],
    enum: ['NSE', 'BSE'],
    default: 'NSE'
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0.01, 'Price must be greater than 0']
  },
  priceChange: {
    type: Number,
    default: 0
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    required: [true, 'Volume is required'],
    min: [0, 'Volume cannot be negative']
  },
  marketCap: {
    type: Number,
    required: [true, 'Market cap is required'],
    min: [0, 'Market cap cannot be negative']
  },
  dayHigh: {
    type: Number,
    min: [0, 'Day high cannot be negative']
  },
  dayLow: {
    type: Number,
    min: [0, 'Day low cannot be negative']
  },
  weekHigh52: {
    type: Number,
    min: [0, '52-week high cannot be negative']
  },
  weekLow52: {
    type: Number,
    min: [0, '52-week low cannot be negative']
  },
  technicalIndicators: {
    rsi: {
      type: Number,
      min: [0, 'RSI cannot be less than 0'],
      max: [100, 'RSI cannot be greater than 100']
    },
    macd: {
      value: Number,
      signal: Number,
      histogram: Number
    },
    movingAverage50: {
      type: Number,
      min: [0, 'Moving average cannot be negative']
    },
    movingAverage200: {
      type: Number,
      min: [0, 'Moving average cannot be negative']
    },
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    supportLevel: {
      type: Number,
      min: [0, 'Support level cannot be negative']
    },
    resistanceLevel: {
      type: Number,
      min: [0, 'Resistance level cannot be negative']
    }
  },
  fundamentalData: {
    peRatio: {
      type: Number,
      min: [0, 'P/E ratio cannot be negative']
    },
    pbRatio: {
      type: Number,
      min: [0, 'P/B ratio cannot be negative']
    },
    debtToEquity: {
      type: Number,
      min: [0, 'Debt-to-equity ratio cannot be negative']
    },
    roe: {
      type: Number,
      min: [-100, 'ROE cannot be less than -100%'],
      max: [1000, 'ROE cannot be greater than 1000%']
    },
    eps: {
      type: Number
    },
    dividendYield: {
      type: Number,
      min: [0, 'Dividend yield cannot be negative'],
      max: [100, 'Dividend yield cannot exceed 100%']
    },
    bookValue: {
      type: Number,
      min: [0, 'Book value cannot be negative']
    },
    revenueGrowth: {
      type: Number
    },
    profitGrowth: {
      type: Number
    }
  },
  sentimentData: {
    newsScore: {
      type: Number,
      min: [-1, 'News sentiment score cannot be less than -1'],
      max: [1, 'News sentiment score cannot be greater than 1'],
      default: 0
    },
    socialScore: {
      type: Number,
      min: [-1, 'Social sentiment score cannot be less than -1'],
      max: [1, 'Social sentiment score cannot be greater than 1'],
      default: 0
    },
    overallSentiment: {
      type: String,
      enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
      default: 'neutral'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
stockSchema.index({ symbol: 1 });
stockSchema.index({ sector: 1 });
stockSchema.index({ exchange: 1 });
stockSchema.index({ marketCap: -1 });
stockSchema.index({ 'technicalIndicators.rsi': 1 });
stockSchema.index({ 'fundamentalData.peRatio': 1 });
stockSchema.index({ lastUpdated: -1 });

// Compound indexes
stockSchema.index({ sector: 1, marketCap: -1 });
stockSchema.index({ exchange: 1, sector: 1 });

// Virtual for price trend
stockSchema.virtual('priceTrend').get(function() {
  if (this.priceChangePercent > 2) return 'strong_bullish';
  if (this.priceChangePercent > 0) return 'bullish';
  if (this.priceChangePercent < -2) return 'strong_bearish';
  if (this.priceChangePercent < 0) return 'bearish';
  return 'neutral';
});

// Virtual for market cap category
stockSchema.virtual('marketCapCategory').get(function() {
  if (this.marketCap >= 200000000000) return 'large_cap'; // 2 lakh crore
  if (this.marketCap >= 50000000000) return 'mid_cap'; // 50 thousand crore
  return 'small_cap';
});

// Instance method to update price data
stockSchema.methods.updatePriceData = function(priceData) {
  const oldPrice = this.currentPrice;
  this.currentPrice = priceData.currentPrice;
  this.priceChange = priceData.currentPrice - oldPrice;
  this.priceChangePercent = ((priceData.currentPrice - oldPrice) / oldPrice) * 100;
  this.volume = priceData.volume;
  this.dayHigh = priceData.dayHigh;
  this.dayLow = priceData.dayLow;
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find by sector
stockSchema.statics.findBySector = function(sector) {
  return this.find({ sector, isActive: true });
};

// Static method to find trending stocks
stockSchema.statics.findTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ volume: -1, priceChangePercent: -1 })
    .limit(limit);
};

// Static method to find by market cap range
stockSchema.statics.findByMarketCapRange = function(minCap, maxCap) {
  return this.find({
    marketCap: { $gte: minCap, $lte: maxCap },
    isActive: true
  });
};

module.exports = mongoose.model('Stock', stockSchema);