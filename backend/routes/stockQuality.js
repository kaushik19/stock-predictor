const express = require('express');
const Joi = require('joi');
const stockQualityService = require('../services/stockQualityService');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const stockQualitySchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Stock symbol is required'
  }),
  sector: Joi.string().valid(
    'Technology', 'Banking', 'Energy', 'Healthcare', 'Consumer Goods',
    'Industrials', 'Telecommunications', 'Utilities', 'Materials', 'Real Estate'
  ).default('Technology')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     QualityDimensions:
 *       type: object
 *       properties:
 *         growth:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         value:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         quality:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         momentum:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         stability:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *     StockEvaluation:
 *       type: object
 *       properties:
 *         evaluation:
 *           type: string
 *           enum: [Severely Overvalued, Overvalued, Fairly Valued, Undervalued]
 *         confidence:
 *           type: string
 *           enum: [High, Medium, Low]
 *         valuationRatio:
 *           type: number
 *         metrics:
 *           type: object
 *     FinancialTrends:
 *       type: object
 *       properties:
 *         revenue:
 *           type: object
 *           properties:
 *             direction:
 *               type: string
 *               enum: [Improving, Stable, Declining, Unknown]
 *             strength:
 *               type: string
 *               enum: [High, Medium, Low]
 *         profit:
 *           type: object
 *         roe:
 *           type: object
 *         overall:
 *           type: string
 *           enum: [Improving, Stable, Declining, Unknown]
 *     SectorComparison:
 *       type: object
 *       properties:
 *         sector:
 *           type: string
 *         rankings:
 *           type: object
 *         percentiles:
 *           type: object
 *         overallRanking:
 *           type: string
 *           enum: [Top Tier, Above Average, Average, Below Average, Bottom Tier]
 *         overallPercentile:
 *           type: number
 *     StockQualityAnalysis:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         sector:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         qualityScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         qualityGrade:
 *           type: string
 *           enum: [Excellent, Good, Average, Poor]
 *         evaluation:
 *           $ref: '#/components/schemas/StockEvaluation'
 *         financialTrends:
 *           $ref: '#/components/schemas/FinancialTrends'
 *         sectorComparison:
 *           $ref: '#/components/schemas/SectorComparison'
 *         qualityDimensions:
 *           $ref: '#/components/schemas/QualityDimensions'
 *         riskAssessment:
 *           type: object
 *           properties:
 *             overall:
 *               type: string
 *               enum: [Low, Medium, High]
 *             factors:
 *               type: array
 *               items:
 *                 type: string
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/stock-quality/{symbol}:
 *   get:
 *     summary: Get comprehensive stock quality analysis
 *     description: Get detailed quality scoring, evaluation metrics, and financial trends for a stock
 *     tags: [Stock Quality]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [Technology, Banking, Energy, Healthcare, Consumer Goods, Industrials, Telecommunications, Utilities, Materials, Real Estate]
 *           default: Technology
 *         description: Sector for benchmark comparison
 *     responses:
 *       200:
 *         description: Stock quality analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StockQualityAnalysis'
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Stock not found or insufficient data
 *       500:
 *         description: Internal server error
 */
router.get('/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockQualitySchema.validate({
      symbol: req.params.symbol,
      sector: req.query.sector
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, sector } = value;
    
    const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(symbol, sector);

    if (!qualityAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'Unable to perform quality analysis - insufficient data or invalid symbol'
      });
    }

    res.status(200).json({
      success: true,
      data: qualityAnalysis,
      metadata: {
        analysisType: 'comprehensive_quality',
        sector: sector,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Error in stock quality analysis for ${req.params.symbol}:`, error);
    
    if (error.message.includes('not found') || error.message.includes('invalid symbol')) {
      return res.status(404).json({
        success: false,
        message: 'Stock symbol not found or invalid'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform stock quality analysis'
    });
  }
});

/**
 * @swagger
 * /api/stock-quality/{symbol}/dimensions:
 *   get:
 *     summary: Get stock quality dimensions breakdown
 *     description: Get detailed breakdown of quality dimensions (Growth, Value, Quality, Momentum, Stability)
 *     tags: [Stock Quality]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           default: Technology
 *         description: Sector for benchmark comparison
 *     responses:
 *       200:
 *         description: Quality dimensions retrieved successfully
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
 *                     sector:
 *                       type: string
 *                     qualityDimensions:
 *                       $ref: '#/components/schemas/QualityDimensions'
 *                     overallScore:
 *                       type: number
 *                     grade:
 *                       type: string
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:symbol/dimensions', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockQualitySchema.validate({
      symbol: req.params.symbol,
      sector: req.query.sector
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, sector } = value;
    
    const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(symbol, sector);

    res.status(200).json({
      success: true,
      data: {
        symbol,
        sector,
        qualityDimensions: qualityAnalysis.qualityDimensions,
        overallScore: qualityAnalysis.qualityScore,
        grade: qualityAnalysis.qualityGrade,
        timestamp: qualityAnalysis.timestamp
      }
    });

  } catch (error) {
    logger.error(`Error getting quality dimensions for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get quality dimensions'
    });
  }
});

