const YahooFinanceService = require('../services/yahooFinanceService');

// Mock axios to avoid making real API calls during tests
jest.mock('axios');
const axios = require('axios');

// Mock cache functions
jest.mock('../config/database', () => ({
  getFromCache: jest.fn(),
  setCache: jest.fn(),
  deleteFromCache: jest.fn()
}));

const { getFromCache, setCache } = require('../config/database');

describe('YahooFinanceService', () => {
  let yahooFinance;

  beforeEach(() => {
    yahooFinance = new YahooFinanceService();
    jest.clearAllMocks();
  });

  describe('formatIndianSymbol', () => {
    test('should add .NS suffix to symbol without suffix', () => {
      expect(yahooFinance.formatIndianSymbol('RELIANCE')).toBe('RELIANCE.NS');
      expect(yahooFinance.formatIndianSymbol('tcs')).toBe('TCS.NS');
    });

    test('should keep existing .NS suffix', () => {
      expect(yahooFinance.formatIndianSymbol('RELIANCE.NS')).toBe('RELIANCE.NS');
    });

    test('should keep existing .BO suffix', () => {
      expect(yahooFinance.formatIndianSymbol('RELIANCE.BO')).toBe('RELIANCE.BO');
    });

    test('should handle null/undefined symbols', () => {
      expect(yahooFinance.formatIndianSymbol(null)).toBe(null);
      expect(yahooFinance.formatIndianSymbol(undefined)).toBe(undefined);
    });
  });

  describe('transformQuoteData', () => {
    test('should transform Yahoo Finance quote data correctly', () => {
      const mockQuote = {
        symbol: 'RELIANCE.NS',
        longName: 'Reliance Industries Limited',
        regularMarketPrice: 2450.75,
        regularMarketPreviousClose: 2425.45,
        regularMarketChange: 25.30,
        regularMarketChangePercent: 1.04,
        regularMarketDayHigh: 2465.80,
        regularMarketDayLow: 2420.50,
        regularMarketVolume: 2500000,
        marketCap: 1650000000000,
        trailingPE: 28.5,
        trailingEps: 86.2,
        fiftyTwoWeekHigh: 2856.15,
        fiftyTwoWeekLow: 2220.30,
        currency: 'INR',
        fullExchangeName: 'National Stock Exchange of India',
        marketState: 'REGULAR'
      };

      const transformed = yahooFinance.transformQuoteData(mockQuote);

      expect(transformed).toEqual({
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Limited',
        currentPrice: 2450.75,
        previousClose: 2425.45,
        priceChange: 25.30,
        priceChangePercent: 1.04,
        dayHigh: 2465.80,
        dayLow: 2420.50,
        volume: 2500000,
        avgVolume: 0,
        marketCap: 1650000000000,
        peRatio: 28.5,
        eps: 86.2,
        dividendYield: null,
        weekHigh52: 2856.15,
        weekLow52: 2220.30,
        currency: 'INR',
        exchange: 'National Stock Exchange of India',
        marketState: 'REGULAR',
        isMarketOpen: true,
        lastUpdated: expect.any(Date),
        source: 'yahoo_finance'
      });
    });

    test('should handle missing fields with defaults', () => {
      const mockQuote = {
        symbol: 'TEST.NS'
      };

      const transformed = yahooFinance.transformQuoteData(mockQuote);

      expect(transformed.currentPrice).toBe(0);
      expect(transformed.priceChange).toBe(0);
      expect(transformed.volume).toBe(0);
      expect(transformed.marketCap).toBe(0);
      expect(transformed.peRatio).toBe(null);
      expect(transformed.currency).toBe('INR');
      expect(transformed.exchange).toBe('NSE');
    });
  });

  describe('transformHistoricalData', () => {
    test('should transform historical data correctly', () => {
      const mockData = {
        meta: {
          symbol: 'RELIANCE.NS',
          currency: 'INR',
          exchangeName: 'NSE',
          instrumentType: 'EQUITY',
          firstTradeDate: 1234567890,
          regularMarketTime: 1234567890,
          gmtoffset: 19800,
          timezone: 'IST',
          exchangeTimezoneName: 'Asia/Kolkata',
          dataGranularity: '1d',
          range: '1mo',
          validRanges: ['1d', '5d', '1mo']
        },
        timestamp: [1234567890, 1234654290],
        indicators: {
          quote: [{
            open: [2400.00, 2450.00],
            high: [2465.00, 2480.00],
            low: [2390.00, 2440.00],
            close: [2450.00, 2470.00],
            volume: [2500000, 2600000]
          }],
          adjclose: [{
            adjclose: [2450.00, 2470.00]
          }]
        }
      };

      const transformed = yahooFinance.transformHistoricalData(mockData);

      expect(transformed.symbol).toBe('RELIANCE.NS');
      expect(transformed.currency).toBe('INR');
      expect(transformed.data).toHaveLength(2);
      expect(transformed.data[0]).toEqual({
        date: new Date(1234567890 * 1000),
        timestamp: 1234567890,
        open: 2400.00,
        high: 2465.00,
        low: 2390.00,
        close: 2450.00,
        adjClose: 2450.00,
        volume: 2500000
      });
      expect(transformed.source).toBe('yahoo_finance');
    });
  });

  describe('getQuote', () => {
    test('should return cached data if available', async () => {
      const mockCachedData = {
        symbol: 'RELIANCE.NS',
        currentPrice: 2450.75,
        source: 'yahoo_finance'
      };

      getFromCache.mockResolvedValue(mockCachedData);

      const result = await yahooFinance.getQuote('RELIANCE');

      expect(getFromCache).toHaveBeenCalledWith('yahoo_quote_RELIANCE.NS');
      expect(result).toEqual(mockCachedData);
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('should fetch from API if not cached', async () => {
      const mockApiResponse = {
        data: {
          quoteResponse: {
            result: [{
              symbol: 'RELIANCE.NS',
              longName: 'Reliance Industries Limited',
              regularMarketPrice: 2450.75,
              regularMarketChange: 25.30,
              regularMarketChangePercent: 1.04
            }]
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await yahooFinance.getQuote('RELIANCE');

      expect(axios.get).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(result.symbol).toBe('RELIANCE.NS');
      expect(result.name).toBe('Reliance Industries Limited');
      expect(result.currentPrice).toBe(2450.75);
    });

    test('should throw error if no quote data found', async () => {
      const mockApiResponse = {
        data: {
          quoteResponse: {
            result: []
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      await expect(yahooFinance.getQuote('INVALID')).rejects.toThrow('No quote data found for symbol: INVALID.NS');
    });

    test('should handle API errors with retry logic', async () => {
      getFromCache.mockResolvedValue(null);
      axios.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            quoteResponse: {
              result: [{
                symbol: 'RELIANCE.NS',
                regularMarketPrice: 2450.75
              }]
            }
          }
        });

      const result = await yahooFinance.getQuote('RELIANCE');

      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(result.symbol).toBe('RELIANCE.NS');
    });
  });

  describe('getMultipleQuotes', () => {
    test('should handle empty symbols array', async () => {
      const result = await yahooFinance.getMultipleQuotes([]);
      expect(result).toEqual([]);
    });

    test('should fetch multiple quotes successfully', async () => {
      const mockApiResponse = {
        data: {
          quoteResponse: {
            result: [
              {
                symbol: 'RELIANCE.NS',
                regularMarketPrice: 2450.75
              },
              {
                symbol: 'TCS.NS',
                regularMarketPrice: 3520.40
              }
            ]
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await yahooFinance.getMultipleQuotes(['RELIANCE', 'TCS']);

      expect(result).toHaveLength(2);
      expect(result[0].symbol).toBe('RELIANCE.NS');
      expect(result[1].symbol).toBe('TCS.NS');
    });
  });

  describe('searchStocks', () => {
    test('should search and filter Indian stocks', async () => {
      const mockApiResponse = {
        data: {
          quotes: [
            {
              symbol: 'RELIANCE.NS',
              longname: 'Reliance Industries Limited',
              exchDisp: 'NSE'
            },
            {
              symbol: 'AAPL',
              longname: 'Apple Inc.',
              exchDisp: 'NASDAQ'
            },
            {
              symbol: 'TCS.BO',
              longname: 'Tata Consultancy Services',
              exchDisp: 'BSE'
            }
          ]
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await yahooFinance.searchStocks('reliance', 10);

      expect(result).toHaveLength(2); // Only Indian stocks (.NS and .BO)
      expect(result[0].symbol).toBe('RELIANCE.NS');
      expect(result[1].symbol).toBe('TCS.BO');
    });
  });

  describe('getMarketStatus', () => {
    test('should return market status based on indices', async () => {
      const mockApiResponse = {
        data: {
          quoteResponse: {
            result: [
              {
                symbol: 'NSEI',
                marketState: 'REGULAR'
              },
              {
                symbol: 'BSESN',
                marketState: 'CLOSED'
              }
            ]
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      const result = await yahooFinance.getMarketStatus();

      expect(result.isOpen).toBe(true); // At least one market is open
      expect(result.exchanges.NSE.isOpen).toBe(true);
      expect(result.exchanges.BSE.isOpen).toBe(false);
      expect(result.timezone).toBe('Asia/Kolkata');
    });

    test('should return default status on API failure', async () => {
      getFromCache.mockResolvedValue(null);
      axios.get.mockRejectedValue(new Error('API Error'));

      const result = await yahooFinance.getMarketStatus();

      expect(result.isOpen).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('delay', () => {
    test('should delay execution', async () => {
      const start = Date.now();
      await yahooFinance.delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });
});

describe('YahooFinanceService Integration', () => {
  let yahooFinance;

  beforeEach(() => {
    yahooFinance = new YahooFinanceService();
  });

  describe('Rate Limiting', () => {
    test('should process requests sequentially', async () => {
      const mockApiResponse = {
        data: {
          quoteResponse: {
            result: [{
              symbol: 'TEST.NS',
              regularMarketPrice: 100
            }]
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockApiResponse);

      const startTime = Date.now();
      
      // Queue multiple requests
      const promises = [
        yahooFinance.getQuote('TEST1'),
        yahooFinance.getQuote('TEST2'),
        yahooFinance.getQuote('TEST3')
      ];

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 200ms due to rate limiting (100ms * 2 delays)
      expect(duration).toBeGreaterThanOrEqual(150);
    });
  });

  describe('Error Handling', () => {
    test('should handle network timeouts', async () => {
      getFromCache.mockResolvedValue(null);
      axios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'));

      await expect(yahooFinance.getQuote('TEST')).rejects.toThrow('timeout of 10000ms exceeded');
    });

    test('should handle Yahoo Finance API errors', async () => {
      const mockErrorResponse = {
        data: {
          chart: {
            error: {
              description: 'Invalid symbol'
            }
          }
        }
      };

      getFromCache.mockResolvedValue(null);
      axios.get.mockResolvedValue(mockErrorResponse);

      await expect(yahooFinance.getQuote('INVALID')).rejects.toThrow('Yahoo Finance API Error: Invalid symbol');
    });
  });
});