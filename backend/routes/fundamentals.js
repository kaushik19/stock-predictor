const express = require('express');
const Joi = require('joi');
const alphaVantageService = require('../services/alphaVantageService');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const symbolSchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Stock symbol is required'
  }),
  exchange: Joi.string().valid('NSE', 'BSE').default('NSE')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyOverview:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         sector:
 *           type: string
 *         industry:
 *           type: string
 *         marketCapitalization:
 *           type: number
 *         peRatio:
 *           type: number
 *         eps:
 *           type: number
 *         dividendYield:
 *           type: number
 *         profitMargin:
 *           type: number
 *         returnOnEquityTTM:
 *           type: number
 *         beta:
 *           type: number
 *     FinancialStatement:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         annualReports:
 *           type: array
 *           items:
 *             type: object
 *         quarterlyReports:
 *           type: array
 *           items:
 *             type: object
 *     DerivedMetrics:
 *       type: object
 *       properties:
 *         netProfitMargin:
 *           type: number
 *         grossProfitMargin:
 *           type: number
 *         currentRatio:
 *           type: number
 *         debtToEquityRatio:
 *           type: number
 *         returnOnAssets:
 *           type: number
 *         returnOnEquity:
 *           type: number
 *         revenueGrowthRate:
 *           type: number
 *         financialHealthScore:
 *           type: number
 */

/**
 * @swagger
 * /api/fundamentals/overview/{symbol}:
 *   get:
 *     summary: Get company overview and key metrics
 *     description: Fetch comprehensive company information and financial ratios
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., RELIANCE, TCS)
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Company overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CompanyOverview'
 *       400:
 *         description: Invalid symbol or parameters
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get('/overview/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const overview = await alphaVantageService.getCompanyOverview(symbol, exchange);

    res.status(200).json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error('Error fetching company overview:', error);
    
    if (error.message.includes('API key not configured')) {
      return res.status(503).json({
        success: false,
        message: 'Fundamental data service temporarily unavailable'
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch company overview'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/income-statement/{symbol}:
 *   get:
 *     summary: Get income statement data
 *     description: Fetch annual and quarterly income statement data
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Income statement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinancialStatement'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/income-statement/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const incomeStatement = await alphaVantageService.getIncomeStatement(symbol, exchange);

    res.status(200).json({
      success: true,
      data: incomeStatement
    });

  } catch (error) {
    logger.error('Error fetching income statement:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch income statement'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/balance-sheet/{symbol}:
 *   get:
 *     summary: Get balance sheet data
 *     description: Fetch annual and quarterly balance sheet data
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Balance sheet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinancialStatement'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/balance-sheet/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const balanceSheet = await alphaVantageService.getBalanceSheet(symbol, exchange);

    res.status(200).json({
      success: true,
      data: balanceSheet
    });

  } catch (error) {
    logger.error('Error fetching balance sheet:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch balance sheet'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/cash-flow/{symbol}:
 *   get:
 *     summary: Get cash flow statement data
 *     description: Fetch annual and quarterly cash flow data
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Cash flow statement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinancialStatement'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/cash-flow/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const cashFlow = await alphaVantageService.getCashFlow(symbol, exchange);

    res.status(200).json({
      success: true,
      data: cashFlow
    });

  } catch (error) {
    logger.error('Error fetching cash flow:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cash flow'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/comprehensive/{symbol}:
 *   get:
 *     summary: Get comprehensive fundamental data
 *     description: Fetch all fundamental data including derived metrics and financial health score
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Comprehensive fundamental data retrieved successfully
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
 *                     overview:
 *                       $ref: '#/components/schemas/CompanyOverview'
 *                     incomeStatement:
 *                       $ref: '#/components/schemas/FinancialStatement'
 *                     balanceSheet:
 *                       $ref: '#/components/schemas/FinancialStatement'
 *                     cashFlow:
 *                       $ref: '#/components/schemas/FinancialStatement'
 *                     derivedMetrics:
 *                       $ref: '#/components/schemas/DerivedMetrics'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/comprehensive/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const fundamentalData = await alphaVantageService.getFundamentalData(symbol, exchange);

    res.status(200).json({
      success: true,
      data: fundamentalData,
      hasErrors: fundamentalData.errors.length > 0,
      errorCount: fundamentalData.errors.length
    });

  } catch (error) {
    logger.error('Error fetching comprehensive fundamental data:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fundamental data'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/metrics/{symbol}:
 *   get:
 *     summary: Get derived financial metrics only
 *     description: Get calculated financial ratios and health score without raw financial statements
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Financial metrics calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DerivedMetrics'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const fundamentalData = await alphaVantageService.getFundamentalData(symbol, exchange);

    if (!fundamentalData.derivedMetrics) {
      return res.status(404).json({
        success: false,
        message: 'Insufficient data to calculate financial metrics'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        symbol: fundamentalData.symbol,
        metrics: fundamentalData.derivedMetrics,
        lastUpdated: fundamentalData.lastUpdated
      }
    });

  } catch (error) {
    logger.error('Error calculating financial metrics:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate financial metrics'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/health-score/{symbol}:
 *   get:
 *     summary: Get financial health score
 *     description: Get a simplified financial health score (0-100) for quick assessment
 *     tags: [Fundamentals]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Stock exchange
 *     responses:
 *       200:
 *         description: Financial health score calculated successfully
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
 *                     healthScore:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     rating:
 *                       type: string
 *                       enum: [Excellent, Good, Fair, Poor, Very Poor]
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Insufficient data for health score calculation
 *       500:
 *         description: Internal server error
 */
router.get('/health-score/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({
      symbol: req.params.symbol,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, exchange } = value;
    const fundamentalData = await alphaVantageService.getFundamentalData(symbol, exchange);

    if (!fundamentalData.derivedMetrics || fundamentalData.derivedMetrics.financialHealthScore === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Insufficient data to calculate financial health score'
      });
    }

    const healthScore = fundamentalData.derivedMetrics.financialHealthScore;
    let rating;
    
    if (healthScore >= 80) rating = 'Excellent';
    else if (healthScore >= 60) rating = 'Good';
    else if (healthScore >= 40) rating = 'Fair';
    else if (healthScore >= 20) rating = 'Poor';
    else rating = 'Very Poor';

    res.status(200).json({
      success: true,
      data: {
        symbol: fundamentalData.symbol,
        healthScore: healthScore,
        rating: rating,
        lastUpdated: fundamentalData.lastUpdated
      }
    });

  } catch (error) {
    logger.error('Error calculating health score:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate health score'
    });
  }
});

/**
 * @swagger
 * /api/fundamentals/api-status:
 *   get:
 *     summary: Get Alpha Vantage API status
 *     description: Check the status and usage of the Alpha Vantage API service
 *     tags: [Fundamentals]
 *     responses:
 *       200:
 *         description: API status retrieved successfully
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
 *                     hasApiKey:
 *                       type: boolean
 *                     rateLimitDelay:
 *                       type: number
 *                     queueLength:
 *                       type: number
 *                     isProcessingQueue:
 *                       type: boolean
 *                     lastRequestTime:
 *                       type: number
 */
router.get('/api-status', optionalAuth, async (req, res) => {
  try {
    const apiUsage = alphaVantageService.getApiUsage();

    res.status(200).json({
      success: true,
      data: {
        ...apiUsage,
        status: apiUsage.hasApiKey ? 'Available' : 'API Key Required',
        estimatedWaitTime: apiUsage.queueLength * (apiUsage.rateLimitDelay / 1000) // in seconds
      }
    });

  } catch (error) {
    logger.error('Error getting API status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API status'
    });
  }
});

module.exports = router;