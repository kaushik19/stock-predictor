const newsService = require('../services/newsService');
const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/news', newsRoutes);

// Mock axios to avoid real API calls in tests
jest.mock('axios');
const axios = require('axios');

describe('News Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sentiment Analysis', () => {
    test('should analyze positive sentiment correctly', () => {
      const articles = [
        {
          title: 'Stock market gains on strong earnings growth',
          description: 'Markets showed excellent performance with positive outlook',
          content: 'The bullish trend continues with strong buy recommendations'
        }
      ];

      const sentiment = newsService.analyzeSentiment(articles);
      
      expect(sentiment.overall).toBe('positive');
      expect(sentiment.positive).toBeGreaterThan(sentiment.negative);
      expect(sentiment.totalArticles).toBe(1);
      expect(sentiment.confidence).toBeGreaterThan(0);
    });

    test('should analyze negative sentiment correctly', () => {
      const articles = [
        {
          title: 'Stock market crash amid recession fears',
          description: 'Markets plunge on negative outlook and poor earnings',
          content: 'Bearish sentiment dominates with widespread sell-offs and losses'
        }
      ];

      const sentiment = newsService.analyzeSentiment(articles);
      
      expect(sentiment.overall).toBe('negative');
      expect(sentiment.negative).toBeGreaterThan(sentiment.positive);
      expect(sentiment.totalArticles).toBe(1);
    });

    test('should handle neutral sentiment', () => {
      const articles = [
        {
          title: 'Stock market remains stable',
          description: 'Markets showed mixed signals today',
          content: 'Trading was steady with no major movements'
        }
      ];

      const sentiment = newsService.analyzeSentiment(articles);
      
      expect(sentiment.overall).toBe('neutral');
      expect(sentiment.totalArticles).toBe(1);
    });

    test('should handle empty articles array', () => {
      const sentiment = newsService.analyzeSentiment([]);
      
      expect(sentiment.overall).toBe('neutral');
      expect(sentiment.score).toBe(0);
      expect(sentiment.totalArticles).toBe(0);
      expect(sentiment.confidence).toBe(0);
    });

    test('should analyze multiple articles correctly', () => {
      const articles = [
        {
          title: 'Stock gains on positive earnings',
          description: 'Strong growth reported',
          content: 'Excellent performance'
        },
        {
          title: 'Market decline on recession fears',
          description: 'Poor outlook ahead',
          content: 'Negative sentiment prevails'
        },
        {
          title: 'Stable trading session',
          description: 'Mixed signals observed',
          content: 'No major changes'
        }
      ];

      const sentiment = newsService.analyzeSentiment(articles);
      
      expect(sentiment.totalArticles).toBe(3);
      expect(sentiment.positive + sentiment.negative + sentiment.neutral).toBe(100);
    });
  });

  describe('Relevance Score Calculation', () => {
    test('should calculate high relevance for exact symbol match', () => {
      const article = {
        title: 'RELIANCE stock price rises',
        description: 'RELIANCE Industries shows strong performance',
        content: 'The stock market favorite RELIANCE continues to gain'
      };

      const score = newsService.calculateRelevanceScore(article, 'RELIANCE', 'Reliance Industries Limited');
      
      expect(score).toBeGreaterThan(0.5);
    });

    test('should calculate relevance for company name match', () => {
      const article = {
        title: 'Reliance Industries reports strong earnings',
        description: 'The company showed excellent growth',
        content: 'Reliance Industries Limited posted record profits'
      };

      const score = newsService.calculateRelevanceScore(article, 'RELIANCE', 'Reliance Industries Limited');
      
      expect(score).toBeGreaterThan(0.3);
    });

    test('should give bonus for financial keywords', () => {
      const article = {
        title: 'Stock market analysis',
        description: 'Share price movements and trading volume',
        content: 'Investor sentiment and earnings report'
      };

      const score = newsService.calculateRelevanceScore(article, 'TEST', 'Test Company');
      
      expect(score).toBeGreaterThan(0);
    });

    test('should return low score for irrelevant content', () => {
      const article = {
        title: 'Weather forecast for tomorrow',
        description: 'Sunny skies expected',
        content: 'Temperature will be pleasant'
      };

      const score = newsService.calculateRelevanceScore(article, 'RELIANCE', 'Reliance Industries Limited');
      
      expect(score).toBeLessThan(0.2);
    });
  });

  describe('Trending Score Calculation', () => {
    test('should calculate trending score based on article count', () => {
      const articles = [
        { publishedAt: new Date().toISOString() },
        { publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }, // 1 hour ago
        { publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() } // 2 hours ago
      ];

      const sentiment = { overall: 'neutral', confidence: 50 };
      const score = newsService.calculateTrendingScore(articles, sentiment);
      
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    test('should give higher score for positive sentiment', () => {
      const articles = [{ publishedAt: new Date().toISOString() }];
      
      const positiveSentiment = { overall: 'positive', confidence: 80 };
      const neutralSentiment = { overall: 'neutral', confidence: 50 };
      
      const positiveScore = newsService.calculateTrendingScore(articles, positiveSentiment);
      const neutralScore = newsService.calculateTrendingScore(articles, neutralSentiment);
      
      expect(positiveScore).toBeGreaterThan(neutralScore);
    });

    test('should give higher score for recent articles', () => {
      const recentArticles = [
        { publishedAt: new Date().toISOString() },
        { publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() } // 30 min ago
      ];

      const oldArticles = [
        { publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // 1 day ago
        { publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() } // 2 days ago
      ];

      const sentiment = { overall: 'neutral', confidence: 50 };
      
      const recentScore = newsService.calculateTrendingScore(recentArticles, sentiment);
      const oldScore = newsService.calculateTrendingScore(oldArticles, sentiment);
      
      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  describe('Recency Bonus Calculation', () => {
    test('should give higher bonus for recent articles', () => {
      const recentArticles = [
        { publishedAt: new Date().toISOString() },
        { publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() } // 1 hour ago
      ];

      const oldArticles = [
        { publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }, // 1 day ago
        { publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() } // 2 days ago
      ];

      const recentBonus = newsService.calculateRecencyBonus(recentArticles);
      const oldBonus = newsService.calculateRecencyBonus(oldArticles);
      
      expect(recentBonus).toBeGreaterThan(oldBonus);
      expect(recentBonus).toBeLessThanOrEqual(1);
      expect(oldBonus).toBeGreaterThanOrEqual(0);
    });

    test('should return 0 for empty articles', () => {
      const bonus = newsService.calculateRecencyBonus([]);
      expect(bonus).toBe(0);
    });
  });

  describe('Sentiment Multiplier', () => {
    test('should return higher multiplier for positive sentiment', () => {
      const positiveSentiment = { overall: 'positive', confidence: 80 };
      const neutralSentiment = { overall: 'neutral', confidence: 50 };
      
      const positiveMultiplier = newsService.getSentimentMultiplier(positiveSentiment);
      const neutralMultiplier = newsService.getSentimentMultiplier(neutralSentiment);
      
      expect(positiveMultiplier).toBeGreaterThan(neutralMultiplier);
      expect(neutralMultiplier).toBe(1);
    });

    test('should return multiplier for negative sentiment', () => {
      const negativeSentiment = { overall: 'negative', confidence: 70 };
      const neutralSentiment = { overall: 'neutral', confidence: 50 };
      
      const negativeMultiplier = newsService.getSentimentMultiplier(negativeSentiment);
      const neutralMultiplier = newsService.getSentimentMultiplier(neutralSentiment);
      
      expect(negativeMultiplier).toBeGreaterThan(neutralMultiplier);
    });
  });

  describe('Article Processing', () => {
    test('should process article correctly', () => {
      const rawArticle = {
        title: 'Test Article Title',
        description: 'Test article description',
        content: 'Test article content',
        url: 'https://example.com/article',
        urlToImage: 'https://example.com/image.jpg',
        publishedAt: '2024-01-01T12:00:00Z',
        source: {
          id: 'test-source',
          name: 'Test Source'
        },
        author: 'Test Author'
      };

      const processed = newsService.processArticle(rawArticle);
      
      expect(processed.title).toBe('Test Article Title');
      expect(processed.description).toBe('Test article description');
      expect(processed.url).toBe('https://example.com/article');
      expect(processed.source.name).toBe('Test Source');
      expect(processed.sentiment).toBeDefined();
      expect(processed.sentiment).toHaveProperty('overall');
    });
  });

  describe('API Usage', () => {
    test('should return API usage statistics', () => {
      const usage = newsService.getApiUsage();
      
      expect(usage).toHaveProperty('hasApiKey');
      expect(usage).toHaveProperty('rateLimitDelay');
      expect(usage).toHaveProperty('lastRequestTime');
      expect(usage).toHaveProperty('positiveKeywordsCount');
      expect(usage).toHaveProperty('negativeKeywordsCount');
      
      expect(typeof usage.hasApiKey).toBe('boolean');
      expect(typeof usage.rateLimitDelay).toBe('number');
      expect(typeof usage.positiveKeywordsCount).toBe('number');
      expect(typeof usage.negativeKeywordsCount).toBe('number');
      
      expect(usage.positiveKeywordsCount).toBeGreaterThan(0);
      expect(usage.negativeKeywordsCount).toBeGreaterThan(0);
    });
  });
});\n\ndescribe('News API Endpoints', () => {\n  \n  beforeEach(() => {\n    jest.clearAllMocks();\n  });\n\n  describe('GET /api/news/financial', () => {\n    test('should return financial news', async () => {\n      const mockArticles = [\n        {\n          title: 'Market Update',\n          description: 'Stock market news',\n          url: 'https://example.com/news1',\n          publishedAt: new Date().toISOString(),\n          sentiment: { overall: 'positive', score: 0.5 }\n        }\n      ];\n\n      jest.spyOn(newsService, 'getFinancialNews').mockResolvedValue(mockArticles);\n\n      const response = await request(app)\n        .get('/api/news/financial')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockArticles);\n      expect(response.body.count).toBe(1);\n    });\n\n    test('should handle API key not configured error', async () => {\n      jest.spyOn(newsService, 'getFinancialNews').mockRejectedValue(\n        new Error('News API key not configured')\n      );\n\n      const response = await request(app)\n        .get('/api/news/financial')\n        .expect(503);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.message).toBe('News service temporarily unavailable');\n    });\n\n    test('should validate query parameters', async () => {\n      const response = await request(app)\n        .get('/api/news/financial?pageSize=150') // Invalid: exceeds max\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.message).toBe('Validation error');\n    });\n  });\n\n  describe('GET /api/news/search', () => {\n    test('should search news articles', async () => {\n      const mockArticles = [\n        {\n          title: 'Search Result',\n          description: 'Found article',\n          url: 'https://example.com/search1',\n          publishedAt: new Date().toISOString(),\n          sentiment: { overall: 'neutral', score: 0 }\n        }\n      ];\n\n      jest.spyOn(newsService, 'searchNews').mockResolvedValue(mockArticles);\n\n      const response = await request(app)\n        .get('/api/news/search?q=stock%20market')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockArticles);\n      expect(response.body.query).toBe('stock market');\n      expect(newsService.searchNews).toHaveBeenCalledWith('stock market', expect.any(Object));\n    });\n\n    test('should require search query', async () => {\n      const response = await request(app)\n        .get('/api/news/search')\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.message).toBe('Validation error');\n    });\n  });\n\n  describe('GET /api/news/stock/:symbol', () => {\n    test('should return stock-specific news', async () => {\n      const mockArticles = [\n        {\n          title: 'RELIANCE Stock Update',\n          description: 'Company news',\n          url: 'https://example.com/reliance1',\n          publishedAt: new Date().toISOString(),\n          relevanceScore: 0.8,\n          sentiment: { overall: 'positive', score: 0.3 }\n        }\n      ];\n\n      jest.spyOn(newsService, 'getStockNews').mockResolvedValue(mockArticles);\n      jest.spyOn(newsService, 'analyzeSentiment').mockReturnValue({\n        overall: 'positive',\n        score: 0.3,\n        positive: 60,\n        negative: 20,\n        neutral: 20,\n        confidence: 40,\n        totalArticles: 1\n      });\n\n      const response = await request(app)\n        .get('/api/news/stock/RELIANCE?companyName=Reliance%20Industries%20Limited')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockArticles);\n      expect(response.body.symbol).toBe('RELIANCE');\n      expect(response.body.sentiment).toBeDefined();\n      expect(newsService.getStockNews).toHaveBeenCalledWith(\n        'RELIANCE',\n        'Reliance Industries Limited',\n        expect.any(Object)\n      );\n    });\n\n    test('should require company name', async () => {\n      const response = await request(app)\n        .get('/api/news/stock/RELIANCE')\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.message).toBe('Validation error');\n    });\n  });\n\n  describe('POST /api/news/trending', () => {\n    test('should analyze trending stocks', async () => {\n      const mockTrendingData = [\n        {\n          symbol: 'RELIANCE',\n          name: 'Reliance Industries Limited',\n          articleCount: 5,\n          sentiment: { overall: 'positive', confidence: 70 },\n          trendingScore: 25.5,\n          latestArticle: {\n            title: 'Latest RELIANCE news',\n            publishedAt: new Date().toISOString()\n          }\n        }\n      ];\n\n      jest.spyOn(newsService, 'getTrendingStocks').mockResolvedValue(mockTrendingData);\n\n      const requestBody = {\n        stocks: [\n          { symbol: 'RELIANCE', name: 'Reliance Industries Limited' },\n          { symbol: 'TCS', name: 'Tata Consultancy Services' }\n        ],\n        days: 1,\n        minArticles: 3\n      };\n\n      const response = await request(app)\n        .post('/api/news/trending')\n        .send(requestBody)\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockTrendingData);\n      expect(response.body.analyzedStocks).toBe(2);\n      expect(newsService.getTrendingStocks).toHaveBeenCalledWith(\n        requestBody.stocks,\n        { days: 1, minArticles: 3 }\n      );\n    });\n\n    test('should require stocks array', async () => {\n      const response = await request(app)\n        .post('/api/news/trending')\n        .send({})\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.message).toBe('Validation error');\n    });\n\n    test('should validate stock objects', async () => {\n      const response = await request(app)\n        .post('/api/news/trending')\n        .send({\n          stocks: [\n            { symbol: 'RELIANCE' } // Missing name\n          ]\n        })\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n    });\n  });\n\n  describe('GET /api/news/market-sentiment', () => {\n    test('should return market sentiment analysis', async () => {\n      const mockMarketSentiment = {\n        sentiment: {\n          overall: 'positive',\n          score: 0.2,\n          positive: 50,\n          negative: 30,\n          neutral: 20,\n          confidence: 20,\n          totalArticles: 10\n        },\n        articleCount: 10,\n        timeframe: '1 day',\n        lastUpdated: new Date().toISOString(),\n        topArticles: []\n      };\n\n      jest.spyOn(newsService, 'getMarketSentiment').mockResolvedValue(mockMarketSentiment);\n\n      const response = await request(app)\n        .get('/api/news/market-sentiment')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockMarketSentiment);\n      expect(newsService.getMarketSentiment).toHaveBeenCalledWith({ days: 1 });\n    });\n\n    test('should validate days parameter', async () => {\n      const response = await request(app)\n        .get('/api/news/market-sentiment?days=10') // Invalid: exceeds max\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n    });\n  });\n\n  describe('POST /api/news/sentiment/analyze', () => {\n    test('should analyze sentiment of provided articles', async () => {\n      const mockSentiment = {\n        overall: 'positive',\n        score: 0.4,\n        positive: 70,\n        negative: 20,\n        neutral: 10,\n        confidence: 50,\n        totalArticles: 1\n      };\n\n      jest.spyOn(newsService, 'analyzeSentiment').mockReturnValue(mockSentiment);\n\n      const requestBody = {\n        articles: [\n          {\n            title: 'Positive market news',\n            description: 'Stock market gains on strong earnings',\n            content: 'Excellent performance across sectors'\n          }\n        ]\n      };\n\n      const response = await request(app)\n        .post('/api/news/sentiment/analyze')\n        .send(requestBody)\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockSentiment);\n      expect(newsService.analyzeSentiment).toHaveBeenCalledWith(requestBody.articles);\n    });\n\n    test('should analyze sentiment of provided text', async () => {\n      const mockSentiment = {\n        overall: 'negative',\n        score: -0.3,\n        positive: 20,\n        negative: 60,\n        neutral: 20,\n        confidence: 40,\n        totalArticles: 1\n      };\n\n      jest.spyOn(newsService, 'analyzeSentiment').mockReturnValue(mockSentiment);\n\n      const requestBody = {\n        text: 'Stock market crash causes major losses for investors'\n      };\n\n      const response = await request(app)\n        .post('/api/news/sentiment/analyze')\n        .send(requestBody)\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toEqual(mockSentiment);\n    });\n\n    test('should require either articles or text', async () => {\n      const response = await request(app)\n        .post('/api/news/sentiment/analyze')\n        .send({})\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n    });\n  });\n\n  describe('GET /api/news/api-status', () => {\n    test('should return API status', async () => {\n      const response = await request(app)\n        .get('/api/news/api-status')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data).toHaveProperty('hasApiKey');\n      expect(response.body.data).toHaveProperty('status');\n      expect(response.body.data).toHaveProperty('rateLimitDelay');\n    });\n  });\n});"