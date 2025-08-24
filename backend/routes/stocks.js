const express = require('express');
const Joi = require('joi');
const YahooFinanceService = require('../services/yahooFinanceService');
const technicalAnalysisService = require('../services/technicalAnalysisService');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();
const yahooFinance = new YahooFinanceService();

// Validation schemas
const symbolSchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Stock symbol is required'
  })
});

const multipleSymbolsSchema = Joi.object({
  symbols: Joi.array().items(Joi.string()).min(1).max(50).required().messages({
    'array.min': 'At least one symbol is required',
    'array.max': 'Maximum 50 symbols allowed',
    'any.required': 'Symbols array is required'
  })
});

const historicalSchema = Joi.object({
  symbol: Joi.string().required(),
  period: Joi.string().valid('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max').default('1mo'),
  interval: Joi.string().valid('1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo').default('1d')
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query cannot be empty',
    'any.required': 'Search query is required'
  }),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

const technicalAnalysisSchema = Joi.object({
  symbol: Joi.string().required(),
  period: Joi.string().valid('1mo', '3mo', '6mo', '1y', '2y').default('3mo'),
  exchange: Joi.string().valid('NSE', 'BSE').default('NSE')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     StockQuote:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *           description: Stock symbol
 *         name:
 *           type: string
 *           description: Company name
 *         currentPrice:
 *           type: number
 *           description: Current stock price
 *         priceChange:
 *           type: number
 *           description: Price change from previous close
 *         priceChangePercent:
 *           type: number
 *           description: Percentage change from previous close
 *         dayHigh:
 *           type: number
 *           description: Day's high price
 *         dayLow:
 *           type: number
 *           description: Day's low price
 *         volume:
 *           type: number
 *           description: Trading volume
 *         marketCap:
 *           type: number
 *           description: Market capitalization
 *         peRatio:
 *           type: number
 *           description: Price-to-earnings ratio
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     HistoricalData:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               open:
 *                 type: number
 *               high:
 *                 type: number
 *               low:
 *                 type: number
 *               close:
 *                 type: number
 *               volume:
 *                 type: number
 *     SearchResult:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         exchange:
 *           type: string
 *         type:
 *           type: string
 *         sector:
 *           type: string
 */

/**
 * @swagger
 * /api/stocks/quote/{symbol}:
 *   get:
 *     summary: Get real-time stock quote
 *     description: Fetch real-time stock price and related data for a specific symbol
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., RELIANCE, TCS)
 *         example: RELIANCE
 *     responses:
 *       200:
 *         description: Stock quote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StockQuote'
 *       400:
 *         description: Invalid symbol
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Internal server error
 */
router.get('/quote/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = symbolSchema.validate({ symbol: req.params.symbol });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol } = value;
    const quote = await yahooFinance.getQuote(symbol);

    res.status(200).json({
      success: true,
      data: quote
    });

  } catch (error) {
    logger.error(`Failed to get quote for ${req.params.symbol}:`, error);
    
    if (error.message.includes('No quote data found')) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found',
        symbol: req.params.symbol
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock quote'
    });
  }
});

/**
 * @swagger
 * /api/stocks/quotes:
 *   post:
 *     summary: Get multiple stock quotes
 *     description: Fetch real-time quotes for multiple stocks
 *     tags: [Stocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbols
 *             properties:
 *               symbols:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 50
 *                 description: Array of stock symbols
 *           example:
 *             symbols: ["RELIANCE", "TCS", "HDFCBANK"]
 *     responses:
 *       200:
 *         description: Stock quotes retrieved successfully
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
 *                     $ref: '#/components/schemas/StockQuote'
 *                 count:
 *                   type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/quotes', optionalAuth, async (req, res) => {
  try {
    const { error, value } = multipleSymbolsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbols } = value;
    const quotes = await yahooFinance.getMultipleQuotes(symbols);

    res.status(200).json({
      success: true,
      data: quotes,
      count: quotes.length,
      requested: symbols.length
    });

  } catch (error) {
    logger.error('Failed to get multiple quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock quotes'
    });
  }
});

/**
 * @swagger
 * /api/stocks/historical/{symbol}:
 *   get:
 *     summary: Get historical stock data
 *     description: Fetch historical price data for a specific stock
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max]
 *           default: 1mo
 *         description: Time period for historical data
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo]
 *           default: 1d
 *         description: Data interval
 *     responses:
 *       200:
 *         description: Historical data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HistoricalData'
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Internal server error
 */
