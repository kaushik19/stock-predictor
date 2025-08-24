const express = require('express');
const Joi = require('joi');
const recommendationEngine = require('../services/recommendationEngine');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const timeHorizonSchema = Joi.object({
  timeHorizon: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

const symbolAnalysisSchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Stock symbol is required'
  }),
  timeHorizon: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').default('monthly')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         timeHorizon:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         recommendation:
 *           type: string
 *           enum: [strong_buy, buy, hold, sell, strong_sell]
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         currentPrice:
 *           type: number
 *         targetPrice:
 *           type: number
 *         stopLoss:
 *           type: number
 *         entryPoint:
 *           type: number
 *         scores:
 *           type: object
 *           properties:
 *             technical:
 *               type: number
 *             fundamental:
 *               type: number
 *             sentiment:
 *               type: number
 *         reasons:
 *           type: array
 *           items:
 *             type: string
 *         risks:
 *           type: array
 *           items:
 *             type: string
 *     RecommendationSet:
 *       type: object
 *       properties:
 *         timeHorizon:
 *           type: string
 *         period:
 *           type: string
 *         recommendations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Recommendation'
 *         generatedAt:
 *           type: string
 *           format: date-time
 *         totalAnalyzed:
 *           type: number
 *         successfulAnalyses:
 *           type: number
 */

/**
 * @swagger
 * /api/recommendations/daily:
 *   get:
 *     summary: Get daily stock recommendations
 *     description: Get top stock recommendations for 1-day holding period based on technical analysis and sentiment
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Daily recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationSet'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/daily', optionalAuth, async (req, res) => {
  try {
    const { error, value } = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(10)
    }).validate({ limit: req.query.limit });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const recommendations = await recommendationEngine.generateDailyRecommendations(value.limit);

    res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    logger.error('Error getting daily recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/weekly:
 *   get:
 *     summary: Get weekly stock recommendations
 *     description: Get top stock recommendations for 1-week holding period based on swing trading patterns
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 15
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Weekly recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationSet'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/weekly', optionalAuth, async (req, res) => {
  try {
    const { error, value } = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(15)
    }).validate({ limit: req.query.limit });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const recommendations = await recommendationEngine.generateWeeklyRecommendations(value.limit);

    res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    logger.error('Error getting weekly recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate weekly recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/monthly:
 *   get:
 *     summary: Get monthly stock recommendations
 *     description: Get top stock recommendations for 1-month holding period with balanced analysis
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 15
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Monthly recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationSet'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/monthly', optionalAuth, async (req, res) => {
  try {
    const { error, value } = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(15)
    }).validate({ limit: req.query.limit });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const recommendations = await recommendationEngine.generateMonthlyRecommendations(value.limit);

    res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    logger.error('Error getting monthly recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate monthly recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/yearly:
 *   get:
 *     summary: Get yearly stock recommendations
 *     description: Get top stock recommendations for 1+ year holding period based on fundamental analysis
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Yearly recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RecommendationSet'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/yearly', optionalAuth, async (req, res) => {
  try {
    const { error, value } = Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(20)
    }).validate({ limit: req.query.limit });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const recommendations = await recommendationEngine.generateYearlyRecommendations(value.limit);

    res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    logger.error('Error getting yearly recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate yearly recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/all:
 *   get:
 *     summary: Get all recommendations for all time horizons
 *     description: Get recommendations for daily, weekly, monthly, and yearly time horizons in one call
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: All recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     daily:
 *                       $ref: '#/components/schemas/RecommendationSet'
 *                     weekly:
 *                       $ref: '#/components/schemas/RecommendationSet'
 *                     monthly:
 *                       $ref: '#/components/schemas/RecommendationSet'
 *                     yearly:
 *                       $ref: '#/components/schemas/RecommendationSet'
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const allRecommendations = await recommendationEngine.getAllRecommendations();

    res.status(200).json({
      success: true,
      data: allRecommendations
    });

  } catch (error) {
    logger.error('Error getting all recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/analyze/{symbol}:
 *   get:
 *     summary: Analyze a specific stock for recommendation
 *     description: Get detailed analysis and recommendation for a specific stock symbol
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: timeHorizon
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Time horizon for the analysis
 *     responses:
 *       200:
 *         description: Stock analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Stock not found or insufficient data
 *       500:
 *         description: Internal server error
 */
