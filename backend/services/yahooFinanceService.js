const axios = require('axios');
const { logger } = require('../middleware/errorHandler');
const { setCache, getFromCache } = require('../config/database');

class YahooFinanceService {
  constructor() {
    this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.quotesURL = 'https://query1.finance.yahoo.com/v7/finance/quote';
    this.searchURL = 'https://query1.finance.yahoo.com/v1/finance/search';
    this.historyURL = 'https://query1.finance.yahoo.com/v8/finance/chart';
    
    // Rate limiting configuration
    this.requestDelay = 100; // 100ms between requests
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Cache configuration
    this.cacheTimeout = 60; // 1 minute for real-time data
    this.historicalCacheTimeout = 3600; // 1 hour for historical data
    
    // Request queue for rate limiting
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    this.setupAxiosDefaults();
  }

  setupAxiosDefaults() {
    // Set default headers to mimic browser requests
    axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.9';
    axios.defaults.timeout = 10000; // 10 second timeout
  }

  /**
   * Add Indian stock suffix if not present
   * @param {string} symbol - Stock symbol
   * @returns {string} Symbol with appropriate suffix
   */
  formatIndianSymbol(symbol) {
    if (!symbol) return symbol;
    
    const upperSymbol = symbol.toUpperCase();
    
    // If already has suffix, return as is
    if (upperSymbol.includes('.NS') || upperSymbol.includes('.BO')) {
      return upperSymbol;
    }
    
    // Add .NS suffix for NSE stocks (default)
    return `${upperSymbol}.NS`;
  }