router.get('/historical/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = historicalSchema.validate({
      symbol: req.params.symbol,
      period: req.query.period,
      interval: req.query.interval
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, period, interval } = value;
    const historicalData = await yahooFinance.getHistoricalData(symbol, period, interval);

    res.status(200).json({
      success: true,
      data: historicalData
    });

  } catch (error) {
    logger.error(`Failed to get historical data for ${req.params.symbol}:`, error);
    
    if (error.message.includes('No historical data found')) {
      return res.status(404).json({
        success: false,
        message: 'Historical data not found',
        symbol: req.params.symbol
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data'
    });
  }
});

/**
 * @swagger
 * /api/stocks/search:
 *   get:
 *     summary: Search for stocks
 *     description: Search for Indian stocks by name or symbol
 *     tags: [Stocks]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: reliance
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                     $ref: '#/components/schemas/SearchResult'
 *                 count:
 *                   type: number
 *                 query:
 *                   type: string
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Internal server error
 */
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { q, limit } = value;
    const searchResults = await yahooFinance.searchStocks(q, limit);

    res.status(200).json({
      success: true,
      data: searchResults,
      count: searchResults.length,
      query: q
    });

  } catch (error) {
    logger.error(`Failed to search stocks for "${req.query.q}":`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to search stocks'
    });
  }
});