/**
 * @swagger
 * /api/stock-quality/{symbol}/evaluation:
 *   get:
 *     summary: Get stock valuation evaluation
 *     description: Get detailed valuation assessment (overvalued, fairly valued, undervalued)
 *     tags: [Stock Quality]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           default: Technology
 *         description: Sector for benchmark comparison
 *     responses:
 *       200:
 *         description: Stock evaluation completed successfully
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
 *                     sector:
 *                       type: string
 *                     evaluation:
 *                       $ref: '#/components/schemas/StockEvaluation'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:symbol/evaluation', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockQualitySchema.validate({
      symbol: req.params.symbol,
      sector: req.query.sector
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, sector } = value;
    
    const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(symbol, sector);

    res.status(200).json({
      success: true,
      data: {
        symbol,
        sector,
        evaluation: qualityAnalysis.evaluation,
        timestamp: qualityAnalysis.timestamp
      }
    });

  } catch (error) {
    logger.error(`Error getting stock evaluation for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stock evaluation'
    });
  }
});

/**
 * @swagger
 * /api/stock-quality/{symbol}/trends:
 *   get:
 *     summary: Get financial trends analysis
 *     description: Get detailed financial trends for revenue, profit, and key ratios
 *     tags: [Stock Quality]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           default: Technology
 *         description: Sector for benchmark comparison
 *     responses:
 *       200:
 *         description: Financial trends analysis completed successfully
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
 *                     sector:
 *                       type: string
 *                     financialTrends:
 *                       $ref: '#/components/schemas/FinancialTrends'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:symbol/trends', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockQualitySchema.validate({
      symbol: req.params.symbol,
      sector: req.query.sector
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, sector } = value;
    
    const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(symbol, sector);

    res.status(200).json({
      success: true,
      data: {
        symbol,
        sector,
        financialTrends: qualityAnalysis.financialTrends,
        timestamp: qualityAnalysis.timestamp
      }
    });

  } catch (error) {
    logger.error(`Error getting financial trends for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get financial trends'
    });
  }
});

/**
 * @swagger
 * /api/stock-quality/{symbol}/sector-comparison:
 *   get:
 *     summary: Get sector comparison and rankings
 *     description: Get detailed sector comparison with percentile rankings
 *     tags: [Stock Quality]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to analyze
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           default: Technology
 *         description: Sector for benchmark comparison
 *     responses:
 *       200:
 *         description: Sector comparison completed successfully
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
 *                     sectorComparison:
 *                       $ref: '#/components/schemas/SectorComparison'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:symbol/sector-comparison', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockQualitySchema.validate({
      symbol: req.params.symbol,
      sector: req.query.sector
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, sector } = value;
    
    const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(symbol, sector);

    res.status(200).json({
      success: true,
      data: {
        symbol,
        sectorComparison: qualityAnalysis.sectorComparison,
        timestamp: qualityAnalysis.timestamp
      }
    });

  } catch (error) {
    logger.error(`Error getting sector comparison for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sector comparison'
    });
  }
});

/**
 * @swagger
 * /api/stock-quality/batch:
 *   post:
 *     summary: Get quality analysis for multiple stocks
 *     description: Get quality scores and evaluations for multiple stocks at once
 *     tags: [Stock Quality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbols:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               sector:
 *                 type: string
 *                 default: Technology
 *     responses:
 *       200:
 *         description: Batch quality analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       qualityScore:
 *                         type: number
 *                       qualityGrade:
 *                         type: string
 *                       evaluation:
 *                         type: string
 *                       overallTrend:
 *                         type: string
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/batch', optionalAuth, async (req, res) => {
  try {
    const batchSchema = Joi.object({
      symbols: Joi.array().items(Joi.string()).min(1).max(20).required(),
      sector: Joi.string().default('Technology')
    });

    const { error, value } = batchSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbols, sector } = value;
    
    const batchResults = await Promise.allSettled(
      symbols.map(symbol => stockQualityService.getStockQualityAnalysis(symbol, sector))
    );

    const results = batchResults.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const analysis = result.value;
        return {
          symbol: symbols[index],
          qualityScore: analysis.qualityScore,
          qualityGrade: analysis.qualityGrade,
          evaluation: analysis.evaluation.evaluation,
          overallTrend: analysis.financialTrends.overall,
          sectorRanking: analysis.sectorComparison.overallRanking,
          timestamp: analysis.timestamp
        };
      } else {
        return {
          symbol: symbols[index],
          error: result.reason?.message || 'Analysis failed',
          qualityScore: null,
          qualityGrade: 'Unknown'
        };
      }
    });

    res.status(200).json({
      success: true,
      data: results,
      metadata: {
        totalRequested: symbols.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        sector: sector,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error in batch quality analysis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform batch quality analysis'
    });
  }
});

module.exports = router;