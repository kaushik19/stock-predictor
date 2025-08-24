const newsService = require('../services/newsService');

// Mock axios to avoid real API calls in tests
jest.mock('axios');
const axios = require('axios');

describe('News Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    newsService.clearCache();
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
      
      expect(score).toBeGreaterThan(10);
    });

    test('should calculate relevance for company name match', () => {
      const article = {
        title: 'Reliance Industries reports strong earnings',
        description: 'The company showed excellent growth',
        content: 'Reliance Industries Limited posted record profits'
      };

      const score = newsService.calculateRelevanceScore(article, 'RELIANCE', 'Reliance Industries Limited');
      
      expect(score).toBeGreaterThan(5);
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
      
      expect(score).toBeLessThan(5);
    });
  });

  describe('Trending Score Calculation', () => {
    test('should calculate trending score based on article count', () => {
      const articles = [
        { publishedAt: new Date().toISOString() },
        { publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
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
        { publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
      ];

      const oldArticles = [
        { publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
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
        { publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
      ];

      const oldArticles = [
        { publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
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
});