const express = require('express');
const Joi = require('joi');
const newsService = require('../services/newsService');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { logger } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const searchSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query cannot be empty',
    'any.required': 'Search query is required'
  }),
  sortBy: Joi.string().valid('relevancy', 'popularity', 'publishedAt').default('publishedAt'),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
  days: Joi.number().integer().min(1).max(30).default(7)
});

const stockNewsSchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Stock symbol is required'
  }),
  companyName: Joi.string().required().messages({
    'any.required': 'Company name is required'
  }),
  pageSize: Joi.number().integer().min(1).max(50).default(10),
  days: Joi.number().integer().min(1).max(30).default(7)
});

const generalNewsSchema = Joi.object({
  category: Joi.string().valid('business', 'technology', 'general').default('business'),
  country: Joi.string().length(2).default('in'),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1)
});

const trendingSchema = Joi.object({
  days: Joi.number().integer().min(1).max(7).default(1),
  minArticles: Joi.number().integer().min(1).max(10).default(3)
});

/**
 * @swagger
 * components:
 *   schemas:
 *     NewsArticle:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Article title
 *         description:
 *           type: string
 *           description: Article description
 *         content:
 *           type: string
 *           description: Article content
 *         url:
 *           type: string
 *           description: Article URL
 *         urlToImage:
 *           type: string
 *           description: Article image URL
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Publication date
 *         source:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         author:
 *           type: string
 *         sentiment:
 *           $ref: '#/components/schemas/SentimentAnalysis'
 *         relevanceScore:
 *           type: number
 *           description: Relevance score for stock-specific news
 *     SentimentAnalysis:
 *       type: object
 *       properties:
 *         overall:
 *           type: string
 *           enum: [positive, negative, neutral]
 *         score:
 *           type: number
 *           description: Sentiment score (-1 to 1)
 *         positive:
 *           type: number
 *           description: Percentage of positive sentiment
 *         negative:
 *           type: number
 *           description: Percentage of negative sentiment
 *         neutral:
 *           type: number
 *           description: Percentage of neutral sentiment
 *         confidence:
 *           type: number
 *           description: Confidence level (0-100)
 *         totalArticles:
 *           type: number
 *           description: Number of articles analyzed
 *     TrendingStock:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         articleCount:
 *           type: number
 *         sentiment:
 *           $ref: '#/components/schemas/SentimentAnalysis'
 *         trendingScore:
 *           type: number
 *         latestArticle:
 *           $ref: '#/components/schemas/NewsArticle'
 */

/**
 * @swagger
 * /api/news/financial:
 *   get:
 *     summary: Get general financial news
 *     description: Fetch latest financial and business news from India
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [business, technology, general]
 *           default: business
 *         description: News category
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *           default: in
 *         description: Country code (2 letters)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of articles to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Financial news retrieved successfully
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
 *                     $ref: '#/components/schemas/NewsArticle'
 *                 count:
 *                   type: number
 *       400:
 *         description: Invalid parameters
 *       503:
 *         description: News service unavailable
 *       500:
 *         description: Internal server error
 */