  /**
   * Process request queue with rate limiting
   */
  async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { resolve, reject, requestFn } = this.requestQueue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Rate limiting delay
      if (this.requestQueue.length > 0) {
        await this.delay(this.requestDelay);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Add request to queue for rate limiting
   * @param {Function} requestFn - Function that makes the API request
   * @returns {Promise} Promise that resolves with the API response
   */
  queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, requestFn });
      this.processRequestQueue();
    });
  }

  /**
   * Delay utility function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} API response
   */
  async makeRequest(url, config = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(url, config);
        
        if (response.data && response.data.chart && response.data.chart.error) {
          throw new Error(`Yahoo Finance API Error: ${response.data.chart.error.description}`);
        }

        return response.data;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          break;
        }

        // Exponential backoff
        const delayTime = this.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(`Yahoo Finance API request failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delayTime}ms:`, error.message);
        
        await this.delay(delayTime);
      }
    }

    throw lastError;
  }

  /**
   * Get real-time stock quote
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Stock quote data
   */
  async getQuote(symbol) {
    const formattedSymbol = this.formatIndianSymbol(symbol);
    const cacheKey = `yahoo_quote_${formattedSymbol}`;

    try {
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for quote: ${formattedSymbol}`);
        return cachedData;
      }

      // Make API request through queue
      const data = await this.queueRequest(async () => {
        const url = `${this.quotesURL}?symbols=${formattedSymbol}`;
        return await this.makeRequest(url);
      });

      if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
        throw new Error(`No quote data found for symbol: ${formattedSymbol}`);
      }

      const quote = data.quoteResponse.result[0];
      const transformedData = this.transformQuoteData(quote);

      // Cache the result
      await setCache(cacheKey, transformedData, this.cacheTimeout);

      logger.info(`Successfully fetched quote for: ${formattedSymbol}`);
      return transformedData;

    } catch (error) {
      logger.error(`Failed to fetch quote for ${formattedSymbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get multiple stock quotes
   * @param {Array<string>} symbols - Array of stock symbols
   * @returns {Promise<Array<Object>>} Array of stock quote data
   */
  async getMultipleQuotes(symbols) {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    const formattedSymbols = symbols.map(symbol => this.formatIndianSymbol(symbol));
    const symbolsString = formattedSymbols.join(',');
    const cacheKey = `yahoo_quotes_${symbolsString.replace(/,/g, '_')}`;

    try {
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for multiple quotes: ${formattedSymbols.length} symbols`);
        return cachedData;
      }

      // Make API request through queue
      const data = await this.queueRequest(async () => {
        const url = `${this.quotesURL}?symbols=${symbolsString}`;
        return await this.makeRequest(url);
      });

      if (!data.quoteResponse || !data.quoteResponse.result) {
        throw new Error('No quote data found for symbols');
      }

      const quotes = data.quoteResponse.result.map(quote => this.transformQuoteData(quote));

      // Cache the result
      await setCache(cacheKey, quotes, this.cacheTimeout);

      logger.info(`Successfully fetched ${quotes.length} quotes`);
      return quotes;

    } catch (error) {
      logger.error(`Failed to fetch multiple quotes:`, error.message);
      throw error;
    }
  }

  /**
   * Get historical stock data
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
   * @param {string} interval - Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
   * @returns {Promise<Object>} Historical data
   */
  async getHistoricalData(symbol, period = '1mo', interval = '1d') {
    const formattedSymbol = this.formatIndianSymbol(symbol);
    const cacheKey = `yahoo_history_${formattedSymbol}_${period}_${interval}`;

    try {
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for historical data: ${formattedSymbol}`);
        return cachedData;
      }

      // Make API request through queue
      const data = await this.queueRequest(async () => {
        const url = `${this.historyURL}/${formattedSymbol}?period1=0&period2=9999999999&interval=${interval}&range=${period}`;
        return await this.makeRequest(url);
      });

      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error(`No historical data found for symbol: ${formattedSymbol}`);
      }

      const result = data.chart.result[0];
      const transformedData = this.transformHistoricalData(result);

      // Cache the result (longer cache time for historical data)
      await setCache(cacheKey, transformedData, this.historicalCacheTimeout);

      logger.info(`Successfully fetched historical data for: ${formattedSymbol}`);
      return transformedData;

    } catch (error) {
      logger.error(`Failed to fetch historical data for ${formattedSymbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Search for stocks
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array<Object>>} Search results
   */
  async searchStocks(query, limit = 10) {
    const cacheKey = `yahoo_search_${query}_${limit}`;

    try {
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for search: ${query}`);
        return cachedData;
      }

      // Make API request through queue
      const data = await this.queueRequest(async () => {
        const url = `${this.searchURL}?q=${encodeURIComponent(query)}&quotesCount=${limit}&newsCount=0`;
        return await this.makeRequest(url);
      });

      if (!data.quotes) {
        return [];
      }

      // Filter for Indian stocks and transform data
      const indianStocks = data.quotes
        .filter(quote => quote.symbol && (quote.symbol.includes('.NS') || quote.symbol.includes('.BO')))
        .map(quote => this.transformSearchResult(quote))
        .slice(0, limit);

      // Cache the result
      await setCache(cacheKey, indianStocks, 300); // 5 minutes cache for search

      logger.info(`Successfully searched stocks for: ${query}, found ${indianStocks.length} results`);
      return indianStocks;

    } catch (error) {
      logger.error(`Failed to search stocks for ${query}:`, error.message);
      throw error;
    }
  }

  /**
   * Transform quote data to consistent format
   * @param {Object} quote - Raw quote data from Yahoo Finance
   * @returns {Object} Transformed quote data
   */
  transformQuoteData(quote) {
    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      currentPrice: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      priceChange: quote.regularMarketChange || 0,
      priceChangePercent: quote.regularMarketChangePercent || 0,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageDailyVolume3Month || 0,
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE || null,
      eps: quote.trailingEps || null,
      dividendYield: quote.dividendYield || null,
      weekHigh52: quote.fiftyTwoWeekHigh || 0,
      weekLow52: quote.fiftyTwoWeekLow || 0,
      currency: quote.currency || 'INR',
      exchange: quote.fullExchangeName || quote.exchange || 'NSE',
      marketState: quote.marketState || 'REGULAR',
      isMarketOpen: quote.marketState === 'REGULAR',
      lastUpdated: new Date(),
      source: 'yahoo_finance'
    };
  }

  /**
   * Transform historical data to consistent format
   * @param {Object} data - Raw historical data from Yahoo Finance
   * @returns {Object} Transformed historical data
   */
  transformHistoricalData(data) {
    const meta = data.meta;
    const timestamps = data.timestamp || [];
    const indicators = data.indicators?.quote?.[0] || {};
    const adjClose = data.indicators?.adjclose?.[0]?.adjclose || [];

    const ohlcData = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000),
      timestamp: timestamp,
      open: indicators.open?.[index] || null,
      high: indicators.high?.[index] || null,
      low: indicators.low?.[index] || null,
      close: indicators.close?.[index] || null,
      adjClose: adjClose[index] || null,
      volume: indicators.volume?.[index] || null
    })).filter(item => item.close !== null);

    return {
      symbol: meta.symbol,
      currency: meta.currency,
      exchangeName: meta.exchangeName,
      instrumentType: meta.instrumentType,
      firstTradeDate: meta.firstTradeDate ? new Date(meta.firstTradeDate * 1000) : null,
      regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : null,
      gmtoffset: meta.gmtoffset,
      timezone: meta.timezone,
      exchangeTimezoneName: meta.exchangeTimezoneName,
      currentTradingPeriod: meta.currentTradingPeriod,
      dataGranularity: meta.dataGranularity,
      range: meta.range,
      validRanges: meta.validRanges,
      data: ohlcData,
      count: ohlcData.length,
      lastUpdated: new Date(),
      source: 'yahoo_finance'
    };
  }

  /**
   * Transform search result to consistent format
   * @param {Object} result - Raw search result from Yahoo Finance
   * @returns {Object} Transformed search result
   */
  transformSearchResult(result) {
    return {
      symbol: result.symbol,
      name: result.longname || result.shortname || result.symbol,
      exchange: result.exchDisp || result.exchange,
      type: result.quoteType || result.typeDisp,
      sector: result.sector || null,
      industry: result.industry || null,
      score: result.score || 0,
      source: 'yahoo_finance'
    };
  }

  /**
   * Get market status for Indian exchanges
   * @returns {Promise<Object>} Market status information
   */
  async getMarketStatus() {
    const cacheKey = 'yahoo_market_status';

    try {
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Get quotes for major Indian indices to determine market status
      const indices = ['NSEI', 'BSESN']; // Nifty 50 and BSE Sensex
      const quotes = await this.getMultipleQuotes(indices);

      const marketStatus = {
        isOpen: quotes.some(quote => quote.isMarketOpen),
        exchanges: {
          NSE: {
            isOpen: quotes.find(q => q.symbol.includes('NSEI'))?.isMarketOpen || false,
            lastUpdate: new Date()
          },
          BSE: {
            isOpen: quotes.find(q => q.symbol.includes('BSESN'))?.isMarketOpen || false,
            lastUpdate: new Date()
          }
        },
        timezone: 'Asia/Kolkata',
        lastUpdated: new Date(),
        source: 'yahoo_finance'
      };

      // Cache for 5 minutes
      await setCache(cacheKey, marketStatus, 300);

      return marketStatus;

    } catch (error) {
      logger.error('Failed to get market status:', error.message);
      
      // Return default status if API fails
      return {
        isOpen: false,
        exchanges: {
          NSE: { isOpen: false, lastUpdate: new Date() },
          BSE: { isOpen: false, lastUpdate: new Date() }
        },
        timezone: 'Asia/Kolkata',
        lastUpdated: new Date(),
        source: 'yahoo_finance',
        error: error.message
      };
    }
  }

  /**
   * Get popular Indian stocks
   * @returns {Promise<Array<Object>>} Popular stocks data
   */
  async getPopularIndianStocks() {
    const popularSymbols = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
      'ICICIBANK.NS', 'KOTAKBANK.NS', 'BHARTIARTL.NS', 'ITC.NS', 'SBIN.NS',
      'LT.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'MARUTI.NS', 'BAJFINANCE.NS'
    ];

    try {
      const quotes = await this.getMultipleQuotes(popularSymbols);
      return quotes.sort((a, b) => b.marketCap - a.marketCap);
    } catch (error) {
      logger.error('Failed to get popular Indian stocks:', error.message);
      throw error;
    }
  }
}

module.exports = YahooFinanceService;