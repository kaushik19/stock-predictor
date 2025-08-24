const fundamentalAnalysisService = require('../services/fundamentalAnalysisService');

describe('Fundamental Analysis Service', () => {
  
  const mockCompanyData = {
    symbol: 'RELIANCE.BSE',
    name: 'Reliance Industries Limited',
    peRatio: 28.5,
    pbRatio: 2.8,
    psRatio: 1.5,
    pegRatio: 1.2,
    profitMargin: 0.089,
    operatingMargin: 0.125,
    grossMargin: 0.45,
    returnOnEquity: 0.15,
    returnOnAssets: 0.08,
    returnOnCapital: 0.12,
    currentRatio: 1.8,
    quickRatio: 1.2,
    cashRatio: 0.5,
    debtToEquity: 0.6,
    debtRatio: 0.35,
    equityRatio: 0.65,
    interestCoverage: 8.5,
    assetTurnover: 0.9,
    inventoryTurnover: 12,
    receivablesTurnover: 8,
    dividendYield: 0.025,
    payoutRatio: 0.3,
    bookValuePerShare: 850,
    eps: 65.5,
    revenueGrowth1Y: 0.12,
    revenueGrowth3Y: 0.08,
    revenueGrowth5Y: 0.06,
    earningsGrowth1Y: 0.15,
    earningsGrowth3Y: 0.10,
    earningsGrowth5Y: 0.08,
    bookValueGrowth1Y: 0.08,
    bookValueGrowth3Y: 0.06,
    dividendGrowth1Y: 0.05,
    dividendGrowth3Y: 0.04
  };

  describe('Financial Ratios Calculation', () => {
    test('should calculate financial ratios correctly', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      
      expect(ratios.pe_ratio).toBe(28.5);
      expect(ratios.pb_ratio).toBe(2.8);
      expect(ratios.profit_margin).toBe(8.9);
      expect(ratios.roe).toBe(15);
      expect(ratios.current_ratio).toBe(1.8);
      expect(ratios.debt_to_equity).toBe(0.6);
      expect(ratios.dividend_yield).toBe(2.5);
    });

    test('should handle null and undefined values', () => {
      const dataWithNulls = {
        ...mockCompanyData,
        peRatio: null,
        pbRatio: undefined,
        profitMargin: 'None',
        returnOnEquity: ''
      };

      const ratios = fundamentalAnalysisService.calculateFinancialRatios(dataWithNulls);
      
      expect(ratios.pe_ratio).toBeNull();
      expect(ratios.pb_ratio).toBeNull();
      expect(ratios.profit_margin).toBeNull();
      expect(ratios.roe).toBeNull();
    });

    test('should convert decimal values to percentages correctly', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      
      expect(ratios.profit_margin).toBe(8.9); // 0.089 * 100
      expect(ratios.operating_margin).toBe(12.5); // 0.125 * 100
      expect(ratios.roe).toBe(15); // 0.15 * 100
      expect(ratios.dividend_yield).toBe(2.5); // 0.025 * 100
    });
  });

  describe('Growth Metrics Calculation', () => {
    test('should calculate growth metrics correctly', () => {
      const growth = fundamentalAnalysisService.calculateGrowthMetrics(mockCompanyData);
      
      expect(growth.revenue_growth_1y).toBe(12);
      expect(growth.earnings_growth_1y).toBe(15);
      expect(growth.avg_revenue_growth).toBeCloseTo(8.67, 1);
      expect(growth.avg_earnings_growth).toBeCloseTo(11, 1);
    });

    test('should handle missing growth data', () => {
      const dataWithoutGrowth = {
        ...mockCompanyData,
        revenueGrowth1Y: null,
        earningsGrowth3Y: undefined
      };

      const growth = fundamentalAnalysisService.calculateGrowthMetrics(dataWithoutGrowth);
      
      expect(growth.revenue_growth_1y).toBeNull();
      expect(growth.earnings_growth_3y).toBeNull();
    });

    test('should calculate average growth rates correctly', () => {
      const growth = fundamentalAnalysisService.calculateGrowthMetrics(mockCompanyData);
      
      // Revenue growth average: (12 + 8 + 6) / 3 = 8.67
      expect(growth.avg_revenue_growth).toBeCloseTo(8.67, 1);
      
      // Earnings growth average: (15 + 10 + 8) / 3 = 11
      expect(growth.avg_earnings_growth).toBeCloseTo(11, 1);
    });
  });

  describe('Valuation Scores Calculation', () => {
    test('should calculate value score correctly', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      const valueScore = fundamentalAnalysisService.calculateValueScore(ratios, 'Energy');
      
      expect(valueScore).toBeGreaterThanOrEqual(0);
      expect(valueScore).toBeLessThanOrEqual(100);
      expect(typeof valueScore).toBe('number');
    });

    test('should calculate growth score correctly', () => {
      const growth = fundamentalAnalysisService.calculateGrowthMetrics(mockCompanyData);
      const growthScore = fundamentalAnalysisService.calculateGrowthScore(growth);
      
      expect(growthScore).toBeGreaterThanOrEqual(0);
      expect(growthScore).toBeLessThanOrEqual(100);
      expect(typeof growthScore).toBe('number');
    });

    test('should calculate quality score correctly', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      const qualityScore = fundamentalAnalysisService.calculateQualityScore(ratios);
      
      expect(qualityScore).toBeGreaterThanOrEqual(0);
      expect(qualityScore).toBeLessThanOrEqual(100);
      expect(typeof qualityScore).toBe('number');
    });

    test('should calculate composite score correctly', () => {
      const scores = {
        value_score: 70,
        growth_score: 80,
        quality_score: 75,
        momentum_score: 65
      };

      const compositeScore = fundamentalAnalysisService.calculateCompositeScore(scores);
      
      expect(compositeScore).toBeGreaterThanOrEqual(0);
      expect(compositeScore).toBeLessThanOrEqual(100);
      expect(compositeScore).toBe(73); // Weighted average
    });
  });

  describe('Peer Comparison', () => {
    test('should perform peer comparison correctly', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      const comparison = fundamentalAnalysisService.performPeerComparison(ratios, 'Energy');
      
      expect(comparison).toHaveProperty('pe_vs_sector');
      expect(comparison).toHaveProperty('pb_vs_sector');
      expect(comparison).toHaveProperty('roe_vs_sector');
      expect(comparison).toHaveProperty('debt_equity_vs_sector');
      expect(comparison).toHaveProperty('overall_sector_score');
      
      expect(comparison.pe_vs_sector.company).toBe(28.5);
      expect(comparison.pe_vs_sector.sector_avg).toBe(15); // Energy sector average
      expect(comparison.pe_vs_sector.assessment).toBeDefined();
    });

    test('should use default sector benchmarks for unknown sectors', () => {
      const ratios = fundamentalAnalysisService.calculateFinancialRatios(mockCompanyData);
      const comparison = fundamentalAnalysisService.performPeerComparison(ratios, 'UnknownSector');
      
      expect(comparison.pe_vs_sector.sector_avg).toBe(25); // Technology default
    });

    test('should assess metrics correctly', () => {
      // Test lower_better assessment (PE ratio)
      expect(fundamentalAnalysisService.assessMetric(10, 15, 'lower_better')).toBe('excellent');
      expect(fundamentalAnalysisService.assessMetric(20, 15, 'lower_better')).toBe('poor');
      
      // Test higher_better assessment (ROE)
      expect(fundamentalAnalysisService.assessMetric(20, 15, 'higher_better')).toBe('excellent');
      expect(fundamentalAnalysisService.assessMetric(10, 15, 'higher_better')).toBe('poor');
    });
  });

  describe('Comprehensive Analysis', () => {
    test('should perform complete fundamental analysis', async () => {
      const analysis = await fundamentalAnalysisService.analyzeFundamentals(mockCompanyData, 'Energy');
      
      expect(analysis).toHaveProperty('symbol', 'RELIANCE.BSE');
      expect(analysis).toHaveProperty('companyName', 'Reliance Industries Limited');
      expect(analysis).toHaveProperty('sector', 'Energy');
      expect(analysis).toHaveProperty('ratios');
      expect(analysis).toHaveProperty('scores');
      expect(analysis).toHaveProperty('valuation');
      expect(analysis).toHaveProperty('growth');
      expect(analysis).toHaveProperty('profitability');
      expect(analysis).toHaveProperty('financial_health');
      expect(analysis).toHaveProperty('peer_comparison');
      expect(analysis).toHaveProperty('recommendation');
      
      expect(analysis.lastUpdated).toBeDefined();
    });

    test('should generate recommendation correctly', async () => {
      const analysis = await fundamentalAnalysisService.analyzeFundamentals(mockCompanyData, 'Energy');
      
      expect(analysis.recommendation).toHaveProperty('action');
      expect(analysis.recommendation).toHaveProperty('confidence');
      expect(analysis.recommendation).toHaveProperty('risk_rating');
      expect(analysis.recommendation).toHaveProperty('reasons');
      
      expect(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']).toContain(analysis.recommendation.action);
      expect(analysis.recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendation.confidence).toBeLessThanOrEqual(100);
    });

    test('should handle errors gracefully', async () => {
      const invalidData = null;
      
      await expect(fundamentalAnalysisService.analyzeFundamentals(invalidData))
        .rejects.toThrow();
    });
  });

  describe('Helper Methods', () => {
    test('should parse numbers correctly', () => {
      expect(fundamentalAnalysisService.parseNumber('123.45')).toBe(123.45);
      expect(fundamentalAnalysisService.parseNumber(456.78)).toBe(456.78);
      expect(fundamentalAnalysisService.parseNumber(null)).toBeNull();
      expect(fundamentalAnalysisService.parseNumber(undefined)).toBeNull();
      expect(fundamentalAnalysisService.parseNumber('None')).toBeNull();
      expect(fundamentalAnalysisService.parseNumber('')).toBeNull();
      expect(fundamentalAnalysisService.parseNumber('invalid')).toBeNull();
    });

    test('should calculate average correctly', () => {
      expect(fundamentalAnalysisService.calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(fundamentalAnalysisService.calculateAverage([10, 20, 30])).toBe(20);
      expect(fundamentalAnalysisService.calculateAverage([null, 2, 3, undefined])).toBe(2.5);
      expect(fundamentalAnalysisService.calculateAverage([])).toBeNull();
      expect(fundamentalAnalysisService.calculateAverage([null, undefined])).toBeNull();
    });

    test('should analyze trends correctly', () => {
      expect(fundamentalAnalysisService.analyzeTrend([1, 2, 3, 4, 5, 6])).toBe('improving');
      expect(fundamentalAnalysisService.analyzeTrend([6, 5, 4, 3, 2, 1])).toBe('declining');
      expect(fundamentalAnalysisService.analyzeTrend([3, 3, 3, 3, 3, 3])).toBe('stable');
      expect(fundamentalAnalysisService.analyzeTrend([1, 2])).toBe('insufficient_data');
      expect(fundamentalAnalysisService.analyzeTrend([])).toBe('insufficient_data');
    });

    test('should calculate percentiles correctly', () => {
      // Lower is better (like PE ratio)
      expect(fundamentalAnalysisService.calculatePercentile(8, 10, 'lower_better')).toBe(90);
      expect(fundamentalAnalysisService.calculatePercentile(12, 10, 'lower_better')).toBe(25);
      
      // Higher is better (like ROE)
      expect(fundamentalAnalysisService.calculatePercentile(12, 10, 'higher_better')).toBe(90);
      expect(fundamentalAnalysisService.calculatePercentile(8, 10, 'higher_better')).toBe(25);
      
      // Null values
      expect(fundamentalAnalysisService.calculatePercentile(null, 10, 'lower_better')).toBeNull();
      expect(fundamentalAnalysisService.calculatePercentile(10, null, 'higher_better')).toBeNull();
    });

    test('should determine recommendation actions correctly', () => {
      expect(fundamentalAnalysisService.determineRecommendationAction(80, 80, 80)).toBe('strong_buy');
      expect(fundamentalAnalysisService.determineRecommendationAction(70, 70, 70)).toBe('buy');
      expect(fundamentalAnalysisService.determineRecommendationAction(50, 50, 50)).toBe('hold');
      expect(fundamentalAnalysisService.determineRecommendationAction(40, 40, 40)).toBe('sell');
      expect(fundamentalAnalysisService.determineRecommendationAction(30, 30, 30)).toBe('strong_sell');
    });

    test('should interpret composite scores correctly', () => {
      expect(fundamentalAnalysisService.interpretCompositeScore(85)).toBe('excellent_value');
      expect(fundamentalAnalysisService.interpretCompositeScore(75)).toBe('good_value');
      expect(fundamentalAnalysisService.interpretCompositeScore(65)).toBe('fair_value');
      expect(fundamentalAnalysisService.interpretCompositeScore(45)).toBe('overvalued');
      expect(fundamentalAnalysisService.interpretCompositeScore(25)).toBe('significantly_overvalued');
    });

    test('should determine overall valuation correctly', () => {
      expect(fundamentalAnalysisService.determineOverallValuation(75)).toBe('undervalued');
      expect(fundamentalAnalysisService.determineOverallValuation(60)).toBe('fairly_valued');
      expect(fundamentalAnalysisService.determineOverallValuation(45)).toBe('overvalued');
    });

    test('should calculate variance correctly', () => {
      const variance1 = fundamentalAnalysisService.calculateVariance([70, 70, 70, 70]);
      const variance2 = fundamentalAnalysisService.calculateVariance([50, 60, 70, 80]);
      
      expect(variance1).toBe(0); // No variance
      expect(variance2).toBeGreaterThan(0); // Some variance
      expect(fundamentalAnalysisService.calculateVariance([null, undefined])).toBe(50);
    });
  });

  describe('Sector Benchmarks', () => {
    test('should have sector benchmarks defined', () => {
      const service = fundamentalAnalysisService;
      
      expect(service.sectorBenchmarks).toHaveProperty('Technology');
      expect(service.sectorBenchmarks).toHaveProperty('Banking');
      expect(service.sectorBenchmarks).toHaveProperty('Energy');
      expect(service.sectorBenchmarks).toHaveProperty('Healthcare');
      
      expect(service.sectorBenchmarks.Technology).toHaveProperty('avgPE');
      expect(service.sectorBenchmarks.Technology).toHaveProperty('avgPB');
      expect(service.sectorBenchmarks.Technology).toHaveProperty('avgROE');
      expect(service.sectorBenchmarks.Technology).toHaveProperty('avgDebtToEquity');
    });

    test('should use appropriate sector benchmarks', () => {
      const ratios = { pe_ratio: 20, pb_ratio: 2.0, roe: 18, debt_to_equity: 0.4 };
      
      const techComparison = fundamentalAnalysisService.performPeerComparison(ratios, 'Technology');
      const bankingComparison = fundamentalAnalysisService.performPeerComparison(ratios, 'Banking');
      
      expect(techComparison.pe_vs_sector.sector_avg).toBe(25);
      expect(bankingComparison.pe_vs_sector.sector_avg).toBe(12);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty company data', async () => {
      const emptyData = {};
      
      const analysis = await fundamentalAnalysisService.analyzeFundamentals(emptyData);
      
      expect(analysis).toHaveProperty('ratios');
      expect(analysis).toHaveProperty('scores');
      expect(analysis).toHaveProperty('recommendation');
    });

    test('should handle data with all null values', () => {
      const nullData = {
        peRatio: null,
        pbRatio: null,
        profitMargin: null,
        returnOnEquity: null
      };

      const ratios = fundamentalAnalysisService.calculateFinancialRatios(nullData);
      
      expect(ratios.pe_ratio).toBeNull();
      expect(ratios.pb_ratio).toBeNull();
      expect(ratios.profit_margin).toBeNull();
      expect(ratios.roe).toBeNull();
    });

    test('should handle extreme values', () => {
      const extremeData = {
        ...mockCompanyData,
        peRatio: 1000,
        pbRatio: 50,
        debtToEquity: 10,
        returnOnEquity: -0.5
      };

      const ratios = fundamentalAnalysisService.calculateFinancialRatios(extremeData);
      const valueScore = fundamentalAnalysisService.calculateValueScore(ratios, 'Technology');
      
      expect(valueScore).toBeGreaterThanOrEqual(0);
      expect(valueScore).toBeLessThanOrEqual(100);
    });
  });
});