router.get('/financial', optionalAuth, async (req, res) => {
  try {
    const { error, value } = generalNewsSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const articles = await newsService.getFinancialNews(value);

    res.status(200).json({
      success: true,
      data: articles,
      count: articles.length
    });

  } catch (error) {
    logger.error('Error fetching financial news:', error);
    
    if (error.message.includes('API key not configured')) {
      return res.status(503).json({
        success: false,
        message: 'News service temporarily unavailable'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch financial news'
    });
  }
});

/**
 * @swagger
 * /api/news/search:
 *   get:
 *     summary: Search news articles
 *     description: Search for news articles by query with sentiment analysis
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "stock market"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevancy, popularity, publishedAt]
 *           default: publishedAt
 *         description: Sort order
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of articles to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Number of days to search back
 *     responses:
 *       200:
 *         description: News articles found successfully
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
 *                     $ref: '#/components/schemas/NewsArticle'
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

    const { q, days, ...searchOptions } = value;
    
    // Calculate date range
    const to = new Date().toISOString();
    const from = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();

    const articles = await newsService.searchNews(q, {
      ...searchOptions,
      from,
      to
    });

    res.status(200).json({
      success: true,
      data: articles,
      count: articles.length,
      query: q,
      timeframe: `${days} day${days > 1 ? 's' : ''}`
    });

  } catch (error) {
    logger.error('Error searching news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search news'
    });
  }
});

/**
 * @swagger
 * /api/news/stock/{symbol}:
 *   get:
 *     summary: Get news for a specific stock
 *     description: Fetch news articles related to a specific stock with relevance scoring
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol
 *       - in: query
 *         name: companyName
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name
 *         example: "Reliance Industries Limited"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of articles to return
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Number of days to search back
 *     responses:
 *       200:
 *         description: Stock news retrieved successfully
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
 *                     $ref: '#/components/schemas/NewsArticle'
 *                 count:
 *                   type: number
 *                 symbol:
 *                   type: string
 *                 companyName:
 *                   type: string
 *                 sentiment:
 *                   $ref: '#/components/schemas/SentimentAnalysis'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/stock/:symbol', optionalAuth, async (req, res) => {
  try {
    const { error, value } = stockNewsSchema.validate({
      symbol: req.params.symbol,
      companyName: req.query.companyName,
      pageSize: req.query.pageSize,
      days: req.query.days
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { symbol, companyName, pageSize, days } = value;
    const articles = await newsService.getStockNews(symbol, companyName, { pageSize, days });
    
    // Calculate overall sentiment for the stock
    const overallSentiment = newsService.analyzeSentiment(articles);

    res.status(200).json({
      success: true,
      data: articles,
      count: articles.length,
      symbol,
      companyName,
      sentiment: overallSentiment,
      timeframe: `${days} day${days > 1 ? 's' : ''}`
    });

  } catch (error) {
    logger.error('Error fetching stock news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stock news'
    });
  }
});

/**
 * @swagger
 * /api/news/trending:
 *   post:
 *     summary: Get trending stocks based on news frequency
 *     description: Analyze news frequency and sentiment to identify trending stocks
 *     tags: [News]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stocks
 *             properties:
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                     name:
 *                       type: string
 *                 example:
 *                   - symbol: "RELIANCE"
 *                     name: "Reliance Industries Limited"
 *                   - symbol: "TCS"
 *                     name: "Tata Consultancy Services"
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 default: 1
 *               minArticles:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 3
 *     responses:
 *       200:
 *         description: Trending stocks identified successfully
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
 *                     $ref: '#/components/schemas/TrendingStock'
 *                 count:
 *                   type: number
 *                 timeframe:
 *                   type: string
 *       400:
 *         description: Invalid stock list
 *       500:
 *         description: Internal server error
 */
router.post('/trending', optionalAuth, async (req, res) => {
  try {
    const schema = Joi.object({
      stocks: Joi.array().items(
        Joi.object({
          symbol: Joi.string().required(),
          name: Joi.string().required()
        })
      ).min(1).max(100).required(),
      ...trendingSchema.describe().keys
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { stocks, days, minArticles } = value;
    const trendingStocks = await newsService.getTrendingStocks(stocks, { days, minArticles });

    res.status(200).json({
      success: true,
      data: trendingStocks,
      count: trendingStocks.length,
      timeframe: `${days} day${days > 1 ? 's' : ''}`,
      analyzedStocks: stocks.length
    });

  } catch (error) {
    logger.error('Error analyzing trending stocks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze trending stocks'
    });
  }
});

/**
 * @swagger
 * /api/news/market-sentiment:
 *   get:
 *     summary: Get overall market sentiment
 *     description: Analyze general market sentiment based on recent news
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 7
 *           default: 1
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Market sentiment analyzed successfully
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
 *                     sentiment:
 *                       $ref: '#/components/schemas/SentimentAnalysis'
 *                     articleCount:
 *                       type: number
 *                     timeframe:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     topArticles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NewsArticle'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/market-sentiment', optionalAuth, async (req, res) => {
  try {
    const { error, value } = Joi.object({
      days: Joi.number().integer().min(1).max(7).default(1)
    }).validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { days } = value;
    const marketSentiment = await newsService.getMarketSentiment({ days });

    res.status(200).json({
      success: true,
      data: marketSentiment
    });

  } catch (error) {
    logger.error('Error analyzing market sentiment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze market sentiment'
    });
  }
});

/**
 * @swagger
 * /api/news/sentiment/analyze:
 *   post:
 *     summary: Analyze sentiment of provided text or articles
 *     description: Perform sentiment analysis on custom text or article data
 *     tags: [News]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     content:
 *                       type: string
 *               text:
 *                 type: string
 *                 description: Raw text to analyze (alternative to articles)
 *             example:
 *               articles:
 *                 - title: "Stock market rises on positive earnings"
 *                   description: "Markets showed strong performance today"
 *                   content: "The stock market gained significantly..."
 *     responses:
 *       200:
 *         description: Sentiment analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SentimentAnalysis'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/sentiment/analyze', optionalAuth, async (req, res) => {
  try {
    const schema = Joi.object({
      articles: Joi.array().items(
        Joi.object({
          title: Joi.string().allow(''),
          description: Joi.string().allow(''),
          content: Joi.string().allow('')
        })
      ),
      text: Joi.string()
    }).or('articles', 'text');

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    let articles = value.articles;
    
    // If text is provided instead of articles, create a single article
    if (value.text && !articles) {
      articles = [{
        title: '',
        description: value.text,
        content: ''
      }];
    }

    const sentiment = newsService.analyzeSentiment(articles);

    res.status(200).json({
      success: true,
      data: sentiment
    });

  } catch (error) {
    logger.error('Error analyzing sentiment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze sentiment'
    });
  }
});

/**
 * @swagger
 * /api/news/api-status:
 *   get:
 *     summary: Get news API status
 *     description: Check the status and usage of the news API service
 *     tags: [News]
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
 *                     lastRequestTime:
 *                       type: number
 *                     positiveKeywordsCount:
 *                       type: number
 *                     negativeKeywordsCount:
 *                       type: number
 *                     status:
 *                       type: string
 */
router.get('/api-status', optionalAuth, async (req, res) => {
  try {
    const apiUsage = newsService.getApiUsage();

    res.status(200).json({
      success: true,
      data: {
        ...apiUsage,
        status: apiUsage.hasApiKey ? 'Available' : 'API Key Required'
      }
    });

  } catch (error) {
    logger.error('Error getting news API status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API status'
    });
  }
});

module.exports = router;