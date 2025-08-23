const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    ref: 'User',
    unique: true
  },
  holdings: [{
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      uppercase: true,
      trim: true,
      ref: 'Stock'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be greater than 0']
    },
    averagePrice: {
      type: Number,
      required: [true, 'Average price is required'],
      min: [0.01, 'Average price must be greater than 0']
    },
    totalInvestment: {
      type: Number,
      required: [true, 'Total investment is required'],
      min: [0.01, 'Total investment must be greater than 0']
    },
    currentValue: {
      type: Number,
      default: 0
    },
    unrealizedPnL: {
      type: Number,
      default: 0
    },
    unrealizedPnLPercent: {
      type: Number,
      default: 0
    },
    dayChange: {
      type: Number,
      default: 0
    },
    dayChangePercent: {
      type: Number,
      default: 0
    },
    transactions: [{
      type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [0.001, 'Transaction quantity must be greater than 0']
      },
      price: {
        type: Number,
        required: true,
        min: [0.01, 'Transaction price must be greater than 0']
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      charges: {
        brokerage: { type: Number, default: 0 },
        taxes: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      }
    }],
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  summary: {
    totalValue: {
      type: Number,
      default: 0
    },
    totalInvestment: {
      type: Number,
      default: 0
    },
    totalPnL: {
      type: Number,
      default: 0
    },
    totalPnLPercent: {
      type: Number,
      default: 0
    },
    dayChange: {
      type: Number,
      default: 0
    },
    dayChangePercent: {
      type: Number,
      default: 0
    },
    realizedPnL: {
      type: Number,
      default: 0
    },
    totalCharges: {
      type: Number,
      default: 0
    }
  },
  allocation: {
    sectors: [{
      name: String,
      value: Number,
      percentage: Number
    }],
    riskLevels: [{
      level: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      value: Number,
      percentage: Number
    }],
    marketCaps: [{
      category: {
        type: String,
        enum: ['large_cap', 'mid_cap', 'small_cap']
      },
      value: Number,
      percentage: Number
    }]
  },
  performance: {
    bestPerformer: {
      symbol: String,
      returnPercent: Number
    },
    worstPerformer: {
      symbol: String,
      returnPercent: Number
    },
    avgHoldingPeriod: Number, // in days
    winRate: Number, // percentage of profitable trades
    totalTrades: Number
  },
  watchlist: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      ref: 'Stock'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    alertPrice: Number,
    alertType: {
      type: String,
      enum: ['above', 'below'],
      default: 'above'
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  settings: {
    autoRebalance: {
      type: Boolean,
      default: false
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    notifications: {
      priceAlerts: { type: Boolean, default: true },
      portfolioUpdates: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ 'holdings.symbol': 1 });
portfolioSchema.index({ 'watchlist.symbol': 1 });
portfolioSchema.index({ 'summary.totalValue': -1 });

// Virtual for portfolio diversity score
portfolioSchema.virtual('diversityScore').get(function() {
  if (this.holdings.length === 0) return 0;
  
  const sectorCount = new Set(this.allocation.sectors.map(s => s.name)).size;
  const holdingCount = this.holdings.length;
  
  // Simple diversity score based on number of sectors and holdings
  return Math.min(100, (sectorCount * 20) + (holdingCount * 5));
});

// Instance method to add holding
portfolioSchema.methods.addHolding = function(symbol, quantity, price, charges = {}) {
  const existingHolding = this.holdings.find(h => h.symbol === symbol);
  
  if (existingHolding) {
    // Update existing holding
    const newTotalInvestment = existingHolding.totalInvestment + (quantity * price);
    const newQuantity = existingHolding.quantity + quantity;
    existingHolding.averagePrice = newTotalInvestment / newQuantity;
    existingHolding.quantity = newQuantity;
    existingHolding.totalInvestment = newTotalInvestment;
    
    // Add transaction
    existingHolding.transactions.push({
      type: 'buy',
      quantity,
      price,
      amount: quantity * price,
      charges
    });
  } else {
    // Add new holding
    this.holdings.push({
      symbol,
      quantity,
      averagePrice: price,
      totalInvestment: quantity * price,
      transactions: [{
        type: 'buy',
        quantity,
        price,
        amount: quantity * price,
        charges
      }]
    });
  }
  
  return this.save();
};

// Instance method to sell holding
portfolioSchema.methods.sellHolding = function(symbol, quantity, price, charges = {}) {
  const holding = this.holdings.find(h => h.symbol === symbol);
  
  if (!holding) {
    throw new Error('Holding not found');
  }
  
  if (holding.quantity < quantity) {
    throw new Error('Insufficient quantity to sell');
  }
  
  // Calculate realized P&L
  const soldValue = quantity * price;
  const soldCost = quantity * holding.averagePrice;
  const realizedPnL = soldValue - soldCost;
  
  // Update holding
  holding.quantity -= quantity;
  holding.totalInvestment -= soldCost;
  
  // Add transaction
  holding.transactions.push({
    type: 'sell',
    quantity,
    price,
    amount: soldValue,
    charges
  });
  
  // Update realized P&L
  this.summary.realizedPnL += realizedPnL;
  
  // Remove holding if quantity becomes 0
  if (holding.quantity === 0) {
    this.holdings = this.holdings.filter(h => h.symbol !== symbol);
  }
  
  return this.save();
};

// Instance method to update portfolio values
portfolioSchema.methods.updatePortfolioValues = async function(stockPrices) {
  let totalValue = 0;
  let totalInvestment = 0;
  let dayChange = 0;
  
  for (let holding of this.holdings) {
    const stockPrice = stockPrices[holding.symbol];
    if (stockPrice) {
      holding.currentValue = holding.quantity * stockPrice.currentPrice;
      holding.unrealizedPnL = holding.currentValue - holding.totalInvestment;
      holding.unrealizedPnLPercent = (holding.unrealizedPnL / holding.totalInvestment) * 100;
      holding.dayChange = holding.quantity * stockPrice.priceChange;
      holding.dayChangePercent = stockPrice.priceChangePercent;
      holding.lastUpdated = new Date();
      
      totalValue += holding.currentValue;
      totalInvestment += holding.totalInvestment;
      dayChange += holding.dayChange;
    }
  }
  
  // Update summary
  this.summary.totalValue = totalValue;
  this.summary.totalInvestment = totalInvestment;
  this.summary.totalPnL = totalValue - totalInvestment;
  this.summary.totalPnLPercent = totalInvestment > 0 ? (this.summary.totalPnL / totalInvestment) * 100 : 0;
  this.summary.dayChange = dayChange;
  this.summary.dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;
  
  return this.save();
};

// Instance method to add to watchlist
portfolioSchema.methods.addToWatchlist = function(symbol, alertPrice = null, alertType = 'above', notes = '') {
  const existingWatch = this.watchlist.find(w => w.symbol === symbol);
  
  if (existingWatch) {
    throw new Error('Stock already in watchlist');
  }
  
  this.watchlist.push({
    symbol,
    alertPrice,
    alertType,
    notes
  });
  
  return this.save();
};

// Instance method to remove from watchlist
portfolioSchema.methods.removeFromWatchlist = function(symbol) {
  this.watchlist = this.watchlist.filter(w => w.symbol !== symbol);
  return this.save();
};

// Static method to find by user
portfolioSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId }).populate('holdings.symbol', 'name sector currentPrice priceChangePercent');
};

// Static method to get portfolio performance stats
portfolioSchema.statics.getPerformanceStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        totalValue: '$summary.totalValue',
        totalPnL: '$summary.totalPnL',
        totalPnLPercent: '$summary.totalPnLPercent',
        holdingCount: { $size: '$holdings' },
        watchlistCount: { $size: '$watchlist' }
      }
    }
  ]);
};

module.exports = mongoose.model('Portfolio', portfolioSchema);