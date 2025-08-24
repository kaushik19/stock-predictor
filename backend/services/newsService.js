const axios = require('axios');
const logger = require('../utils/logger');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    // Sentiment analysis keywords
    this.positiveWords = [
      'gain', 'gains', 'rise', 'rises', 'rising', 'up', 'increase', 'increases', 'increasing',
      'bull', 'bullish', 'positive', 'growth', 'profit', 'profits', 'strong', 'strength',
      'surge', 'surges', 'surging', 'rally', 'rallies', 'rallying', 'boom', 'booming',
      'outperform', 'outperforms', 'outperforming', 'beat', 'beats', 'beating', 'exceed',
      'exceeds', 'exceeding', 'record', 'high', 'highs', 'peak', 'peaks', 'soar', 'soars',
      'soaring', 'jump', 'jumps', 'jumping', 'climb', 'climbs', 'climbing', 'advance',
      'advances', 'advancing', 'breakthrough', 'success', 'successful', 'win', 'wins', 'winning'
    ];
    
    this.negativeWords = [
      'fall', 'falls', 'falling', 'drop', 'drops', 'dropping', 'decline', 'declines', 'declining',
      'bear', 'bearish', 'negative', 'loss', 'losses', 'weak', 'weakness', 'crash', 'crashes',
      'crashing', 'plunge', 'plunges', 'plunging', 'slump', 'slumps', 'slumping', 'tumble',
      'tumbles', 'tumbling', 'underperform', 'underperforms', 'underperforming', 'miss',
      'misses', 'missing', 'disappoint', 'disappoints', 'disappointing', 'low', 'lows',
      'bottom', 'bottoms', 'sink', 'sinks', 'sinking', 'slide', 'slides', 'sliding',
      'retreat', 'retreats', 'retreating', 'concern', 'concerns', 'worry', 'worries',
      'fear', 'fears', 'risk', 'risks', 'threat', 'threats', 'problem', 'problems'
    ];

    if (!this.apiKey) {
      logger.warn('News API key not found. News features will be limited.');
    }
  }

  async makeRequest(url, params = {}) {
    if (!this.apiKey) {
      throw new Error('News API key not configured');
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(url, {
        params: {
          ...params,
          apiKey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'News API error');
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('News API rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }

  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getFinancialNews(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      category = 'business',
      language = 'en',
      sortBy = 'publishedAt'
    } = options;

    const cacheKey = this.getCacheKey('financial', { page, pageSize, category, language, sortBy });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseUrl}/top-headlines`;
      const params = {
        category,
        language,
        pageSize: Math.min(pageSize, 100),
        page,
        sortBy
      };

      // Add country for better Indian market coverage
      if (language === 'en') {
        params.country = 'in';
      }

      const data = await this.makeRequest(url, params);
      const articles = this.processArticles(data.articles || []);
      
      this.setCache(cacheKey, articles);
      logger.info(`Fetched ${articles.length} financial news articles`);
      
      return articles;
    } catch (error) {
      logger.error('Error fetching financial news:', error);
      throw error;
    }
  }

  async searchNews(query, options = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'publishedAt',
      language = 'en'
    } = options;

    const cacheKey = this.getCacheKey('search', { query, page, pageSize, sortBy, language });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseUrl}/everything`;
      const params = {
        q: query,
        language,
        pageSize: Math.min(pageSize, 100),
        page,
        sortBy,
        domains: 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,financialexpress.com'
      };

      const data = await this.makeRequest(url, params);
      const articles = this.processArticles(data.articles || []);
      
      this.setCache(cacheKey, articles);
      logger.info(`Found ${articles.length} articles for query: ${query}`);
      
      return articles;
    } catch (error) {
      logger.error('Error searching news:', error);
      throw error;
    }
  }

  async getStockNews(symbol, companyName, options = {}) {
    const {
      page = 1,
      pageSize = 20,
      days = 7
    } = options;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const query = `"${companyName}" OR "${symbol}" stock market India`;
    
    const cacheKey = this.getCacheKey('stock', { symbol, companyName, page, pageSize, days });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseUrl}/everything`;
      const params = {
        q: query,
        language: 'en',
        pageSize: Math.min(pageSize, 50),
        page,
        sortBy: 'publishedAt',
        from: fromDate.toISOString().split('T')[0],
        domains: 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,financialexpress.com,reuters.com,bloomberg.com'
      };

      const data = await this.makeRequest(url, params);
      let articles = this.processArticles(data.articles || []);
      
      // Calculate relevance score for each article
      articles = articles.map(article => {
        const relevanceScore = this.calculateRelevanceScore(article, symbol, companyName);
        return {
          ...article,
          relevanceScore
        };
      });
      
      // Sort by relevance score
      articles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      this.setCache(cacheKey, articles);
      logger.info(`Found ${articles.length} articles for ${symbol} (${companyName})`);
      
      return articles;
    } catch (error) {
      logger.error(`Error fetching stock news for ${symbol}:`, error);
      throw error;
    }
  }

  async getTrendingStocks(stocks, options = {}) {
    const {
      days = 1,
      minArticles = 5
    } = options;

    try {
      const trendingData = [];
      
      for (const stock of stocks) {
        try {
          const articles = await this.getStockNews(stock.symbol, stock.name, { 
            pageSize: 50, 
            days 
          });
          
          if (articles.length >= minArticles) {
            const sentiment = this.analyzeSentiment(articles);
            const trendingScore = this.calculateTrendingScore(articles, sentiment);
            
            trendingData.push({
              symbol: stock.symbol,
              name: stock.name,
              articleCount: articles.length,
              sentiment,
              trendingScore,
              latestArticle: articles[0] || null
            });
          }
        } catch (error) {
          logger.warn(`Error fetching news for ${stock.symbol}:`, error.message);
        }
      }
      
      // Sort by trending score
      trendingData.sort((a, b) => b.trendingScore - a.trendingScore);
      
      logger.info(`Analyzed ${trendingData.length} trending stocks`);
      return trendingData;
    } catch (error) {
      logger.error('Error analyzing trending stocks:', error);
      throw error;
    }
  }

  async getMarketSentiment(options = {}) {
    const { days = 1 } = options;
    
    const cacheKey = this.getCacheKey('market_sentiment', { days });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const query = 'Indian stock market OR NSE OR BSE OR Sensex OR Nifty';
      const articles = await this.searchNews(query, { pageSize: 100 });
      
      const sentiment = this.analyzeSentiment(articles);
      const result = {
        sentiment,
        articleCount: articles.length,
        timeframe: `${days} day${days > 1 ? 's' : ''}`,
        lastUpdated: new Date().toISOString(),
        topArticles: articles.slice(0, 5)
      };
      
      this.setCache(cacheKey, result);
      logger.info(`Analyzed market sentiment from ${articles.length} articles`);
      
      return result;
    } catch (error) {
      logger.error('Error analyzing market sentiment:', error);
      throw error;
    }
  }

  processArticles(articles) {
    return articles
      .filter(article => article && article.title && article.title !== '[Removed]')
      .map(article => {
        const sentiment = this.analyzeSentiment([article]);
        return {
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage,
          content: article.content,
          sentiment
        };
      });
  }

  calculateRelevanceScore(article, symbol, companyName) {
    let score = 0;
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    // Check for exact symbol match
    if (text.includes(symbol.toLowerCase())) {
      score += 10;
    }
    
    // Check for company name match
    const companyWords = companyName.toLowerCase().split(' ');
    companyWords.forEach(word => {
      if (word.length > 2 && text.includes(word)) {
        score += 5;
      }
    });
    
    // Check for stock market related terms
    const stockTerms = ['stock', 'share', 'market', 'trading', 'investor', 'investment'];
    stockTerms.forEach(term => {
      if (text.includes(term)) {
        score += 2;
      }
    });
    
    return score;
  }

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

  getSentimentMultiplier(sentiment) {
    if (sentiment.overall === 'positive') {
      return 1 + (sentiment.confidence / 100) * 0.5; // Up to 1.5x for strong positive
    } else if (sentiment.overall === 'negative') {
      return 1 + (sentiment.confidence / 100) * 0.3; // Up to 1.3x for strong negative (controversy drives attention)
    }
    return 1; // Neutral sentiment doesn't affect trending score
  }

  analyzeSentiment(articles) {
    if (!articles || articles.length === 0) {
      return {
        overall: 'neutral',
        score: 0,
        positive: 0,
        negative: 0,
        neutral: 100,
        confidence: 0,
        totalArticles: 0
      };
    }

    let totalScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    articles.forEach(article => {
      const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
      let articleScore = 0;

      // Count positive words
      this.positiveWords.forEach(word => {
        const matches = (text.match(new RegExp(word, 'g')) || []).length;
        articleScore += matches;
      });

      // Count negative words
      this.negativeWords.forEach(word => {
        const matches = (text.match(new RegExp(word, 'g')) || []).length;
        articleScore -= matches;
      });

      // Normalize score based on text length
      const textLength = text.split(' ').length;
      if (textLength > 0) {
        articleScore = articleScore / Math.sqrt(textLength) * 100;
      }

      totalScore += articleScore;

      // Classify article sentiment
      if (articleScore > 0.5) {
        positiveCount++;
      } else if (articleScore < -0.5) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });

    const averageScore = totalScore / articles.length;
    const positivePercentage = Math.round((positiveCount / articles.length) * 100);
    const negativePercentage = Math.round((negativeCount / articles.length) * 100);
    const neutralPercentage = 100 - positivePercentage - negativePercentage;

    // Determine overall sentiment
    let overall = 'neutral';
    if (averageScore > 0.5) {
      overall = 'positive';
    } else if (averageScore < -0.5) {
      overall = 'negative';
    }

    // Calculate confidence based on the distribution
    const maxPercentage = Math.max(positivePercentage, negativePercentage, neutralPercentage);
    const confidence = Math.round(maxPercentage);

    return {
      overall,
      score: Math.round(averageScore * 100) / 100,
      positive: positivePercentage,
      negative: negativePercentage,
      neutral: neutralPercentage,
      confidence,
      totalArticles: articles.length
    };
  }

  processArticle(article) {
    if (!article || !article.title || article.title === '[Removed]') {
      return null;
    }

    const sentiment = this.analyzeSentiment([article]);
    return {
      title: article.title,
      description: article.description || '',
      url: article.url,
      source: {
        id: article.source?.id || null,
        name: article.source?.name || 'Unknown'
      },
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage,
      content: article.content,
      author: article.author,
      sentiment
    };
  }

  getApiUsage() {
    return {
      hasApiKey: !!this.apiKey,
      rateLimitDelay: this.rateLimitDelay,
      lastRequestTime: this.lastRequestTime,
      positiveKeywordsCount: this.positiveWords.length,
      negativeKeywordsCount: this.negativeWords.length
    };
  }

  getApiStatus() {
    return {
      hasApiKey: !!this.apiKey,
      status: this.apiKey ? 'configured' : 'not configured',
      rateLimitDelay: this.rateLimitDelay,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime
    };
  }

  clearCache() {
    if (this.cache) {
      this.cache.clear();
      logger.info('News service cache cleared');
    }
  }
}

module.exports = new NewsService();