/**
 * @swagger
 * /api/stocks/market-status:
 *   get:
 *     summary: Get market status
 *     description: Get current market status for Indian exchanges
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: Market status retrieved successfully
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
 *                     isOpen:
 *                       type: boolean
 *                     exchanges:
 *                       type: object
 *                       properties:
 *                         NSE:
 *                           type: object
 *                           properties:
 *                             isOpen:
 *                               type: boolean
 *                             lastUpdate:
 *                               type: string
 *                               format: date-time
 *                         BSE:
 *                           type: object
 *                           properties:
 *                             isOpen:
 *                               type: boolean
 *                             lastUpdate:
 *                               type: string
 *                               format: date-time
 *                     timezone:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/market-status', optionalAuth, async (req, res) => {
  try {
    const marketStatus = await yahooFinance.getMarketStatus();

    res.status(200).json({
      success: true,
      data: marketStatus
    });

  } catch (error) {
    logger.error('Failed to get market status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market status'
    });
  }
});

/**
 * @swagger
 * /api/stocks/popular:
 *   get:
 *     summary: Get popular Indian stocks
 *     description: Get list of popular Indian stocks with current quotes
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: Popular stocks retrieved successfully
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
 *                     $ref: '#/components/schemas/StockQuote'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const popularStocks = await yahooFinance.getPopularIndianStocks();

    res.status(200).json({
      success: true,
      data: popularStocks,
      count: popularStocks.length
    });

  } catch (error) {
    logger.error('Failed to get popular stocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular stocks'
    });
  }
});

/**
 * @swagger
 * /api/stocks/indices:
 *   get:
 *     summary: Get major Indian indices
 *     description: Get current quotes for major Indian stock indices
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: Indices data retrieved successfully
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
 *                     $ref: '#/components/schemas/StockQuote'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/indices', optionalAuth, async (req, res) => {
  try {
    const indices = [
      '^NSEI',    // Nifty 50
      '^BSESN',   // BSE Sensex
      '^NSEBANK', // Nifty Bank
      '^NSEIT',   // Nifty IT
      '^NSMIDCP'  // Nifty Midcap
    ];

    const indicesData = await yahooFinance.getMultipleQuotes(indices);

    res.status(200).json({
      success: true,
      data: indicesData,
      count: indicesData.length
    });

  } catch (error) {
    logger.error('Failed to get indices data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indices data'
    });
  }
});

/**
 * @swagger
 * /api/stocks/technical-analysis/{symbol}:
 *   get:
 *     summary: Get comprehensive technical analysis
 *     description: Get detailed technical analysis including RSI, MACD, moving averages, support/resistance levels, volume analysis, and momentum indicators
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., RELIANCE, TCS)
 *         example: RELIANCE
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1mo, 3mo, 6mo, 1y, 2y]
 *           default: 3mo
 *         description: Time period for analysis
 *       - in: query
 *         name: exchange
 *         schema:
 *           type: string
 *           enum: [NSE, BSE]
 *           default: NSE
 *         description: Exchange (NSE or BSE)
 *     responses:
 *       200:
 *         description: Technical analysis retrieved successfully
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
 *                     period:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     indicators:
 *                       type: object
 *                       properties:
 *                         rsi:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: number
 *                             signal:
 *                               type: string
 *                         macd:
 *                           type: object
 *                           properties:
 *                             macdLine:
 *                               type: number
 *                             signalLine:
 *                               type: number
 *                             histogram:
 *                               type: number
 *                             signal:
 *                               type: string
 *                         movingAverages:
 *                           type: object
 *                           properties:
 *                             sma20:
 *                               type: object
 *                             sma50:
 *                               type: object
 *                             sma200:
 *                               type: object
 *                             ema12:
 *                               type: object
 *                             ema26:
 *                               type: object
 *                         bollingerBands:
 *                           type: object
 *                           properties:
 *                             upperBand:
 *                               type: number
 *                             middleBand:
 *                               type: number
 *                             lowerBand:
 *                               type: number
 *                             signal:
 *                               type: string
 *                         supportResistance:
 *                           type: object
 *                           properties:
 *                             support:
 *                               type: array
 *                               items:
 *                                 type: number
 *                             resistance:
 *                               type: array
 *                               items:
 *                                 type: number
 *                             signal:
 *                               type: string
 *                         volumeAnalysis:
 *                           type: object
 *                           properties:
 *                             averageVolume:
 *                               type: number
 *                             currentVolume:
 *                               type: number
 *                             volumeRatio:
 *                               type: number
 *                             volumeTrend:
 *                               type: string
 *                             signal:
 *                               type: string
 *                         momentum:
 *                           type: object
 *                           properties:
 *                             rateOfChange:
 *                               type: number
 *                             stochastic:
 *                               type: object
 *                             williamsR:
 *                               type: object
 *                             cci:
 *                               type: object
 *                     signals:
 *                       type: object
 *                       properties:
 *                         overall:
 *                           type: string
 *                         strength:
 *                           type: number
 *                         recommendation:
 *                           type: string
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Stock not found or insufficient data
 *       500:
 *         description: Internal server error
 */
router.get('/technical-analysis/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = technicalAnalysisSchema.validate({
      symbol: req.params.symbol,
      period: req.query.period,
      exchange: req.query.exchange
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, period, exchange } = value;
    const analysis = await technicalAnalysisService.getComprehensiveTechnicalAnalysis(symbol, period, exchange);

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error(`Failed to get technical analysis for ${req.params.symbol}:`, error);
    
    if (error.message.includes('Insufficient historical data')) {
      return res.status(404).json({
        success: false,
        message: 'Insufficient historical data for technical analysis',
        symbol: req.params.symbol
      });
    }

    if (error.message.includes('No historical data found')) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found or no data available',
        symbol: req.params.symbol
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to perform technical analysis'
    });
  }
});

module.exports = router;