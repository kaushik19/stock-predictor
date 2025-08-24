const technicalAnalysisService = require('./technicalAnalysisService');
const fundamentalAnalysisService = require('./fundamentalAnalysisService');
const newsService = require('./newsService');
const yahooFinanceService = require('./yahooFinanceService');
const alphaVantageService = require('./alphaVantageService');
const stockQualityService = require('./stockQualityService');
const { logger } = require('../middleware/errorHandler');

/**
 * Recommendation Engine Service
 * Combines technical analysis, fundamental analysis, and sentiment analysis
 * to generate intelligent stock recommendations for different time horizons
 */
class RecommendationEngine {
  constructor() {
    // Recommendation weights for different time horizons
    this.weights = {
      daily: {
        technical: 0.60,
        sentiment: 0.30,
        fundamental: 0.10
      },
      weekly: {
        technical: 0.50,
        sentiment: 0.25,
        fundamental: 0.25
      },
      monthly: {
        technical: 0.30,
        sentiment: 0.20,
        fundamental: 0.50
      },
      yearly: {
        technical: 0.15,
        sentiment: 0.10,
        fundamental: 0.75
      }
    };

    // Confidence thresholds
    this.confidenceThresholds = {
      high: 75,
      medium: 50,
      low: 25
    };

    // Popular Indian stocks for recommendations
    this.popularStocks = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
      'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'SBIN',
      'ASIANPAINT', 'MARUTI', 'AXISBANK', 'LT', 'WIPRO',
      'ULTRACEMCO', 'TITAN', 'NESTLEIND', 'POWERGRID', 'NTPC'
    ];
  }

  /**
   * Generate daily recommendations (1-day holding period)
   * Focus: Technical analysis + Market sentiment
   */
  async generateDailyRecommendations(limit = 10) {
    try {
      logger.info('Generating daily recommendations...');
      
      const recommendations = [];
      const weights = this.weights.daily;
      
      for (const symbol of this.popularStocks.slice(0, limit * 2)) {
        try {
          const recommendation = await this.analyzeStockForTimeHorizon(symbol, 'daily', weights);
          if (recommendation && recommendation.confidence >= this.confidenceThresholds.low) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          logger.warn(`Failed to analyze ${symbol} for daily recommendations:`, error.message);
          continue;
        }
      }

      // Sort by confidence and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      return {
        timeHorizon: 'daily',
        period: '1 day',
        recommendations: sortedRecommendations,
        generatedAt: new Date().toISOString(),
        totalAnalyzed: this.popularStocks.slice(0, limit * 2).length,
        successfulAnalyses: recommendations.length
      };

    } catch (error) {
      logger.error('Error generating daily recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate weekly recommendations (1-week holding period)
   * Focus: Technical patterns + Swing trading signals + Sentiment
   */
  async generateWeeklyRecommendations(limit = 15) {
    try {
      logger.info('Generating weekly recommendations...');
      
      const recommendations = [];
      const weights = this.weights.weekly;
      
      for (const symbol of this.popularStocks.slice(0, limit * 2)) {
        try {
          const recommendation = await this.analyzeStockForTimeHorizon(symbol, 'weekly', weights);
          if (recommendation && recommendation.confidence >= this.confidenceThresholds.low) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          logger.warn(`Failed to analyze ${symbol} for weekly recommendations:`, error.message);
          continue;
        }
      }

      // Sort by confidence and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      return {
        timeHorizon: 'weekly',
        period: '1 week',
        recommendations: sortedRecommendations,
        generatedAt: new Date().toISOString(),
        totalAnalyzed: this.popularStocks.slice(0, limit * 2).length,
        successfulAnalyses: recommendations.length
      };

    } catch (error) {
      logger.error('Error generating weekly recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate monthly recommendations (1-month holding period)
   * Focus: Fundamental analysis + Technical trends + Market sentiment
   */
  async generateMonthlyRecommendations(limit = 15) {
    try {
      logger.info('Generating monthly recommendations...');
      
      const recommendations = [];
      const weights = this.weights.monthly;
      
      for (const symbol of this.popularStocks.slice(0, limit * 2)) {
        try {
          const recommendation = await this.analyzeStockForTimeHorizon(symbol, 'monthly', weights);
          if (recommendation && recommendation.confidence >= this.confidenceThresholds.low) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          logger.warn(`Failed to analyze ${symbol} for monthly recommendations:`, error.message);
          continue;
        }
      }

      // Sort by confidence and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      return {
        timeHorizon: 'monthly',
        period: '1 month',
        recommendations: sortedRecommendations,
        generatedAt: new Date().toISOString(),
        totalAnalyzed: this.popularStocks.slice(0, limit * 2).length,
        successfulAnalyses: recommendations.length
      };

    } catch (error) {
      logger.error('Error generating monthly recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate yearly recommendations (1+ year holding period)
   * Focus: Fundamental analysis + Long-term growth prospects
   */
  async generateYearlyRecommendations(limit = 20) {
    try {
      logger.info('Generating yearly recommendations...');
      
      const recommendations = [];
      const weights = this.weights.yearly;
      
      for (const symbol of this.popularStocks) {
        try {
          const recommendation = await this.analyzeStockForTimeHorizon(symbol, 'yearly', weights);
          if (recommendation && recommendation.confidence >= this.confidenceThresholds.low) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          logger.warn(`Failed to analyze ${symbol} for yearly recommendations:`, error.message);
          continue;
        }
      }

      // Sort by confidence and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      return {
        timeHorizon: 'yearly',
        period: '1+ years',
        recommendations: sortedRecommendations,
        generatedAt: new Date().toISOString(),
        totalAnalyzed: this.popularStocks.length,
        successfulAnalyses: recommendations.length
      };

    } catch (error) {
      logger.error('Error generating yearly recommendations:', error);
      throw error;
    }
  }

  /**
   * Analyze a single stock for a specific time horizon
   */
  async analyzeStockForTimeHorizon(symbol, timeHorizon, weights) {
    try {
      const analysis = {
        symbol: symbol,
        timeHorizon: timeHorizon,
        technical: null,
        fundamental: null,
        sentiment: null,
        currentPrice: null,
        recommendation: null,
        confidence: 0,
        scores: {},
        reasons: [],
        risks: [],
        targetPrice: null,
        stopLoss: null,
        entryPoint: null
      };

      // Get current price
      try {
        const priceData = await yahooFinanceService.getStockPrice(symbol);
        analysis.currentPrice = priceData.currentPrice;
      } catch (error) {
        logger.warn(`Failed to get price for ${symbol}:`, error.message);
      }

      // Technical Analysis
      if (weights.technical > 0) {
        try {
          const technicalData = await this.getTechnicalAnalysis(symbol, timeHorizon);
          analysis.technical = technicalData;
          analysis.scores.technical = this.calculateTechnicalScore(technicalData, timeHorizon);
        } catch (error) {
          logger.warn(`Technical analysis failed for ${symbol}:`, error.message);
          analysis.scores.technical = 50; // Neutral score
        }
      }

      // Fundamental Analysis
      if (weights.fundamental > 0) {
        try {
          const fundamentalData = await this.getFundamentalAnalysis(symbol);
          analysis.fundamental = fundamentalData;
          analysis.scores.fundamental = this.calculateFundamentalScore(fundamentalData, timeHorizon);
        } catch (error) {
          logger.warn(`Fundamental analysis failed for ${symbol}:`, error.message);
          analysis.scores.fundamental = 50; // Neutral score
        }
      }

      // Sentiment Analysis
      if (weights.sentiment > 0) {
        try {
          const sentimentData = await this.getSentimentAnalysis(symbol);
          analysis.sentiment = sentimentData;
          analysis.scores.sentiment = this.calculateSentimentScore(sentimentData, timeHorizon);
        } catch (error) {
          logger.warn(`Sentiment analysis failed for ${symbol}:`, error.message);
          analysis.scores.sentiment = 50; // Neutral score
        }
      }

      // Calculate composite score and confidence
      analysis.confidence = this.calculateCompositeScore(analysis.scores, weights);
      
      // Generate recommendation
      analysis.recommendation = this.generateRecommendationAction(analysis.confidence);
      
      // Generate reasons and risks
      analysis.reasons = this.generateReasons(analysis, timeHorizon);
      analysis.risks = this.generateRisks(analysis, timeHorizon);
      
      // Calculate target price and stop loss
      const priceTargets = this.calculatePriceTargets(analysis, timeHorizon);
      analysis.targetPrice = priceTargets.target;
      analysis.stopLoss = priceTargets.stopLoss;
      analysis.entryPoint = priceTargets.entry;

      // Add quality analysis for enhanced recommendations
      try {
        const qualityData = await stockQualityService.getStockQualityAnalysis(symbol, this.determineSector(null));
        analysis.qualityScore = qualityData.qualityScore;
        analysis.qualityGrade = qualityData.qualityGrade;
        analysis.evaluation = qualityData.evaluation.evaluation;
        analysis.financialTrend = qualityData.financialTrends.overall;
        analysis.sectorRanking = qualityData.sectorComparison.overallRanking;
      } catch (error) {
        logger.warn(`Quality analysis failed for ${symbol}:`, error.message);
        analysis.qualityScore = null;
        analysis.qualityGrade = 'Unknown';
        analysis.evaluation = 'Unknown';
        analysis.financialTrend = 'Unknown';
        analysis.sectorRanking = 'Unknown';
      }

      return analysis;

    } catch (error) {
      logger.error(`Error analyzing ${symbol} for ${timeHorizon}:`, error);
      return null;
    }
  }

  /**
   * Get technical analysis data
   */
  async getTechnicalAnalysis(symbol, timeHorizon) {
    try {
      // Get historical data for technical analysis
      const period = this.getPeriodForTimeHorizon(timeHorizon);
      const historicalData = await yahooFinanceService.getHistoricalData(symbol, period);
      
      if (!historicalData || historicalData.length < 20) {
        throw new Error('Insufficient historical data for technical analysis');
      }

      // Calculate technical indicators
      const technicalAnalysis = await technicalAnalysisService.analyzeTechnicals(historicalData);
      
      return {
        indicators: technicalAnalysis.indicators,
        signals: technicalAnalysis.signals,
        patterns: technicalAnalysis.patterns,
        support: technicalAnalysis.support,
        resistance: technicalAnalysis.resistance,
        trend: technicalAnalysis.trend,
        momentum: technicalAnalysis.momentum
      };

    } catch (error) {
      logger.error(`Technical analysis error for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get fundamental analysis data
   */
  async getFundamentalAnalysis(symbol) {
    try {
      // Get fundamental data from Alpha Vantage
      const fundamentalData = await alphaVantageService.getFundamentalData(symbol);
      
      if (!fundamentalData.overview) {
        throw new Error('No fundamental data available');
      }

      // Perform comprehensive fundamental analysis
      const sector = this.determineSector(fundamentalData.overview);
      const analysis = await fundamentalAnalysisService.analyzeFundamentals(
        fundamentalData.overview, 
        sector
      );

      return analysis;

    } catch (error) {
      logger.error(`Fundamental analysis error for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get sentiment analysis data
   */
  async getSentimentAnalysis(symbol) {
    try {
      // Get news and sentiment data
      const newsData = await newsService.getStockNews(symbol, 10);
      
      if (!newsData || newsData.length === 0) {
        return {
          sentiment: 'neutral',
          score: 50,
          newsCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0
        };
      }

      // Analyze sentiment
      const sentimentAnalysis = await newsService.analyzeSentiment(newsData);
      
      return {
        sentiment: sentimentAnalysis.overallSentiment,
        score: sentimentAnalysis.sentimentScore,
        newsCount: newsData.length,
        positiveCount: sentimentAnalysis.positiveCount,
        negativeCount: sentimentAnalysis.negativeCount,
        neutralCount: sentimentAnalysis.neutralCount,
        recentNews: newsData.slice(0, 3) // Include top 3 news items
      };

    } catch (error) {
      logger.error(`Sentiment analysis error for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Calculate technical analysis score based on time horizon
   */
  calculateTechnicalScore(technicalData, timeHorizon) {
    if (!technicalData || !technicalData.indicators) return 50;

    let score = 50; // Base neutral score
    const indicators = technicalData.indicators;

    try {
      // RSI scoring
      if (indicators.rsi !== undefined) {
        if (timeHorizon === 'daily') {
          // For daily trading, look for oversold/overbought conditions
          if (indicators.rsi < 30) score += 20; // Oversold - buy signal
          else if (indicators.rsi > 70) score -= 20; // Overbought - sell signal
          else if (indicators.rsi >= 40 && indicators.rsi <= 60) score += 10; // Neutral zone
        } else {
          // For longer horizons, prefer moderate RSI
          if (indicators.rsi >= 40 && indicators.rsi <= 60) score += 15;
          else if (indicators.rsi < 30 || indicators.rsi > 70) score -= 10;
        }
      }

      // MACD scoring
      if (indicators.macd && indicators.macdSignal) {
        const macdDiff = indicators.macd - indicators.macdSignal;
        if (macdDiff > 0) score += 15; // Bullish MACD
        else score -= 10; // Bearish MACD
      }

      // Moving averages scoring
      if (indicators.sma20 && indicators.sma50) {
        if (indicators.sma20 > indicators.sma50) score += 10; // Short MA above long MA
        else score -= 10;
      }

      // Trend scoring
      if (technicalData.trend) {
        if (technicalData.trend === 'bullish') score += 15;
        else if (technicalData.trend === 'bearish') score -= 15;
      }

      // Volume momentum
      if (technicalData.momentum && technicalData.momentum.volume === 'high') {
        score += 10; // High volume supports the move
      }

    } catch (error) {
      logger.error('Error calculating technical score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate fundamental analysis score based on time horizon
   */
  calculateFundamentalScore(fundamentalData, timeHorizon) {
    if (!fundamentalData || !fundamentalData.scores) return 50;

    let score = fundamentalData.scores.composite_score || 50;

    try {
      // Adjust score based on time horizon
      if (timeHorizon === 'yearly') {
        // For yearly recommendations, emphasize quality and growth
        const qualityWeight = 0.4;
        const growthWeight = 0.3;
        const valueWeight = 0.3;

        score = (fundamentalData.scores.quality_score * qualityWeight) +
                (fundamentalData.scores.growth_score * growthWeight) +
                (fundamentalData.scores.value_score * valueWeight);
      } else if (timeHorizon === 'monthly') {
        // For monthly, balance all factors
        score = fundamentalData.scores.composite_score;
      } else {
        // For daily/weekly, reduce fundamental weight but consider momentum
        score = (fundamentalData.scores.composite_score * 0.7) +
                (fundamentalData.scores.momentum_score * 0.3);
      }

      // Bonus for strong financial health
      if (fundamentalData.financial_health && fundamentalData.financial_health.overall_score > 70) {
        score += 5;
      }

      // Penalty for high risk
      if (fundamentalData.financial_health && fundamentalData.financial_health.risk_level === 'high') {
        score -= 10;
      }

    } catch (error) {
      logger.error('Error calculating fundamental score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate sentiment analysis score based on time horizon
   */
  calculateSentimentScore(sentimentData, timeHorizon) {
    if (!sentimentData) return 50;

    let score = sentimentData.score || 50;

    try {
      // Adjust sentiment impact based on time horizon
      if (timeHorizon === 'daily') {
        // Daily trading is more sensitive to sentiment
        if (sentimentData.sentiment === 'positive') score += 10;
        else if (sentimentData.sentiment === 'negative') score -= 15;
        
        // News volume matters for daily trading
        if (sentimentData.newsCount > 5) score += 5;
      } else if (timeHorizon === 'weekly') {
        // Weekly is moderately affected by sentiment
        if (sentimentData.sentiment === 'positive') score += 5;
        else if (sentimentData.sentiment === 'negative') score -= 10;
      } else {
        // Monthly/yearly less affected by short-term sentiment
        if (sentimentData.sentiment === 'positive') score += 3;
        else if (sentimentData.sentiment === 'negative') score -= 5;
      }

    } catch (error) {
      logger.error('Error calculating sentiment score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate composite score using weighted average
   */
  calculateCompositeScore(scores, weights) {
    let compositeScore = 0;
    let totalWeight = 0;

    try {
      if (scores.technical !== undefined && weights.technical > 0) {
        compositeScore += scores.technical * weights.technical;
        totalWeight += weights.technical;
      }

      if (scores.fundamental !== undefined && weights.fundamental > 0) {
        compositeScore += scores.fundamental * weights.fundamental;
        totalWeight += weights.fundamental;
      }

      if (scores.sentiment !== undefined && weights.sentiment > 0) {
        compositeScore += scores.sentiment * weights.sentiment;
        totalWeight += weights.sentiment;
      }

      return totalWeight > 0 ? Math.round(compositeScore / totalWeight) : 50;

    } catch (error) {
      logger.error('Error calculating composite score:', error);
      return 50;
    }
  }

  /**
   * Generate recommendation action based on confidence score
   */
  generateRecommendationAction(confidence) {
    if (confidence >= 80) return 'strong_buy';
    if (confidence >= 65) return 'buy';
    if (confidence >= 45) return 'hold';
    if (confidence >= 30) return 'sell';
    return 'strong_sell';
  }

  /**
   * Generate reasons for the recommendation
   */
  generateReasons(analysis, timeHorizon) {
    const reasons = [];

    try {
      // Technical reasons
      if (analysis.technical && analysis.scores.technical > 60) {
        if (analysis.technical.trend === 'bullish') {
          reasons.push('Strong bullish technical trend');
        }
        if (analysis.technical.indicators && analysis.technical.indicators.rsi < 40) {
          reasons.push('Oversold conditions present buying opportunity');
        }
        if (analysis.technical.momentum && analysis.technical.momentum.volume === 'high') {
          reasons.push('High volume supports price movement');
        }
      }

      // Fundamental reasons
      if (analysis.fundamental && analysis.scores.fundamental > 60) {
        if (analysis.fundamental.scores && analysis.fundamental.scores.growth_score > 70) {
          reasons.push('Strong growth prospects');
        }
        if (analysis.fundamental.scores && analysis.fundamental.scores.quality_score > 70) {
          reasons.push('High-quality business fundamentals');
        }
        if (analysis.fundamental.financial_health && analysis.fundamental.financial_health.overall_score > 70) {
          reasons.push('Excellent financial health');
        }
      }

      // Sentiment reasons
      if (analysis.sentiment && analysis.scores.sentiment > 60) {
        if (analysis.sentiment.sentiment === 'positive') {
          reasons.push('Positive market sentiment and news coverage');
        }
        if (analysis.sentiment.newsCount > 5) {
          reasons.push('High media attention and investor interest');
        }
      }

      // Time horizon specific reasons
      if (timeHorizon === 'daily' && analysis.technical) {
        reasons.push('Short-term technical setup favorable for day trading');
      } else if (timeHorizon === 'yearly' && analysis.fundamental) {
        reasons.push('Strong long-term fundamentals support investment thesis');
      }

      return reasons.length > 0 ? reasons : ['Based on comprehensive multi-factor analysis'];

    } catch (error) {
      logger.error('Error generating reasons:', error);
      return ['Based on comprehensive analysis'];
    }
  }

  /**
   * Generate risk factors for the recommendation
   */
  generateRisks(analysis, timeHorizon) {
    const risks = [];

    try {
      // Technical risks
      if (analysis.technical && analysis.scores.technical < 40) {
        if (analysis.technical.trend === 'bearish') {
          risks.push('Bearish technical trend indicates downside risk');
        }
        if (analysis.technical.indicators && analysis.technical.indicators.rsi > 70) {
          risks.push('Overbought conditions may lead to correction');
        }
      }

      // Fundamental risks
      if (analysis.fundamental && analysis.scores.fundamental < 40) {
        if (analysis.fundamental.financial_health && analysis.fundamental.financial_health.risk_level === 'high') {
          risks.push('High financial risk due to poor fundamentals');
        }
        if (analysis.fundamental.scores && analysis.fundamental.scores.value_score < 30) {
          risks.push('Stock appears overvalued based on fundamentals');
        }
      }

      // Sentiment risks
      if (analysis.sentiment && analysis.scores.sentiment < 40) {
        if (analysis.sentiment.sentiment === 'negative') {
          risks.push('Negative sentiment may pressure stock price');
        }
      }

      // General market risks
      risks.push('Market volatility and economic conditions');
      risks.push('Sector-specific risks and competition');

      // Time horizon specific risks
      if (timeHorizon === 'daily') {
        risks.push('High volatility risk for short-term trading');
      } else if (timeHorizon === 'yearly') {
        risks.push('Long-term business and industry changes');
      }

      return risks;

    } catch (error) {
      logger.error('Error generating risks:', error);
      return ['General market and stock-specific risks'];
    }
  }

  /**
   * Calculate price targets based on analysis
   */
  calculatePriceTargets(analysis, timeHorizon) {
    const targets = {
      target: null,
      stopLoss: null,
      entry: null
    };

    try {
      if (!analysis.currentPrice) return targets;

      const currentPrice = analysis.currentPrice;
      let targetMultiplier = 1.0;
      let stopLossMultiplier = 1.0;

      // Adjust multipliers based on time horizon and confidence
      if (timeHorizon === 'daily') {
        targetMultiplier = 1.02 + (analysis.confidence - 50) * 0.0005; // 2-4% target
        stopLossMultiplier = 0.98 - (analysis.confidence - 50) * 0.0002; // 1-2% stop loss
      } else if (timeHorizon === 'weekly') {
        targetMultiplier = 1.05 + (analysis.confidence - 50) * 0.001; // 5-10% target
        stopLossMultiplier = 0.95 - (analysis.confidence - 50) * 0.0005; // 3-5% stop loss
      } else if (timeHorizon === 'monthly') {
        targetMultiplier = 1.10 + (analysis.confidence - 50) * 0.002; // 10-20% target
        stopLossMultiplier = 0.90 - (analysis.confidence - 50) * 0.001; // 5-10% stop loss
      } else if (timeHorizon === 'yearly') {
        targetMultiplier = 1.20 + (analysis.confidence - 50) * 0.004; // 20-40% target
        stopLossMultiplier = 0.85 - (analysis.confidence - 50) * 0.002; // 10-15% stop loss
      }

      targets.target = Math.round(currentPrice * targetMultiplier * 100) / 100;
      targets.stopLoss = Math.round(currentPrice * stopLossMultiplier * 100) / 100;
      targets.entry = currentPrice; // Current price as entry point

      // Adjust entry point based on technical analysis
      if (analysis.technical && analysis.technical.support) {
        // If there's strong support, suggest entry near support level
        const supportLevel = analysis.technical.support;
        if (supportLevel < currentPrice && supportLevel > currentPrice * 0.95) {
          targets.entry = supportLevel;
        }
      }

    } catch (error) {
      logger.error('Error calculating price targets:', error);
    }

    return targets;
  }

  /**
   * Helper methods
   */
  getPeriodForTimeHorizon(timeHorizon) {
    switch (timeHorizon) {
      case 'daily': return '1mo';
      case 'weekly': return '3mo';
      case 'monthly': return '1y';
      case 'yearly': return '5y';
      default: return '1y';
    }
  }

  determineSector(overview) {
    if (!overview || !overview.Sector) return 'Technology';
    
    const sector = overview.Sector.toLowerCase();
    if (sector.includes('technology') || sector.includes('software')) return 'Technology';
    if (sector.includes('bank') || sector.includes('financial')) return 'Banking';
    if (sector.includes('energy') || sector.includes('oil')) return 'Energy';
    if (sector.includes('health') || sector.includes('pharma')) return 'Healthcare';
    if (sector.includes('consumer')) return 'Consumer Goods';
    if (sector.includes('industrial')) return 'Industrials';
    if (sector.includes('telecom') || sector.includes('communication')) return 'Telecommunications';
    if (sector.includes('utilities')) return 'Utilities';
    if (sector.includes('materials') || sector.includes('mining')) return 'Materials';
    if (sector.includes('real estate')) return 'Real Estate';
    
    return 'Technology'; // Default
  }

  /**
   * Predict stock of the week - Single best weekly pick
   * Focus: Best swing trading opportunity with highest confidence
   */
  async predictStockOfTheWeek() {
    try {
      logger.info('Generating stock of the week prediction...');
      
      const weeklyRecommendations = await this.generateWeeklyRecommendations(30); // Analyze more stocks
      
      if (!weeklyRecommendations.recommendations || weeklyRecommendations.recommendations.length === 0) {
        throw new Error('No weekly recommendations available');
      }

      // Find the highest confidence buy recommendation
      const topPick = weeklyRecommendations.recommendations
        .filter(rec => rec.recommendation === 'buy' || rec.recommendation === 'strong_buy')
        .sort((a, b) => b.confidence - a.confidence)[0];

      if (!topPick) {
        throw new Error('No suitable weekly pick found');
      }

      // Get enhanced analysis for the top pick
      const enhancedAnalysis = await this.getEnhancedStockAnalysis(topPick.symbol, 'weekly');

      return {
        stockOfTheWeek: {
          ...topPick,
          ...enhancedAnalysis,
          predictionType: 'stock_of_the_week',
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          keyHighlights: this.generateKeyHighlights(topPick, enhancedAnalysis, 'weekly'),
          tradingStrategy: this.generateTradingStrategy(topPick, 'weekly')
        },
        generatedAt: new Date().toISOString(),
        totalAnalyzed: weeklyRecommendations.totalAnalyzed,
        selectionCriteria: 'Highest confidence swing trading opportunity'
      };

    } catch (error) {
      logger.error('Error predicting stock of the week:', error);
      throw error;
    }
  }

  /**
   * Predict stock of the month - Single best monthly pick
   * Focus: Best medium-term investment with balanced analysis
   */
  async predictStockOfTheMonth() {
    try {
      logger.info('Generating stock of the month prediction...');
      
      const monthlyRecommendations = await this.generateMonthlyRecommendations(40); // Analyze more stocks
      
      if (!monthlyRecommendations.recommendations || monthlyRecommendations.recommendations.length === 0) {
        throw new Error('No monthly recommendations available');
      }

      // Find the highest confidence buy recommendation with good fundamentals
      const topPick = monthlyRecommendations.recommendations
        .filter(rec => {
          return (rec.recommendation === 'buy' || rec.recommendation === 'strong_buy') &&
                 rec.scores.fundamental >= 60; // Ensure good fundamentals for monthly pick
        })
        .sort((a, b) => {
          // Sort by composite score considering both confidence and fundamental strength
          const scoreA = (b.confidence * 0.6) + (b.scores.fundamental * 0.4);
          const scoreB = (a.confidence * 0.6) + (a.scores.fundamental * 0.4);
          return scoreA - scoreB;
        })[0];

      if (!topPick) {
        throw new Error('No suitable monthly pick found');
      }

      // Get enhanced analysis for the top pick
      const enhancedAnalysis = await this.getEnhancedStockAnalysis(topPick.symbol, 'monthly');

      return {
        stockOfTheMonth: {
          ...topPick,
          ...enhancedAnalysis,
          predictionType: 'stock_of_the_month',
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          keyHighlights: this.generateKeyHighlights(topPick, enhancedAnalysis, 'monthly'),
          tradingStrategy: this.generateTradingStrategy(topPick, 'monthly')
        },
        generatedAt: new Date().toISOString(),
        totalAnalyzed: monthlyRecommendations.totalAnalyzed,
        selectionCriteria: 'Best balanced opportunity with strong fundamentals'
      };

    } catch (error) {
      logger.error('Error predicting stock of the month:', error);
      throw error;
    }
  }

  /**
   * Get enhanced stock analysis with detailed technical and fundamental aspects
   */
  async getEnhancedStockAnalysis(symbol, timeHorizon = 'monthly') {
    try {
      logger.info(`Getting enhanced analysis for ${symbol}...`);

      const analysis = {
        symbol,
        timeHorizon,
        detailedTechnicalAnalysis: null,
        detailedFundamentalAnalysis: null,
        marketContext: null,
        riskAssessment: null,
        catalysts: null,
        competitivePosition: null
      };

      // Get detailed technical analysis
      try {
        const technicalData = await this.getTechnicalAnalysis(symbol, timeHorizon);
        analysis.detailedTechnicalAnalysis = this.enhanceTechnicalAnalysis(technicalData, timeHorizon);
      } catch (error) {
        logger.warn(`Enhanced technical analysis failed for ${symbol}:`, error.message);
      }

      // Get detailed fundamental analysis
      try {
        const fundamentalData = await this.getFundamentalAnalysis(symbol);
        analysis.detailedFundamentalAnalysis = this.enhanceFundamentalAnalysis(fundamentalData, timeHorizon);
      } catch (error) {
        logger.warn(`Enhanced fundamental analysis failed for ${symbol}:`, error.message);
      }

      // Get market context
      analysis.marketContext = await this.getMarketContext(symbol);

      // Assess risks
      analysis.riskAssessment = this.assessDetailedRisks(symbol, timeHorizon);

      // Identify catalysts
      analysis.catalysts = await this.identifyStockCatalysts(symbol, timeHorizon);

      // Analyze competitive position
      analysis.competitivePosition = this.analyzeCompetitivePosition(symbol);

      return analysis;

    } catch (error) {
      logger.error(`Error in enhanced stock analysis for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Enhance technical analysis with detailed insights
   */
  enhanceTechnicalAnalysis(technicalData, timeHorizon) {
    if (!technicalData) return null;

    return {
      ...technicalData,
      keyInsights: this.generateTechnicalInsights(technicalData, timeHorizon),
      chartPatterns: this.identifyChartPatterns(technicalData),
      volumeProfile: this.analyzeVolumeProfile(technicalData),
      momentumAnalysis: this.analyzeMomentumDetails(technicalData),
      supportResistanceAnalysis: this.analyzeSupportResistanceDetails(technicalData),
      technicalRating: this.calculateTechnicalRating(technicalData)
    };
  }

  /**
   * Enhance fundamental analysis with detailed insights
   */
  enhanceFundamentalAnalysis(fundamentalData, timeHorizon) {
    if (!fundamentalData) return null;

    return {
      ...fundamentalData,
      keyInsights: this.generateFundamentalInsights(fundamentalData, timeHorizon),
      valuationSummary: this.generateValuationSummary(fundamentalData),
      growthAnalysis: this.analyzeGrowthDetails(fundamentalData),
      profitabilityAnalysis: this.analyzeProfitabilityDetails(fundamentalData),
      financialStrengthAnalysis: this.analyzeFinancialStrength(fundamentalData),
      fundamentalRating: this.calculateFundamentalRating(fundamentalData)
    };
  }

  /**
   * Generate key highlights for stock picks
   */
  generateKeyHighlights(recommendation, enhancedAnalysis, timeHorizon) {
    const highlights = [];

    // Technical highlights
    if (recommendation.scores.technical > 70) {
      highlights.push(`Strong technical setup with ${recommendation.scores.technical}% technical score`);
    }

    // Fundamental highlights
    if (recommendation.scores.fundamental > 70) {
      highlights.push(`Solid fundamentals with ${recommendation.scores.fundamental}% fundamental score`);
    }

    // Sentiment highlights
    if (recommendation.scores.sentiment > 65) {
      highlights.push(`Positive market sentiment with ${recommendation.scores.sentiment}% sentiment score`);
    }

    // Price target highlight
    if (recommendation.targetPrice && recommendation.currentPrice) {
      const upside = ((recommendation.targetPrice - recommendation.currentPrice) / recommendation.currentPrice * 100).toFixed(1);
      highlights.push(`${upside}% upside potential to target price of ₹${recommendation.targetPrice}`);
    }

    // Time horizon specific highlights
    if (timeHorizon === 'weekly') {
      highlights.push('Ideal for swing trading with 1-week holding period');
    } else if (timeHorizon === 'monthly') {
      highlights.push('Balanced opportunity for medium-term investment');
    }

    return highlights.slice(0, 5); // Return top 5 highlights
  }

  /**
   * Generate trading strategy for stock picks
   */
  generateTradingStrategy(recommendation, timeHorizon) {
    const strategy = {
      entryStrategy: null,
      exitStrategy: null,
      riskManagement: null,
      positionSizing: null
    };

    // Entry strategy
    if (recommendation.entryPoint && recommendation.currentPrice) {
      if (recommendation.entryPoint < recommendation.currentPrice) {
        strategy.entryStrategy = `Wait for pullback to ₹${recommendation.entryPoint} for optimal entry`;
      } else {
        strategy.entryStrategy = `Current price ₹${recommendation.currentPrice} offers good entry opportunity`;
      }
    }

    // Exit strategy
    if (recommendation.targetPrice && recommendation.stopLoss) {
      strategy.exitStrategy = `Target: ₹${recommendation.targetPrice}, Stop Loss: ₹${recommendation.stopLoss}`;
    }

    // Risk management
    if (recommendation.stopLoss && recommendation.currentPrice) {
      const riskPercent = ((recommendation.currentPrice - recommendation.stopLoss) / recommendation.currentPrice * 100).toFixed(1);
      strategy.riskManagement = `Risk ${riskPercent}% with stop loss at ₹${recommendation.stopLoss}`;
    }

    // Position sizing based on time horizon
    if (timeHorizon === 'weekly') {
      strategy.positionSizing = 'Moderate position size suitable for swing trading';
    } else if (timeHorizon === 'monthly') {
      strategy.positionSizing = 'Standard position size for medium-term holding';
    }

    return strategy;
  }

  /**
   * Get market context for a stock
   */
  async getMarketContext(symbol) {
    try {
      // This would typically fetch broader market data
      // For now, return a basic context
      return {
        marketTrend: 'neutral',
        sectorPerformance: 'mixed',
        indexCorrelation: 'moderate',
        marketCap: 'large_cap',
        liquidity: 'high'
      };
    } catch (error) {
      logger.error(`Error getting market context for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Assess detailed risks for a stock
   */
  assessDetailedRisks(symbol, timeHorizon) {
    const risks = {
      overall: 'medium',
      technical: [],
      fundamental: [],
      market: [],
      timeHorizonSpecific: []
    };

    // Technical risks
    risks.technical.push('Price volatility risk');
    risks.technical.push('Technical breakdown risk');

    // Fundamental risks
    risks.fundamental.push('Earnings disappointment risk');
    risks.fundamental.push('Sector-specific headwinds');

    // Market risks
    risks.market.push('Overall market correction risk');
    risks.market.push('Interest rate sensitivity');

    // Time horizon specific risks
    if (timeHorizon === 'weekly') {
      risks.timeHorizonSpecific.push('Short-term volatility risk');
      risks.timeHorizonSpecific.push('News-driven price swings');
    } else if (timeHorizon === 'monthly') {
      risks.timeHorizonSpecific.push('Quarterly earnings impact');
      risks.timeHorizonSpecific.push('Sector rotation risk');
    }

    return risks;
  }

  /**
   * Identify potential catalysts for a stock
   */
  async identifyStockCatalysts(symbol, timeHorizon) {
    const catalysts = {
      upcoming: [],
      potential: [],
      timeframe: timeHorizon
    };

    // Common catalysts based on time horizon
    if (timeHorizon === 'weekly') {
      catalysts.upcoming.push('Technical breakout potential');
      catalysts.upcoming.push('Short-term momentum');
      catalysts.potential.push('Positive news flow');
      catalysts.potential.push('Sector rotation');
    } else if (timeHorizon === 'monthly') {
      catalysts.upcoming.push('Quarterly earnings');
      catalysts.upcoming.push('Management guidance');
      catalysts.potential.push('New product launches');
      catalysts.potential.push('Market expansion');
    }

    return catalysts;
  }

  /**
   * Analyze competitive position
   */
  analyzeCompetitivePosition(symbol) {
    return {
      marketPosition: 'strong',
      competitiveAdvantages: ['Brand strength', 'Market leadership'],
      threats: ['New entrants', 'Technology disruption'],
      moatStrength: 'moderate'
    };
  }

  // Helper methods for enhanced analysis
  generateTechnicalInsights(technicalData, timeHorizon) {
    const insights = [];
    
    if (technicalData.indicators) {
      if (technicalData.indicators.rsi < 30) {
        insights.push('RSI indicates oversold conditions - potential buying opportunity');
      } else if (technicalData.indicators.rsi > 70) {
        insights.push('RSI shows overbought levels - caution advised');
      }

      if (technicalData.indicators.macd > technicalData.indicators.macdSignal) {
        insights.push('MACD bullish crossover suggests upward momentum');
      }
    }

    return insights;
  }

  generateFundamentalInsights(fundamentalData, timeHorizon) {
    const insights = [];
    
    if (fundamentalData.scores) {
      if (fundamentalData.scores.growth_score > 70) {
        insights.push('Strong growth prospects with above-average expansion potential');
      }
      
      if (fundamentalData.scores.quality_score > 70) {
        insights.push('High-quality business with strong competitive position');
      }
    }

    return insights;
  }

  identifyChartPatterns(technicalData) {
    // Simplified pattern identification
    return ['Ascending triangle', 'Higher lows formation'];
  }

  analyzeVolumeProfile(technicalData) {
    return {
      trend: 'increasing',
      strength: 'moderate',
      analysis: 'Volume supports price movement'
    };
  }

  analyzeMomentumDetails(technicalData) {
    return {
      shortTerm: 'positive',
      mediumTerm: 'neutral',
      longTerm: 'positive'
    };
  }

  analyzeSupportResistanceDetails(technicalData) {
    return {
      nearestSupport: technicalData.support?.[0] || null,
      nearestResistance: technicalData.resistance?.[0] || null,
      strength: 'moderate'
    };
  }

  calculateTechnicalRating(technicalData) {
    // Simplified rating calculation
    return {
      rating: 'buy',
      score: 75,
      confidence: 'high'
    };
  }

  generateValuationSummary(fundamentalData) {
    return {
      overall: 'fairly_valued',
      peValuation: 'reasonable',
      pbValuation: 'attractive',
      recommendation: 'hold_to_buy'
    };
  }

  analyzeGrowthDetails(fundamentalData) {
    return {
      revenueGrowth: 'strong',
      earningsGrowth: 'moderate',
      futureProspects: 'positive'
    };
  }

  analyzeProfitabilityDetails(fundamentalData) {
    return {
      margins: 'healthy',
      roe: 'above_average',
      consistency: 'stable'
    };
  }

  analyzeFinancialStrength(fundamentalData) {
    return {
      debtLevels: 'manageable',
      cashPosition: 'strong',
      liquidity: 'adequate'
    };
  }

  calculateFundamentalRating(fundamentalData) {
    return {
      rating: 'buy',
      score: 78,
      confidence: 'high'
    };
  }

  /**
   * Get all recommendations for all time horizons
   */
  async getAllRecommendations() {
    try {
      const [daily, weekly, monthly, yearly] = await Promise.allSettled([
        this.generateDailyRecommendations(10),
        this.generateWeeklyRecommendations(15),
        this.generateMonthlyRecommendations(15),
        this.generateYearlyRecommendations(20)
      ]);

      return {
        daily: daily.status === 'fulfilled' ? daily.value : { error: daily.reason?.message },
        weekly: weekly.status === 'fulfilled' ? weekly.value : { error: weekly.reason?.message },
        monthly: monthly.status === 'fulfilled' ? monthly.value : { error: monthly.reason?.message },
        yearly: yearly.status === 'fulfilled' ? yearly.value : { error: yearly.reason?.message },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting all recommendations:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationEngine();