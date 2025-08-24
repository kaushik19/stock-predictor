const alphaVantageService = require('../services/alphaVantageService');

// Mock axios to avoid real API calls in tests
jest.mock('axios');
const axios = require('axios');

describe('Alpha Vantage Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Processing', () => {
    test('should process company overview data correctly', () => {
      const rawData = {
        Symbol: 'RELIANCE.BSE',
        Name: 'Reliance Industries Limited',
        Description: 'Reliance Industries Limited operates as a petrochemical company.',
        Country: 'India',
        Sector: 'Energy',
        Industry: 'Oil & Gas Refining & Marketing',
        MarketCapitalization: '1650000000000',
        PERatio: '28.5',
        EPS: '85.30',
        DividendYield: '0.0035',
        ProfitMargin: '0.089',
        ReturnOnEquityTTM: '0.125',
        Beta: '1.2'
      };

      const processed = alphaVantageService.processCompanyOverview(rawData);
      
      expect(processed.symbol).toBe('RELIANCE.BSE');
      expect(processed.name).toBe('Reliance Industries Limited');
      expect(processed.sector).toBe('Energy');
      expect(processed.marketCapitalization).toBe(1650000000000);
      expect(processed.peRatio).toBe(28.5);
      expect(processed.eps).toBe(85.30);
      expect(processed.dividendYield).toBe(0.0035);
    });

    test('should process income statement data correctly', () => {
      const rawData = {
        symbol: 'RELIANCE.BSE',
        annualReports: [{
          fiscalDateEnding: '2023-03-31',
          reportedCurrency: 'INR',
          totalRevenue: '792000000000',
          grossProfit: '150000000000',
          netIncome: '70000000000',
          operatingIncome: '90000000000',
          ebit: '85000000000',
          ebitda: '120000000000'
        }],
        quarterlyReports: [{
          fiscalDateEnding: '2023-12-31',
          reportedCurrency: 'INR',
          totalRevenue: '200000000000',
          netIncome: '18000000000'
        }]
      };

      const processed = alphaVantageService.processIncomeStatement(rawData);
      
      expect(processed.symbol).toBe('RELIANCE.BSE');
      expect(processed.annualReports).toHaveLength(1);
      expect(processed.annualReports[0].totalRevenue).toBe(792000000000);
      expect(processed.annualReports[0].netIncome).toBe(70000000000);
      expect(processed.quarterlyReports).toHaveLength(1);
    });

    test('should process balance sheet data correctly', () => {
      const rawData = {
        symbol: 'RELIANCE.BSE',
        annualReports: [{
          fiscalDateEnding: '2023-03-31',
          reportedCurrency: 'INR',
          totalAssets: '1200000000000',
          totalLiabilities: '600000000000',
          totalShareholderEquity: '600000000000',
          cashAndCashEquivalentsAtCarryingValue: '50000000000',
          longTermDebt: '200000000000'
        }]
      };

      const processed = alphaVantageService.processBalanceSheet(rawData);
      
      expect(processed.symbol).toBe('RELIANCE.BSE');
      expect(processed.annualReports).toHaveLength(1);
      expect(processed.annualReports[0].totalAssets).toBe(1200000000000);
      expect(processed.annualReports[0].totalShareholderEquity).toBe(600000000000);
    });
  });

  describe('Derived Metrics Calculation', () => {
    const mockOverview = {
      peRatio: 28.5,
      beta: 1.2
    };

    const mockIncomeStatement = {
      annualReports: [{
        totalRevenue: 792000000000,
        netIncome: 70000000000,
        grossProfit: 150000000000,
        operatingIncome: 90000000000
      }, {
        totalRevenue: 720000000000,
        netIncome: 60000000000
      }]
    };

    const mockBalanceSheet = {
      annualReports: [{
        totalAssets: 1200000000000,
        totalLiabilities: 600000000000,
        totalShareholderEquity: 600000000000,
        totalCurrentAssets: 300000000000,
        totalCurrentLiabilities: 150000000000,
        longTermDebt: 200000000000
      }]
    };

    test('should calculate profitability ratios correctly', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.netProfitMargin).toBeCloseTo(8.84, 2);
      expect(metrics.grossProfitMargin).toBeCloseTo(18.94, 2);
      expect(metrics.operatingMargin).toBeCloseTo(11.36, 2);
    });

    test('should calculate liquidity ratios correctly', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.currentRatio).toBe(2);
    });

    test('should calculate leverage ratios correctly', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.debtToEquityRatio).toBe(1);
      expect(metrics.longTermDebtToEquity).toBeCloseTo(0.33, 2);
      expect(metrics.debtRatio).toBe(0.5);
    });

    test('should calculate efficiency ratios correctly', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.assetTurnover).toBeCloseTo(0.66, 2);
      expect(metrics.returnOnAssets).toBeCloseTo(5.83, 2);
      expect(metrics.returnOnEquity).toBeCloseTo(11.67, 2);
    });

    test('should calculate growth rates correctly', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.revenueGrowthRate).toBe(10);
      expect(metrics.netIncomeGrowthRate).toBeCloseTo(16.67, 2);
    });

    test('should calculate financial health score', () => {
      const metrics = alphaVantageService.calculateDerivedMetrics(
        mockOverview, mockIncomeStatement, mockBalanceSheet
      );
      
      expect(metrics.financialHealthScore).toBeGreaterThan(0);
      expect(metrics.financialHealthScore).toBeLessThanOrEqual(100);
      expect(typeof metrics.financialHealthScore).toBe('number');
    });
  });

  describe('Financial Health Score Calculation', () => {
    test('should return high score for excellent metrics', () => {
      const excellentMetrics = {
        netProfitMargin: 20,
        currentRatio: 2.5,
        debtToEquityRatio: 0.2,
        revenueGrowthRate: 25,
        returnOnEquity: 25
      };
      
      const score = alphaVantageService.calculateFinancialHealthScore(excellentMetrics, {});
      expect(score).toBeGreaterThan(80);
    });

    test('should return low score for poor metrics', () => {
      const poorMetrics = {
        netProfitMargin: -5,
        currentRatio: 0.3,
        debtToEquityRatio: 3,
        revenueGrowthRate: -10,
        returnOnEquity: -5
      };
      
      const score = alphaVantageService.calculateFinancialHealthScore(poorMetrics, {});
      expect(score).toBeLessThan(30);
    });

    test('should return 0 for no metrics', () => {
      const score = alphaVantageService.calculateFinancialHealthScore({}, {});
      expect(score).toBe(0);
    });
  });

  describe('API Usage', () => {
    test('should return API usage statistics', () => {
      const usage = alphaVantageService.getApiUsage();
      
      expect(usage).toHaveProperty('hasApiKey');
      expect(usage).toHaveProperty('rateLimitDelay');
      expect(usage).toHaveProperty('queueLength');
      expect(usage).toHaveProperty('isProcessingQueue');
      expect(usage).toHaveProperty('lastRequestTime');
      
      expect(typeof usage.hasApiKey).toBe('boolean');
      expect(typeof usage.rateLimitDelay).toBe('number');
      expect(typeof usage.queueLength).toBe('number');
      expect(typeof usage.isProcessingQueue).toBe('boolean');
    });
  });
});