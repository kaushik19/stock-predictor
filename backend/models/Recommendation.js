const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,
    trim: true,
    ref: 'Stock'
  },
  timeHorizon: {
    type: String,
    required: [true, 'Time horizon is required'],
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']
  },
  confidenceScore: {
    type: Number,
    required: [true, 'Confidence score is required'],
    min: [0, 'Confidence score cannot be less than 0'],
    max: [100, 'Confidence score cannot be greater than 100']
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required'],
    min: [0.01, 'Target price must be greater than 0']
  },
  stopLoss: {
    type: Number,
    min: [0.01, 'Stop loss must be greater than 0']
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required'],
    min: [0.01, 'Entry price must be greater than 0']
  },
  expectedReturn: {
    type: Number,
    required: [true, 'Expected return is required']
  },
  reasoning: {
    technical: {
      type: String,
      required: [true, 'Technical reasoning is required'],
      maxlength: [500, 'Technical reasoning cannot exceed 500 characters']
    },
    fundamental: {
      type: String,
      maxlength: [500, 'Fundamental reasoning cannot exceed 500 characters']
    },
    sentiment: {
      type: String,
      maxlength: [300, 'Sentiment reasoning cannot exceed 300 characters']
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: [200, 'Summary cannot exceed 200 characters']
    }
  },
  riskLevel: {
    type: String,
    required: [true, 'Risk level is required'],
    enum: ['low', 'medium', 'high', 'very_high']
  },
  factors: {
    technicalScore: {
      type: Number,
      min: [0, 'Technical score cannot be less than 0'],
      max: [100, 'Technical score cannot be greater than 100']
    },
    fundamentalScore: {
      type: Number,
      min: [0, 'Fundamental score cannot be less than 0'],
      max: [100, 'Fundamental score cannot be greater than 100']
    },
    sentimentScore: {
      type: Number,
      min: [0, 'Sentiment score cannot be less than 0'],
      max: [100, 'Sentiment score cannot be greater than 100']
    },
    volumeScore: {
      type: Number,
      min: [0, 'Volume score cannot be less than 0'],
      max: [100, 'Volume score cannot be greater than 100']
    }
  },
  marketConditions: {
    overallTrend: {
      type: String,
      enum: ['bullish', 'bearish', 'sideways', 'volatile']
    },
    sectorTrend: {
      type: String,
      enum: ['outperforming', 'underperforming', 'neutral']
    },
    volatilityLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  performance: {
    actualReturn: Number,
    hitTargetPrice: {
      type: Boolean,
      default: false
    },
    hitStopLoss: {
      type: Boolean,
      default: false
    },
    daysToTarget: Number,
    maxDrawdown: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  generatedBy: {
    algorithm: {
      type: String,
      required: [true, 'Algorithm name is required']
    },
    version: {
      type: String,
      required: [true, 'Algorithm version is required']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
recommendationSchema.index({ symbol: 1 });
recommendationSchema.index({ timeHorizon: 1 });
recommendationSchema.index({ action: 1 });
recommendationSchema.index({ confidenceScore: -1 });
recommendationSchema.index({ validUntil: 1 });
recommendationSchema.index({ createdAt: -1 });
recommendationSchema.index({ isActive: 1 });

// Compound indexes
recommendationSchema.index({ timeHorizon: 1, confidenceScore: -1 });
recommendationSchema.index({ symbol: 1, timeHorizon: 1, isActive: 1 });
recommendationSchema.index({ action: 1, riskLevel: 1 });

// Virtual for recommendation age
recommendationSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for time until expiry
recommendationSchema.virtual('hoursUntilExpiry').get(function() {
  return Math.floor((this.validUntil - Date.now()) / (1000 * 60 * 60));
});

// Virtual for risk-adjusted confidence
recommendationSchema.virtual('riskAdjustedConfidence').get(function() {
  const riskMultiplier = {
    'low': 1.0,
    'medium': 0.9,
    'high': 0.8,
    'very_high': 0.7
  };
  return Math.round(this.confidenceScore * riskMultiplier[this.riskLevel]);
});

// Pre-save middleware to set validUntil based on timeHorizon
recommendationSchema.pre('save', function(next) {
  if (this.isNew && !this.validUntil) {
    const now = new Date();
    switch (this.timeHorizon) {
      case 'daily':
        this.validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'weekly':
        this.validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'monthly':
        this.validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'yearly':
        this.validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        break;
    }
  }
  next();
});

// Instance method to check if recommendation is expired
recommendationSchema.methods.isExpired = function() {
  return Date.now() > this.validUntil;
};

// Instance method to update performance
recommendationSchema.methods.updatePerformance = function(currentPrice) {
  const actualReturn = ((currentPrice - this.entryPrice) / this.entryPrice) * 100;
  this.performance.actualReturn = actualReturn;
  
  if (this.action.includes('buy') && currentPrice >= this.targetPrice) {
    this.performance.hitTargetPrice = true;
  }
  
  if (this.stopLoss && currentPrice <= this.stopLoss) {
    this.performance.hitStopLoss = true;
  }
  
  return this.save();
};

// Static method to find active recommendations
recommendationSchema.statics.findActive = function(timeHorizon = null) {
  const query = { 
    isActive: true, 
    validUntil: { $gt: new Date() } 
  };
  
  if (timeHorizon) {
    query.timeHorizon = timeHorizon;
  }
  
  return this.find(query).sort({ confidenceScore: -1 });
};

// Static method to find top recommendations
recommendationSchema.statics.findTopRecommendations = function(timeHorizon, limit = 10) {
  return this.find({
    timeHorizon,
    isActive: true,
    validUntil: { $gt: new Date() },
    action: { $in: ['strong_buy', 'buy'] }
  })
  .sort({ confidenceScore: -1 })
  .limit(limit)
  .populate('symbol', 'name sector currentPrice priceChangePercent');
};

// Static method to find by risk level
recommendationSchema.statics.findByRiskLevel = function(riskLevel, timeHorizon = null) {
  const query = {
    riskLevel,
    isActive: true,
    validUntil: { $gt: new Date() }
  };
  
  if (timeHorizon) {
    query.timeHorizon = timeHorizon;
  }
  
  return this.find(query).sort({ confidenceScore: -1 });
};

module.exports = mongoose.model('Recommendation', recommendationSchema);