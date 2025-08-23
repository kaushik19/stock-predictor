const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: General
 *     description: General API endpoints
 *   - name: Health
 *     description: Health check endpoints
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Stocks
 *     description: Stock data and analysis endpoints
 *   - name: Recommendations
 *     description: Stock recommendation endpoints
 *   - name: Portfolio
 *     description: Portfolio management endpoints
 *   - name: Watchlist
 *     description: Watchlist management endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Returns basic information about the API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Indian Stock Predictor API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 status:
 *                   type: string
 *                   example: Running
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: /health
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     stocks:
 *                       type: string
 *                       example: /api/stocks
 *                     recommendations:
 *                       type: string
 *                       example: /api/recommendations
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Indian Stock Predictor API',
    version: '1.0.0',
    status: 'Running',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      stocks: '/api/stocks',
      recommendations: '/api/recommendations',
      portfolio: '/api/portfolio',
      watchlist: '/api/watchlist'
    },
    features: [
      'Real-time stock data',
      'Multi-timeframe predictions',
      'News sentiment analysis',
      'Portfolio management',
      'Watchlist tracking'
    ]
  });
});

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Detailed API status
 *     description: Returns detailed status information including system metrics
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Detailed status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                   example: development
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 *                 version:
 *                   type: object
 *                   properties:
 *                     node:
 *                       type: string
 *                     api:
 *                       type: string
 */
router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
    },
    version: {
      node: process.version,
      api: '1.0.0'
    },
    pid: process.pid
  });
});

module.exports = router;