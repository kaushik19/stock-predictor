const axios = require('axios');
const { logger } = require('../middleware/errorHandler');
const { setCache, getFromCache } = require('../config/database');

/**
 * News and Sentiment Analysis Service
 * Provides financial news fetching and basic sentiment analysis
 */
class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsApiUrl = 'https://newsapi.org/v2';
    this.cacheTimeout = 1800; // 30 minutes cache for news
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;

    // Sentiment analysis keywords
    this.positiveKeywords = [
      'profit', 'growth', 'increase', 'rise', 'gain', 'positive', 'strong', 'good', 'excellent',
      'bullish', 'optimistic', 'upgrade', 'buy', 'outperform', 'beat', 'exceed', 'success',
      'expansion', 'recovery', 'boom', 'surge', 'rally', 'breakthrough', 'milestone',
      'dividend', 'bonus', 'acquisition', 'merger', 'partnership', 'launch', 'innovation'
    ];

    this.negativeKeywords = [
      'loss', 'decline', 'decrease', 'fall', 'drop', 'negative', 'weak', 'bad', 'poor',
      'bearish', 'pessimistic', 'downgrade', 'sell', 'underperform', 'miss', 'disappoint',
      'crisis', 'recession', 'crash', 'plunge', 'slump', 'concern', 'risk', 'warning',
      'debt', 'bankruptcy', 'lawsuit', 'scandal', 'fraud', 'investigation', 'penalty'
    ];

    if (!this.newsApiKey) {
      logger.warn('News API key not found. News features will be limited.');
    }
  }

  /**
   * Rate limiting to avoid overwhelming the API
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get general financial news
   * @param {Object} options - Search options
   * @returns {Array} Array of news articles
   */
  async getFinancialNews(options = {}) {
    if (!this.newsApiKey) {
      throw new Error('News API key not configured');
    }

    try {
      await this.rateLimit();

      const {
        category = 'business',
        country = 'in',
        pageSize = 20,
        page = 1
      } = options;

      const cacheKey = `news_general_${category}_${country}_${page}_${pageSize}`;
      
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug('Cache hit for general financial news');
        return cachedData;
      }

      const params = {
        category,
        country,
        pageSize,
        page,
        apiKey: this.newsApiKey
      };

      const response = await axios.get(`${this.newsApiUrl}/top-headlines`, {
        params,
        timeout: 10000
      });

      if (response.data.status !== 'ok') {
        throw new Error(`News API Error: ${response.data.message || 'Unknown error'}`);
      }

      const articles = response.data.articles || [];
      const processedArticles = articles.map(article => this.processArticle(article));
      
      // Cache the result
      await setCache(cacheKey, processedArticles, this.cacheTimeout);
      
      logger.info(`Fetched ${processedArticles.length} general financial news articles`);
      return processedArticles;

    } catch (error) {
      logger.error('Error fetching financial news:', error.message);
      throw new Error(`Failed to fetch financial news: ${error.message}`);
    }
  }

  /**
   * Search for news articles by query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of news articles
   */
  async searchNews(query, options = {}) {
    if (!this.newsApiKey) {
      throw new Error('News API key not configured');
    }

    try {
      await this.rateLimit();

      const {
        sortBy = 'publishedAt',
        pageSize = 20,
        page = 1,
        language = 'en',
        from = null,
        to = null
      } = options;

      const cacheKey = `news_search_${encodeURIComponent(query)}_${sortBy}_${page}_${pageSize}`;
      
      // Check cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for news search: ${query}`);
        return cachedData;
      }

      const params = {
        q: query,
        sortBy,
        pageSize,
        page,
        language,
        apiKey: this.newsApiKey
      };

      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axios.get(`${this.newsApiUrl}/everything`, {
        params,
        timeout: 10000
      });

      if (response.data.status !== 'ok') {
        throw new Error(`News API Error: ${response.data.message || 'Unknown error'}`);
      }

      const articles = response.data.articles || [];
      const processedArticles = articles.map(article => this.processArticle(article));
      
      // Cache the result
      await setCache(cacheKey, processedArticles, this.cacheTimeout);
      
      logger.info(`Found ${processedArticles.length} articles for query: ${query}`);
      return processedArticles;

    } catch (error) {
      logger.error(`Error searching news for '${query}':`, error.message);
      throw new Error(`Failed to search news: ${error.message}`);
    }
  }

  /**
   * Get news for a specific stock
   * @param {string} symbol - Stock symbol
   * @param {string} companyName - Company name
   * @param {Object} options - Search options
   * @returns {Array} Array of news articles
   */
  async getStockNews(symbol, companyName, options = {}) {
    try {
      const {
        pageSize = 10,
        days = 7
      } = options;

      // Create search queries for the stock
      const queries = [
        `"${companyName}"`,
        `"${symbol}"`,
        `${companyName} stock`,
        `${companyName} share price`
      ];

      // Calculate date range
      const to = new Date().toISOString();
      const from = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();

      const allArticles = [];
      const seenUrls = new Set();

      // Search with different queries and combine results
      for (const query of queries) {
        try {
          const articles = await this.searchNews(query, {
            pageSize: Math.ceil(pageSize / queries.length),
            from,
            to,
            sortBy: 'publishedAt'
          });

          // Filter out duplicates and add to results
          articles.forEach(article => {
            if (!seenUrls.has(article.url)) {
              seenUrls.add(article.url);
              allArticles.push({
                ...article,
                relevanceScore: this.calculateRelevanceScore(article, symbol, companyName)
              });
            }
          });
        } catch (error) {
          logger.warn(`Failed to fetch news for query '${query}':`, error.message);
        }
      }

      // Sort by relevance and recency, then limit results
      const sortedArticles = allArticles
        .sort((a, b) => {
          // First sort by relevance score
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          // Then by publish date
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        })
        .slice(0, pageSize);

      logger.info(`Found ${sortedArticles.length} relevant articles for ${symbol}`);
      return sortedArticles;

    } catch (error) {
      logger.error(`Error fetching stock news for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get trending stocks based on news frequency
   * @param {Array} stockList - List of stocks to analyze
   * @param {Object} options - Analysis options
   * @returns {Array} Array of trending stocks with news counts
   */
  async getTrendingStocks(stockList, options = {}) {
    try {
      const {
        days = 1,
        minArticles = 3
      } = options;

      const trendingData = [];
      const from = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
      const to = new Date().toISOString();

      // Analyze news frequency for each stock
      for (const stock of stockList) {
        try {
          const articles = await this.searchNews(`"${stock.symbol}" OR "${stock.name}"`, {
            pageSize: 100,
            from,
            to,
            sortBy: 'publishedAt'
          });

          const relevantArticles = articles.filter(article => 
            this.calculateRelevanceScore(article, stock.symbol, stock.name) > 0.3
          );

          if (relevantArticles.length >= minArticles) {
            const sentimentAnalysis = this.analyzeSentiment(relevantArticles);
            
            trendingData.push({
              symbol: stock.symbol,
              name: stock.name,
              articleCount: relevantArticles.length,
              sentiment: sentimentAnalysis,
              trendingScore: this.calculateTrendingScore(relevantArticles, sentimentAnalysis),
              latestArticle: relevantArticles[0] || null
            });
          }
        } catch (error) {
          logger.warn(`Failed to analyze trending for ${stock.symbol}:`, error.message);
        }
      }

      // Sort by trending score
      const sortedTrending = trendingData
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 20); // Top 20 trending stocks

      logger.info(`Identified ${sortedTrending.length} trending stocks`);
      return sortedTrending;

    } catch (error) {
      logger.error('Error analyzing trending stocks:', error.message);
      throw error;
    }
  }

  /**
   * Process a raw news article
   * @param {Object} article - Raw article from News API
   * @returns {Object} Processed article
   */
  processArticle(article) {
    const processed = {
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        id: article.source?.id,
        name: article.source?.name
      },
      author: article.author
    };

    // Add sentiment analysis
    processed.sentiment = this.analyzeSentiment([processed]);

    return processed;
  }

  /**
   * Calculate relevance score for an article
   * @param {Object} article - News article
   * @param {string} symbol - Stock symbol
   * @param {string} companyName - Company name
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevanceScore(article, symbol, companyName) {
    let score = 0;
    const text = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
    
    // Check for exact symbol match
    if (text.includes(symbol.toLowerCase())) {
      score += 0.4;
    }

    // Check for company name match
    const companyWords = companyName.toLowerCase().split(' ');
    const matchedWords = companyWords.filter(word => 
      word.length > 2 && text.includes(word)
    );
    score += (matchedWords.length / companyWords.length) * 0.4;

    // Check for financial keywords
    const financialKeywords = ['stock', 'share', 'price', 'market', 'trading', 'investor', 'earnings', 'revenue'];
    const financialMatches = financialKeywords.filter(keyword => text.includes(keyword));
    score += (financialMatches.length / financialKeywords.length) * 0.2;

    return Math.min(score, 1);
  }

  /**
   * Analyze sentiment of articles
   * @param {Array} articles - Array of articles
   * @returns {Object} Sentiment analysis results
   */
  analyzeSentiment(articles) {
    if (!articles || articles.length === 0) {
      return {
        overall: 'neutral',
        score: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        confidence: 0
      };
    }

    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;

    articles.forEach(article => {
      const text = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
      
      let positiveCount = 0;
      let negativeCount = 0;

      // Count positive keywords
      this.positiveKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          positiveCount += matches.length;
        }
      });

      // Count negative keywords
      this.negativeKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          negativeCount += matches.length;
        }
      });

      // Classify article sentiment
      if (positiveCount > negativeCount) {
        totalPositive++;
      } else if (negativeCount > positiveCount) {
        totalNegative++;
      } else {
        totalNeutral++;
      }
    });

    const total = articles.length;
    const positiveRatio = totalPositive / total;
    const negativeRatio = totalNegative / total;
    const neutralRatio = totalNeutral / total;

    // Calculate overall sentiment
    let overall = 'neutral';
    let score = 0;

    if (positiveRatio > negativeRatio && positiveRatio > 0.4) {
      overall = 'positive';
      score = positiveRatio - negativeRatio;
    } else if (negativeRatio > positiveRatio && negativeRatio > 0.4) {
      overall = 'negative';
      score = negativeRatio - positiveRatio;
    }

    // Calculate confidence based on the difference between positive and negative
    const confidence = Math.abs(positiveRatio - negativeRatio);

    return {
      overall,
      score: Math.round(score * 100) / 100,
      positive: Math.round(positiveRatio * 100),
      negative: Math.round(negativeRatio * 100),
      neutral: Math.round(neutralRatio * 100),
      confidence: Math.round(confidence * 100),
      totalArticles: total
    };
  }

  /**
   * Calculate trending score based on article count and sentiment
   * @param {Array} articles - Array of articles
   * @param {Object} sentiment - Sentiment analysis results
   * @returns {number} Trending score
   */
  calculateTrendingScore(articles, sentiment) {
    const articleCount = articles.length;
    const recencyBonus = this.calculateRecencyBonus(articles);
    const sentimentMultiplier = this.getSentimentMultiplier(sentiment);
    
    // Base score from article count (logarithmic to prevent extreme values)
    const baseScore = Math.log(articleCount + 1) * 10;
    
    // Apply recency bonus (more recent articles get higher scores)
    const recencyScore = baseScore * (1 + recencyBonus);
    
    // Apply sentiment multiplier
    const finalScore = recencyScore * sentimentMultiplier;
    
    return Math.round(finalScore * 100) / 100;
  }

  /**
   * Calculate recency bonus for articles
   * @param {Array} articles - Array of articles
   * @returns {number} Recency bonus (0-1)
   */
  calculateRecencyBonus(articles) {
    if (!articles || articles.length === 0) return 0;

    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    let totalRecencyScore = 0;
    
    articles.forEach(article => {
      const publishTime = new Date(article.publishedAt).getTime();
      const hoursAgo = (now - publishTime) / hourInMs;
      
      // Articles get higher scores if they're more recent
      // Score decreases exponentially with time
      const recencyScore = Math.exp(-hoursAgo / 24); // 24-hour half-life
      totalRecencyScore += recencyScore;
    });
    
    return totalRecencyScore / articles.length;
  }

  /**
   * Get sentiment multiplier for trending score
   * @param {Object} sentiment - Sentiment analysis results
   * @returns {number} Sentiment multiplier
   */
  getSentimentMultiplier(sentiment) {
    if (sentiment.overall === 'positive') {
      return 1 + (sentiment.confidence / 100) * 0.5; // Up to 1.5x for strong positive
    } else if (sentiment.overall === 'negative') {
      return 1 + (sentiment.confidence / 100) * 0.3; // Up to 1.3x for strong negative (controversy drives attention)
    }
    return 1; // Neutral sentiment doesn't affect trending score
  }

  /**
   * Get market sentiment overview
   * @param {Object} options - Analysis options
   * @returns {Object} Market sentiment overview
   */
  async getMarketSentiment(options = {}) {
    try {
      const {
        days = 1,
        pageSize = 100
      } = options;

      const from = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
      const to = new Date().toISOString();

      // Search for general market news
      const marketQueries = [
        'Indian stock market',
        'NSE BSE',
        'Sensex Nifty',
        'Indian economy',
        'stock market India'
      ];

      const allArticles = [];
      const seenUrls = new Set();

      for (const query of marketQueries) {
        try {
          const articles = await this.searchNews(query, {
            pageSize: Math.ceil(pageSize / marketQueries.length),
            from,
            to,
            sortBy: 'publishedAt'
          });

          articles.forEach(article => {
            if (!seenUrls.has(article.url)) {
              seenUrls.add(article.url);
              allArticles.push(article);
            }
          });
        } catch (error) {
          logger.warn(`Failed to fetch market news for query '${query}':`, error.message);
        }
      }

      const sentiment = this.analyzeSentiment(allArticles);
      
      return {
        sentiment,
        articleCount: allArticles.length,
        timeframe: `${days} day${days > 1 ? 's' : ''}`,
        lastUpdated: new Date().toISOString(),
        topArticles: allArticles
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 5)
      };

    } catch (error) {
      logger.error('Error analyzing market sentiment:', error.message);
      throw error;
    }
  }

  /**
   * Get API usage statistics
   * @returns {Object} API usage info
   */
  getApiUsage() {
    return {
      hasApiKey: !!this.newsApiKey,
      rateLimitDelay: this.rateLimitDelay,
      lastRequestTime: this.lastRequestTime,
      positiveKeywordsCount: this.positiveKeywords.length,
      negativeKeywordsCount: this.negativeKeywords.length
    };
  }
}

module.exports = new NewsService();