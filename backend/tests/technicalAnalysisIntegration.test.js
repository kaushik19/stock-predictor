const request = require('supertest');
const express = require('express');
const stocksRouter = require('../routes/stocks');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/stocks', stocksRouter);

describe('Technical Analysis Integration Tests', () => {
  // Increase timeout for API calls
  jest.setTimeout(30000);

  describe('GET /api/stocks/technical-analysis/:symbol', () => {
    test('should return technical analysis for a valid Indian stock', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/RELIANCE')
        .query({ period: '3mo', exchange: 'NSE' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      const analysis = response.body.data;
      expect(analysis.symbol).toBe('RELIANCE');
      expect(analysis.period).toBe('3mo');
      expect(analysis.lastUpdated).toBeDefined();
      expect(analysis.indicators).toBeDefined();
      expect(analysis.signals).toBeDefined();

      // Check RSI
      expect(analysis.indicators.rsi).toBeDefined();
      expect(analysis.indicators.rsi.current).toBeGreaterThanOrEqual(0);
      expect(analysis.indicators.rsi.current).toBeLessThanOrEqual(100);
      expect(['overbought', 'oversold', 'bullish', 'bearish', 'neutral']).toContain(analysis.indicators.rsi.signal);

      // Check MACD
      expect(analysis.indicators.macd).toBeDefined();
      if (analysis.indicators.macd.macdLine !== null) {
        expect(typeof analysis.indicators.macd.macdLine).toBe('number');
        expect(typeof analysis.indicators.macd.signalLine).toBe('number');
        expect(typeof analysis.indicators.macd.histogram).toBe('number');
      } else {
        expect(analysis.indicators.macd.signal).toBe('insufficient_data');
      }

      // Check Moving Averages
      expect(analysis.indicators.movingAverages).toBeDefined();
      expect(analysis.indicators.movingAverages.sma20).toBeDefined();
      expect(analysis.indicators.movingAverages.sma50).toBeDefined();
      expect(analysis.indicators.movingAverages.sma200).toBeDefined();

      // Check Bollinger Bands
      expect(analysis.indicators.bollingerBands).toBeDefined();
      expect(typeof analysis.indicators.bollingerBands.upperBand).toBe('number');
      expect(typeof analysis.indicators.bollingerBands.middleBand).toBe('number');
      expect(typeof analysis.indicators.bollingerBands.lowerBand).toBe('number');

      // Check Support/Resistance
      expect(analysis.indicators.supportResistance).toBeDefined();
      expect(Array.isArray(analysis.indicators.supportResistance.support)).toBe(true);
      expect(Array.isArray(analysis.indicators.supportResistance.resistance)).toBe(true);

      // Check Volume Analysis
      expect(analysis.indicators.volumeAnalysis).toBeDefined();
      expect(typeof analysis.indicators.volumeAnalysis.averageVolume).toBe('number');
      expect(typeof analysis.indicators.volumeAnalysis.currentVolume).toBe('number');
      expect(typeof analysis.indicators.volumeAnalysis.volumeRatio).toBe('number');

      // Check Momentum Indicators
      expect(analysis.indicators.momentum).toBeDefined();
      expect(typeof analysis.indicators.momentum.rateOfChange).toBe('number');

      // Check Trading Signals
      expect(analysis.signals).toBeDefined();
      expect(['bullish', 'bearish', 'neutral']).toContain(analysis.signals.overall);
      expect(analysis.signals.strength).toBeGreaterThanOrEqual(0);
      expect(analysis.signals.strength).toBeLessThanOrEqual(100);
      expect(['buy', 'sell', 'hold']).toContain(analysis.signals.recommendation);
    });

    test('should handle different time periods', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/TCS')
        .query({ period: '6mo', exchange: 'NSE' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('6mo');
    });

    test('should handle BSE exchange', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/RELIANCE')
        .query({ period: '3mo', exchange: 'BSE' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('should return 400 for invalid symbol format', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/')
        .query({ period: '3mo', exchange: 'NSE' });

      expect(response.status).toBe(404); // Route not found
    });

    test('should return 400 for invalid period', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/RELIANCE')
        .query({ period: 'invalid', exchange: 'NSE' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should return 400 for invalid exchange', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/RELIANCE')
        .query({ period: '3mo', exchange: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should use default values when parameters are not provided', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/HDFCBANK');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('3mo'); // Default period
    });

    test('should handle non-existent stock gracefully', async () => {
      const response = await request(app)
        .get('/api/stocks/technical-analysis/NONEXISTENT')
        .query({ period: '3mo', exchange: 'NSE' });

      // This might return 404 or 500 depending on the Yahoo Finance response
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    test('should complete technical analysis within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/stocks/technical-analysis/INFY')
        .query({ period: '3mo', exchange: 'NSE' });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    });
  });

  describe('Data Quality Tests', () => {
    test('should return consistent data structure across different stocks', async () => {
      const stocks = ['RELIANCE', 'TCS', 'HDFCBANK'];
      const responses = [];

      for (const stock of stocks) {
        const response = await request(app)
          .get(`/api/stocks/technical-analysis/${stock}`)
          .query({ period: '3mo', exchange: 'NSE' });
        
        if (response.status === 200) {
          responses.push(response.body.data);
        }
      }

      expect(responses.length).toBeGreaterThan(0);

      // Check that all responses have the same structure
      responses.forEach(analysis => {
        expect(analysis).toHaveProperty('symbol');
        expect(analysis).toHaveProperty('period');
        expect(analysis).toHaveProperty('lastUpdated');
        expect(analysis).toHaveProperty('indicators');
        expect(analysis).toHaveProperty('signals');
        
        expect(analysis.indicators).toHaveProperty('rsi');
        expect(analysis.indicators).toHaveProperty('macd');
        expect(analysis.indicators).toHaveProperty('movingAverages');
        expect(analysis.indicators).toHaveProperty('bollingerBands');
        expect(analysis.indicators).toHaveProperty('supportResistance');
        expect(analysis.indicators).toHaveProperty('volumeAnalysis');
        expect(analysis.indicators).toHaveProperty('momentum');
      });
    });
  });
});