router.get('/analyze/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolAnalysisSchema.validate({
      symbol: req.params.symbol,
      timeHorizon: req.query.timeHorizon
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, timeHorizon } = value;
    const weights = recommendationEngine.weights[timeHorizon];
    
    const analysis = await recommendationEngine.analyzeStockForTimeHorizon(symbol, timeHorizon, weights);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Unable to analyze stock - insufficient data or invalid symbol'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
      metadata: {
        analysisType: 'comprehensive',
        timeHorizon: timeHorizon,
        weights: weights,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Error analyzing stock ${req.params.symbol}:`, error);
    
    if (error.message.includes('not found') || error.message.includes('invalid symbol')) {
      return res.status(404).json({
        success: false,
        message: 'Stock symbol not found or invalid'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze stock'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/top-picks:
 *   get:
 *     summary: Get top stock picks across all time horizons
 *     description: Get the highest confidence recommendations from all time horizons
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Number of top picks to return
 *     responses:
 *       200:
 *         description: Top picks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     topPicks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Recommendation'
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/top-picks', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get all recommendations and extract top picks
    const allRecommendations = await recommendationEngine.getAllRecommendations();
    const topPicks = [];

    // Collect all recommendations from all time horizons
    ['daily', 'weekly', 'monthly', 'yearly'].forEach(horizon => {
      if (allRecommendations[horizon] && allRecommendations[horizon].recommendations) {
        topPicks.push(...allRecommendations[horizon].recommendations);
      }
    });

    // Sort by confidence and get unique symbols (highest confidence per symbol)
    const uniqueTopPicks = [];
    const seenSymbols = new Set();

    topPicks
      .sort((a, b) => b.confidence - a.confidence)
      .forEach(pick => {
        if (!seenSymbols.has(pick.symbol) && pick.recommendation !== 'sell' && pick.recommendation !== 'strong_sell') {
          uniqueTopPicks.push(pick);
          seenSymbols.add(pick.symbol);
        }
      });

    res.status(200).json({
      success: true,
      data: {
        topPicks: uniqueTopPicks.slice(0, limit),
        totalAnalyzed: topPicks.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting top picks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get top picks'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/stock-of-the-week:
 *   get:
 *     summary: Get stock of the week prediction
 *     description: Get the single best stock pick for the week based on swing trading analysis
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Stock of the week prediction generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stockOfTheWeek:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Recommendation'
 *                         - type: object
 *                           properties:
 *                             predictionType:
 *                               type: string
 *                             validFrom:
 *                               type: string
 *                               format: date-time
 *                             validUntil:
 *                               type: string
 *                               format: date-time
 *                             keyHighlights:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             tradingStrategy:
 *                               type: object
 *                             detailedTechnicalAnalysis:
 *                               type: object
 *                             detailedFundamentalAnalysis:
 *                               type: object
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     totalAnalyzed:
 *                       type: number
 *                     selectionCriteria:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.get('/stock-of-the-week', optionalAuth, async (req, res) => {
  try {
    const stockOfTheWeek = await recommendationEngine.predictStockOfTheWeek();

    res.status(200).json({
      success: true,
      data: stockOfTheWeek
    });

  } catch (error) {
    logger.error('Error getting stock of the week:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict stock of the week'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/stock-of-the-month:
 *   get:
 *     summary: Get stock of the month prediction
 *     description: Get the single best stock pick for the month based on balanced analysis
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Stock of the month prediction generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stockOfTheMonth:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Recommendation'
 *                         - type: object
 *                           properties:
 *                             predictionType:
 *                               type: string
 *                             validFrom:
 *                               type: string
 *                               format: date-time
 *                             validUntil:
 *                               type: string
 *                               format: date-time
 *                             keyHighlights:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             tradingStrategy:
 *                               type: object
 *                             detailedTechnicalAnalysis:
 *                               type: object
 *                             detailedFundamentalAnalysis:
 *                               type: object
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     totalAnalyzed:
 *                       type: number
 *                     selectionCriteria:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.get('/stock-of-the-month', optionalAuth, async (req, res) => {
  try {
    const stockOfTheMonth = await recommendationEngine.predictStockOfTheMonth();

    res.status(200).json({
      success: true,
      data: stockOfTheMonth
    });

  } catch (error) {
    logger.error('Error getting stock of the month:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict stock of the month'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/detailed-analysis/{symbol}:
 *   get:
 *     summary: Get detailed technical and fundamental analysis for a stock
 *     description: Get comprehensive analysis including detailed technical and fundamental aspects
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: timeHorizon
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Time horizon for the analysis
 *     responses:
 *       200:
 *         description: Detailed analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                     timeHorizon:
 *                       type: string
 *                     detailedTechnicalAnalysis:
 *                       type: object
 *                       properties:
 *                         keyInsights:
 *                           type: array
 *                           items:
 *                             type: string
 *                         chartPatterns:
 *                           type: array
 *                           items:
 *                             type: string
 *                         volumeProfile:
 *                           type: object
 *                         momentumAnalysis:
 *                           type: object
 *                         supportResistanceAnalysis:
 *                           type: object
 *                         technicalRating:
 *                           type: object
 *                     detailedFundamentalAnalysis:
 *                       type: object
 *                       properties:
 *                         keyInsights:
 *                           type: array
 *                           items:
 *                             type: string
 *                         valuationSummary:
 *                           type: object
 *                         growthAnalysis:
 *                           type: object
 *                         profitabilityAnalysis:
 *                           type: object
 *                         financialStrengthAnalysis:
 *                           type: object
 *                         fundamentalRating:
 *                           type: object
 *                     marketContext:
 *                       type: object
 *                     riskAssessment:
 *                       type: object
 *                     catalysts:
 *                       type: object
 *                     competitivePosition:
 *                       type: object
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Stock not found or insufficient data
 *       500:
 *         description: Internal server error
 */
router.get('/detailed-analysis/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolAnalysisSchema.validate({
      symbol: req.params.symbol,
      timeHorizon: req.query.timeHorizon
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, timeHorizon } = value;
    
    const detailedAnalysis = await recommendationEngine.getEnhancedStockAnalysis(symbol, timeHorizon);

    if (!detailedAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Unable to perform detailed analysis - insufficient data or invalid symbol'
      });
    }

    res.status(200).json({
      success: true,
      data: detailedAnalysis,
      metadata: {
        analysisType: 'detailed_comprehensive',
        timeHorizon: timeHorizon,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Error in detailed analysis for ${req.params.symbol}:`, error);
    
    if (error.message.includes('not found') || error.message.includes('invalid symbol')) {
      return res.status(404).json({
        success: false,
        message: 'Stock symbol not found or invalid'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform detailed analysis'
    });
  }
});

/**
 * @swagger
 * /api/recommendations/health:
 *   get:
 *     summary: Get recommendation engine health status
 *     description: Check the health and status of the recommendation engine
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     services:
 *                       type: object
 *                     lastUpdate:
 *                       type: string
 *                       format: date-time
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      services: {
        technicalAnalysis: 'available',
        fundamentalAnalysis: 'available',
        sentimentAnalysis: 'available',
        priceData: 'available'
      },
      weights: recommendationEngine.weights,
      supportedTimeHorizons: ['daily', 'weekly', 'monthly', 'yearly'],
      popularStocks: recommendationEngine.popularStocks.length,
      newFeatures: {
        stockOfTheWeek: 'available',
        stockOfTheMonth: 'available',
        detailedAnalysis: 'available'
      },
      lastUpdate: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Error getting recommendation engine health:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

module.exports = router;