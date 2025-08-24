const fundamentalAnalysisService = require('./fundamentalAnalysisService');
const { logger } = require('../middleware/errorHandler');

/**
 * Stock Quality Service
 * Provides comprehensive quality scoring, evaluation metrics, and financial trend analysis
 */
class StockQualityService {
  constructor() {
    // Quality scoring weights for different dimensions
    this.qualityWeights = {
      growth: 0.25,      // Revenue/earnings growth
      value: 0.20,       // Valuation metrics
      quality: 0.30,     // Financial health and profitability
      momentum: 0.15,    // Recent performance trends
      stability: 0.10    // Consistency and risk metrics
    };

    // Sector benchmarks for relative scoring
    this.sectorBenchmarks = {
      'Technology': { 
        avgPE: 25, avgPB: 4.5, avgROE: 18, avgDebtToEquity: 0.3,
        avgRevenueGrowth: 15, avgProfitMargin: 20, avgCurrentRatio: 2.5
      },
      'Banking': { 
        avgPE: 12, avgPB: 1.2, avgROE: 15, avgDebtToEquity: 6.5,
        avgRevenueGrowth: 8, avgProfitMargin: 25, avgCurrentRatio: 1.1
      },
      'Energy': { 
        avgPE: 15, avgPB: 1.8, avgROE: 12, avgDebtToEquity: 0.8,
        avgRevenueGrowth: 5, avgProfitMargin: 8, avgCurrentRatio: 1.5
      },
      'Healthcare': { 
        avgPE: 22, avgPB: 3.2, avgROE: 16, avgDebtToEquity: 0.4,
        avgRevenueGrowth: 12, avgProfitMargin: 15, avgCurrentRatio: 2.0
      },
      'Consumer Goods': { 
        avgPE: 18, avgPB: 2.8, avgROE: 14, avgDebtToEquity: 0.5,
        avgRevenueGrowth: 7, avgProfitMargin: 12, avgCurrentRatio: 1.8
      },
      'Industrials': { 
        avgPE: 16, avgPB: 2.2, avgROE: 13, avgDebtToEquity: 0.6,
        avgRevenueGrowth: 6, avgProfitMargin: 10, avgCurrentRatio: 1.6
      },
      'Telecommunications': { 
        avgPE: 14, avgPB: 1.5, avgROE: 11, avgDebtToEquity: 1.2,
        avgRevenueGrowth: 3, avgProfitMargin: 18, avgCurrentRatio: 1.2
      },
      'Utilities': { 
        avgPE: 13, avgPB: 1.4, avgROE: 10, avgDebtToEquity: 0.9,
        avgRevenueGrowth: 2, avgProfitMargin: 15, avgCurrentRatio: 1.3
      },
      'Materials': { 
        avgPE: 17, avgPB: 2.0, avgROE: 12, avgDebtToEquity: 0.7,
        avgRevenueGrowth: 4, avgProfitMargin: 8, avgCurrentRatio: 1.7
      },
      'Real Estate': { 
        avgPE: 20, avgPB: 1.6, avgROE: 8, avgDebtToEquity: 1.5,
        avgRevenueGrowth: 6, avgProfitMargin: 20, avgCurrentRatio: 1.4
      }
    };

    // Quality grade thresholds
    this.qualityGrades = {
      excellent: 85,
      good: 70,
      average: 50,
      poor: 30
    };

    // Valuation thresholds
    this.valuationThresholds = {
      severelyOvervalued: 1.5,
      overvalued: 1.2,
      fairlyValued: 0.8,
      undervalued: 0.6
    };
  }

  /**
   * Get comprehensive stock quality analysis
   */
  async getStockQualityAnalysis(symbol, sector = 'Technology') {
    try {
      logger.info(`Analyzing stock quality for ${symbol}...`);

      const analysis = {
        symbol,
        sector,
        timestamp: new Date().toISOString(),
        qualityScore: null,
        qualityGrade: null,
        evaluation: null,
        financialTrends: null,
        sectorComparison: null,
        qualityDimensions: null,
        riskAssessment: null,
        recommendations: []
      };

      // Get fundamental data
      const fundamentalData = await this.getFundamentalData(symbol, sector);
      
      if (!fundamentalData) {
        throw new Error('Insufficient fundamental data for quality analysis');
      }

      // Calculate quality dimensions
      analysis.qualityDimensions = this.calculateQualityDimensions(fundamentalData, sector);
      
      // Calculate overall quality score
      analysis.qualityScore = this.calculateOverallQualityScore(analysis.qualityDimensions);
      
      // Determine quality grade
      analysis.qualityGrade = this.determineQualityGrade(analysis.qualityScore);
      
      // Perform stock evaluation
      analysis.evaluation = this.performStockEvaluation(fundamentalData, sector);
      
      // Analyze financial trends
      analysis.financialTrends = this.analyzeFinancialTrends(fundamentalData);
      
      // Perform sector comparison
      analysis.sectorComparison = this.performSectorComparison(fundamentalData, sector);
      
      // Assess risks
      analysis.riskAssessment = this.assessQualityRisks(fundamentalData, analysis.qualityScore);
      
      // Generate recommendations
      analysis.recommendations = this.generateQualityRecommendations(analysis);

      return analysis;

    } catch (error) {
      logger.error(`Error analyzing stock quality for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get fundamental data for quality analysis
   */
  async getFundamentalData(symbol, sector) {
    try {
      // This would typically fetch from Alpha Vantage or other data sources
      // For now, we'll create a mock structure based on existing services
      const mockData = {
        symbol,
        sector,
        // Financial ratios
        peRatio: 18.5,
        pbRatio: 2.8,
        psRatio: 3.2,
        pegRatio: 1.4,
        // Profitability metrics
        profitMargin: 0.15,
        operatingMargin: 0.18,
        grossMargin: 0.35,
        returnOnEquity: 0.16,
        returnOnAssets: 0.08,
        returnOnCapital: 0.12,
        // Liquidity ratios
        currentRatio: 2.1,
        quickRatio: 1.8,
        cashRatio: 0.5,
        // Leverage ratios
        debtToEquity: 0.4,
        debtRatio: 0.3,
        interestCoverage: 8.5,
        // Growth metrics
        revenueGrowth1Y: 0.12,
        revenueGrowth3Y: 0.10,
        revenueGrowth5Y: 0.08,
        earningsGrowth1Y: 0.15,
        earningsGrowth3Y: 0.12,
        earningsGrowth5Y: 0.10,
        // Market data
        marketCapitalization: 50000000000,
        enterpriseValue: 52000000000,
        // Historical data for trends
        revenueHistory: [1000, 1100, 1200, 1320, 1450], // Last 5 years
        profitHistory: [150, 165, 180, 198, 217],
        roeHistory: [0.14, 0.15, 0.155, 0.16, 0.165]
      };

      return mockData;
    } catch (error) {
      logger.error(`Error fetching fundamental data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Calculate quality dimensions (Growth, Value, Quality, Momentum, Stability)
   */
  calculateQualityDimensions(data, sector) {
    const dimensions = {};
    const benchmarks = this.sectorBenchmarks[sector] || this.sectorBenchmarks['Technology'];

    try {
      // Growth Score (0-100)
      dimensions.growth = this.calculateGrowthScore(data, benchmarks);
      
      // Value Score (0-100)
      dimensions.value = this.calculateValueScore(data, benchmarks);
      
      // Quality Score (0-100)
      dimensions.quality = this.calculateQualityScore(data, benchmarks);
      
      // Momentum Score (0-100)
      dimensions.momentum = this.calculateMomentumScore(data);
      
      // Stability Score (0-100)
      dimensions.stability = this.calculateStabilityScore(data);

    } catch (error) {
      logger.error('Error calculating quality dimensions:', error);
    }

    return dimensions;
  }

  /**
   * Calculate growth score based on revenue and earnings growth
   */
  calculateGrowthScore(data, benchmarks) {
    let score = 50; // Base score

    try {
      // Revenue growth scoring
      const revenueGrowth = (data.revenueGrowth1Y || 0) * 100;
      const benchmarkRevGrowth = benchmarks.avgRevenueGrowth || 8;
      
      if (revenueGrowth > benchmarkRevGrowth * 1.5) score += 25;
      else if (revenueGrowth > benchmarkRevGrowth) score += 15;
      else if (revenueGrowth > benchmarkRevGrowth * 0.5) score += 5;
      else score -= 10;

      // Earnings growth scoring
      const earningsGrowth = (data.earningsGrowth1Y || 0) * 100;
      if (earningsGrowth > 20) score += 20;
      else if (earningsGrowth > 10) score += 10;
      else if (earningsGrowth > 0) score += 5;
      else score -= 15;

      // Growth consistency (3Y vs 1Y)
      const revenueGrowth3Y = (data.revenueGrowth3Y || 0) * 100;
      if (Math.abs(revenueGrowth - revenueGrowth3Y) < 3) score += 5; // Consistent growth

    } catch (error) {
      logger.error('Error calculating growth score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate value score based on valuation metrics
   */
  calculateValueScore(data, benchmarks) {
    let score = 50; // Base score

    try {
      // P/E ratio scoring (lower is better for value)
      const peRatio = data.peRatio || 0;
      const benchmarkPE = benchmarks.avgPE || 20;
      
      if (peRatio > 0) {
        if (peRatio < benchmarkPE * 0.7) score += 25;
        else if (peRatio < benchmarkPE) score += 15;
        else if (peRatio < benchmarkPE * 1.3) score += 5;
        else score -= 15;
      }

      // P/B ratio scoring
      const pbRatio = data.pbRatio || 0;
      const benchmarkPB = benchmarks.avgPB || 3;
      
      if (pbRatio > 0) {
        if (pbRatio < benchmarkPB * 0.7) score += 15;
        else if (pbRatio < benchmarkPB) score += 10;
        else if (pbRatio < benchmarkPB * 1.5) score += 0;
        else score -= 10;
      }

      // PEG ratio scoring (ideal around 1.0)
      const pegRatio = data.pegRatio || 0;
      if (pegRatio > 0) {
        if (pegRatio < 1.0) score += 10;
        else if (pegRatio < 1.5) score += 5;
        else score -= 5;
      }

    } catch (error) {
      logger.error('Error calculating value score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate quality score based on financial health metrics
   */
  calculateQualityScore(data, benchmarks) {
    let score = 50; // Base score

    try {
      // ROE scoring
      const roe = (data.returnOnEquity || 0) * 100;
      const benchmarkROE = benchmarks.avgROE || 15;
      
      if (roe > benchmarkROE * 1.3) score += 20;
      else if (roe > benchmarkROE) score += 15;
      else if (roe > benchmarkROE * 0.7) score += 5;
      else score -= 10;

      // Profit margin scoring
      const profitMargin = (data.profitMargin || 0) * 100;
      const benchmarkMargin = benchmarks.avgProfitMargin || 12;
      
      if (profitMargin > benchmarkMargin * 1.5) score += 15;
      else if (profitMargin > benchmarkMargin) score += 10;
      else if (profitMargin > benchmarkMargin * 0.5) score += 5;
      else score -= 10;

      // Debt management scoring
      const debtToEquity = data.debtToEquity || 0;
      const benchmarkDebt = benchmarks.avgDebtToEquity || 0.5;
      
      if (debtToEquity < benchmarkDebt * 0.5) score += 10;
      else if (debtToEquity < benchmarkDebt) score += 5;
      else if (debtToEquity < benchmarkDebt * 2) score += 0;
      else score -= 15;

      // Interest coverage scoring
      const interestCoverage = data.interestCoverage || 0;
      if (interestCoverage > 10) score += 10;
      else if (interestCoverage > 5) score += 5;
      else if (interestCoverage > 2) score += 0;
      else score -= 10;

    } catch (error) {
      logger.error('Error calculating quality score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate momentum score based on recent performance trends
   */
  calculateMomentumScore(data) {
    let score = 50; // Base score

    try {
      // Recent growth acceleration
      const revenueGrowth1Y = (data.revenueGrowth1Y || 0) * 100;
      const revenueGrowth3Y = (data.revenueGrowth3Y || 0) * 100;
      
      if (revenueGrowth1Y > revenueGrowth3Y + 2) score += 15; // Accelerating growth
      else if (revenueGrowth1Y > revenueGrowth3Y) score += 5;
      else if (revenueGrowth1Y < revenueGrowth3Y - 5) score -= 15; // Decelerating

      // Earnings momentum
      const earningsGrowth1Y = (data.earningsGrowth1Y || 0) * 100;
      const earningsGrowth3Y = (data.earningsGrowth3Y || 0) * 100;
      
      if (earningsGrowth1Y > earningsGrowth3Y + 3) score += 20;
      else if (earningsGrowth1Y > earningsGrowth3Y) score += 10;
      else if (earningsGrowth1Y < earningsGrowth3Y - 5) score -= 20;

      // ROE trend
      if (data.roeHistory && data.roeHistory.length >= 3) {
        const recentROE = data.roeHistory.slice(-2);
        if (recentROE[1] > recentROE[0]) score += 10; // Improving ROE
        else score -= 5;
      }

    } catch (error) {
      logger.error('Error calculating momentum score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate stability score based on consistency metrics
   */
  calculateStabilityScore(data) {
    let score = 50; // Base score

    try {
      // Revenue stability
      if (data.revenueHistory && data.revenueHistory.length >= 5) {
        const growthRates = [];
        for (let i = 1; i < data.revenueHistory.length; i++) {
          const growth = (data.revenueHistory[i] - data.revenueHistory[i-1]) / data.revenueHistory[i-1];
          growthRates.push(growth);
        }
        
        const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
        const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowth, 2), 0) / growthRates.length;
        const stability = 1 / (1 + variance * 100); // Lower variance = higher stability
        
        score += (stability - 0.5) * 40; // Scale to -20 to +20
      }

      // Liquidity stability
      const currentRatio = data.currentRatio || 0;
      if (currentRatio >= 1.5 && currentRatio <= 3.0) score += 15; // Good liquidity range
      else if (currentRatio >= 1.0) score += 5;
      else score -= 20; // Poor liquidity

      // Debt stability
      const debtToEquity = data.debtToEquity || 0;
      if (debtToEquity < 0.5) score += 10; // Conservative debt levels
      else if (debtToEquity < 1.0) score += 5;
      else score -= 10;

    } catch (error) {
      logger.error('Error calculating stability score:', error);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate overall quality score using weighted dimensions
   */
  calculateOverallQualityScore(dimensions) {
    try {
      let totalScore = 0;
      let totalWeight = 0;

      Object.keys(this.qualityWeights).forEach(dimension => {
        if (dimensions[dimension] !== null && dimensions[dimension] !== undefined) {
          totalScore += dimensions[dimension] * this.qualityWeights[dimension];
          totalWeight += this.qualityWeights[dimension];
        }
      });

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
    } catch (error) {
      logger.error('Error calculating overall quality score:', error);
      return 50;
    }
  }

  /**
   * Determine quality grade based on score
   */
  determineQualityGrade(score) {
    if (score >= this.qualityGrades.excellent) return 'Excellent';
    if (score >= this.qualityGrades.good) return 'Good';
    if (score >= this.qualityGrades.average) return 'Average';
    return 'Poor';
  }

  /**
   * Perform stock evaluation (overvalued, fairly valued, undervalued)
   */
  performStockEvaluation(data, sector) {
    try {
      const benchmarks = this.sectorBenchmarks[sector] || this.sectorBenchmarks['Technology'];
      
      // Calculate valuation ratio based on multiple metrics
      let valuationRatio = 0;
      let metricCount = 0;

      // P/E ratio evaluation
      if (data.peRatio && benchmarks.avgPE) {
        valuationRatio += data.peRatio / benchmarks.avgPE;
        metricCount++;
      }

      // P/B ratio evaluation
      if (data.pbRatio && benchmarks.avgPB) {
        valuationRatio += data.pbRatio / benchmarks.avgPB;
        metricCount++;
      }

      // P/S ratio evaluation (if available)
      if (data.psRatio) {
        const avgPS = 2.5; // Generic benchmark
        valuationRatio += data.psRatio / avgPS;
        metricCount++;
      }

      const avgValuationRatio = metricCount > 0 ? valuationRatio / metricCount : 1.0;

      // Determine evaluation
      let evaluation = 'Fairly Valued';
      let confidence = 'Medium';

      if (avgValuationRatio >= this.valuationThresholds.severelyOvervalued) {
        evaluation = 'Severely Overvalued';
        confidence = 'High';
      } else if (avgValuationRatio >= this.valuationThresholds.overvalued) {
        evaluation = 'Overvalued';
        confidence = 'Medium';
      } else if (avgValuationRatio <= this.valuationThresholds.undervalued) {
        evaluation = 'Undervalued';
        confidence = 'High';
      } else if (avgValuationRatio <= this.valuationThresholds.fairlyValued) {
        evaluation = 'Fairly Valued';
        confidence = 'Medium';
      }

      return {
        evaluation,
        confidence,
        valuationRatio: Math.round(avgValuationRatio * 100) / 100,
        metrics: {
          peRatio: data.peRatio,
          pbRatio: data.pbRatio,
          psRatio: data.psRatio,
          sectorPE: benchmarks.avgPE,
          sectorPB: benchmarks.avgPB
        }
      };

    } catch (error) {
      logger.error('Error performing stock evaluation:', error);
      return {
        evaluation: 'Unknown',
        confidence: 'Low',
        valuationRatio: 1.0,
        metrics: {}
      };
    }
  }

  /**
   * Analyze financial trends over time
   */
  analyzeFinancialTrends(data) {
    try {
      const trends = {
        revenue: this.analyzeTrend(data.revenueHistory, 'Revenue'),
        profit: this.analyzeTrend(data.profitHistory, 'Profit'),
        roe: this.analyzeTrend(data.roeHistory, 'ROE'),
        overall: 'Stable'
      };

      // Determine overall trend
      const trendScores = {
        'Improving': 1,
        'Stable': 0,
        'Declining': -1
      };

      const avgTrendScore = Object.values(trends)
        .filter(trend => trend !== 'Stable' && typeof trend === 'object')
        .map(trend => trendScores[trend.direction] || 0)
        .reduce((sum, score) => sum + score, 0) / 3;

      if (avgTrendScore > 0.3) trends.overall = 'Improving';
      else if (avgTrendScore < -0.3) trends.overall = 'Declining';
      else trends.overall = 'Stable';

      return trends;

    } catch (error) {
      logger.error('Error analyzing financial trends:', error);
      return {
        revenue: { direction: 'Unknown', strength: 'Low' },
        profit: { direction: 'Unknown', strength: 'Low' },
        roe: { direction: 'Unknown', strength: 'Low' },
        overall: 'Unknown'
      };
    }
  }

  /**
   * Analyze trend for a specific metric
   */
  analyzeTrend(history, metricName) {
    if (!history || history.length < 3) {
      return { direction: 'Unknown', strength: 'Low', metricName };
    }

    try {
      // Calculate trend using linear regression
      const n = history.length;
      const x = Array.from({length: n}, (_, i) => i);
      const y = history;

      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const avgY = sumY / n;
      
      // Determine direction and strength
      const relativeSlope = slope / avgY; // Normalize by average value
      
      let direction = 'Stable';
      let strength = 'Low';

      if (Math.abs(relativeSlope) > 0.1) {
        direction = relativeSlope > 0 ? 'Improving' : 'Declining';
        
        if (Math.abs(relativeSlope) > 0.2) strength = 'High';
        else if (Math.abs(relativeSlope) > 0.1) strength = 'Medium';
        else strength = 'Low';
      }

      return {
        direction,
        strength,
        metricName,
        slope: Math.round(relativeSlope * 10000) / 100, // Percentage change per period
        recentValue: history[history.length - 1],
        historicalAverage: Math.round(avgY * 100) / 100
      };

    } catch (error) {
      logger.error(`Error analyzing trend for ${metricName}:`, error);
      return { direction: 'Unknown', strength: 'Low', metricName };
    }
  }

  /**
   * Perform sector comparison and ranking
   */
  performSectorComparison(data, sector) {
    try {
      const benchmarks = this.sectorBenchmarks[sector] || this.sectorBenchmarks['Technology'];
      
      const comparison = {
        sector,
        rankings: {},
        percentiles: {},
        overallRanking: 'Average'
      };

      // Compare key metrics
      const metrics = [
        { key: 'peRatio', benchmark: benchmarks.avgPE, lowerIsBetter: true },
        { key: 'pbRatio', benchmark: benchmarks.avgPB, lowerIsBetter: true },
        { key: 'returnOnEquity', benchmark: benchmarks.avgROE / 100, lowerIsBetter: false },
        { key: 'profitMargin', benchmark: benchmarks.avgProfitMargin / 100, lowerIsBetter: false },
        { key: 'currentRatio', benchmark: benchmarks.avgCurrentRatio, lowerIsBetter: false },
        { key: 'debtToEquity', benchmark: benchmarks.avgDebtToEquity, lowerIsBetter: true }
      ];

      let totalPercentile = 0;
      let validMetrics = 0;

      metrics.forEach(metric => {
        const value = data[metric.key];
        if (value !== null && value !== undefined) {
          const percentile = this.calculatePercentile(value, metric.benchmark, metric.lowerIsBetter);
          comparison.percentiles[metric.key] = percentile;
          comparison.rankings[metric.key] = this.getPercentileRanking(percentile);
          totalPercentile += percentile;
          validMetrics++;
        }
      });

      // Calculate overall ranking
      if (validMetrics > 0) {
        const avgPercentile = totalPercentile / validMetrics;
        comparison.overallRanking = this.getPercentileRanking(avgPercentile);
        comparison.overallPercentile = Math.round(avgPercentile);
      }

      return comparison;

    } catch (error) {
      logger.error('Error performing sector comparison:', error);
      return {
        sector,
        rankings: {},
        percentiles: {},
        overallRanking: 'Unknown'
      };
    }
  }

  /**
   * Calculate percentile ranking relative to sector benchmark
   */
  calculatePercentile(value, benchmark, lowerIsBetter = false) {
    if (!value || !benchmark) return 50;

    const ratio = value / benchmark;
    
    if (lowerIsBetter) {
      // For metrics where lower is better (P/E, P/B, Debt ratios)
      if (ratio <= 0.7) return 90;
      if (ratio <= 0.85) return 75;
      if (ratio <= 1.15) return 50;
      if (ratio <= 1.3) return 25;
      return 10;
    } else {
      // For metrics where higher is better (ROE, Profit Margin, etc.)
      if (ratio >= 1.3) return 90;
      if (ratio >= 1.15) return 75;
      if (ratio >= 0.85) return 50;
      if (ratio >= 0.7) return 25;
      return 10;
    }
  }

  /**
   * Convert percentile to ranking description
   */
  getPercentileRanking(percentile) {
    if (percentile >= 80) return 'Top Tier';
    if (percentile >= 60) return 'Above Average';
    if (percentile >= 40) return 'Average';
    if (percentile >= 20) return 'Below Average';
    return 'Bottom Tier';
  }

  /**
   * Assess quality-related risks
   */
  assessQualityRisks(data, qualityScore) {
    const risks = {
      overall: 'Medium',
      factors: [],
      score: qualityScore
    };

    try {
      // High debt risk
      if (data.debtToEquity > 1.0) {
        risks.factors.push('High debt levels may impact financial flexibility');
      }

      // Low liquidity risk
      if (data.currentRatio < 1.2) {
        risks.factors.push('Low liquidity may indicate cash flow challenges');
      }

      // Declining profitability risk
      if (data.profitMargin < 0.05) {
        risks.factors.push('Low profit margins indicate competitive pressure');
      }

      // High valuation risk
      if (data.peRatio > 30) {
        risks.factors.push('High valuation may limit upside potential');
      }

      // Poor ROE risk
      if (data.returnOnEquity < 0.08) {
        risks.factors.push('Low return on equity indicates inefficient capital use');
      }

      // Determine overall risk level
      if (qualityScore >= 75 && risks.factors.length <= 1) {
        risks.overall = 'Low';
      } else if (qualityScore >= 50 && risks.factors.length <= 3) {
        risks.overall = 'Medium';
      } else {
        risks.overall = 'High';
      }

    } catch (error) {
      logger.error('Error assessing quality risks:', error);
    }

    return risks;
  }

  /**
   * Generate quality-based recommendations
   */
  generateQualityRecommendations(analysis) {
    const recommendations = [];

    try {
      const { qualityScore, qualityGrade, evaluation, financialTrends } = analysis;

      // Quality-based recommendations
      if (qualityScore >= 80) {
        recommendations.push('High-quality stock suitable for long-term investment');
      } else if (qualityScore >= 60) {
        recommendations.push('Good quality stock with solid fundamentals');
      } else if (qualityScore < 40) {
        recommendations.push('Consider avoiding due to poor quality metrics');
      }

      // Valuation-based recommendations
      if (evaluation.evaluation === 'Undervalued') {
        recommendations.push('Stock appears undervalued - potential buying opportunity');
      } else if (evaluation.evaluation === 'Overvalued') {
        recommendations.push('Stock appears overvalued - exercise caution');
      }

      // Trend-based recommendations
      if (financialTrends.overall === 'Improving') {
        recommendations.push('Positive financial trends support investment thesis');
      } else if (financialTrends.overall === 'Declining') {
        recommendations.push('Declining trends warrant careful monitoring');
      }

      // Risk-based recommendations
      if (analysis.riskAssessment.overall === 'High') {
        recommendations.push('High risk profile - suitable only for risk-tolerant investors');
      }

    } catch (error) {
      logger.error('Error generating quality recommendations:', error);
    }

    return recommendations.length > 0 ? recommendations : ['Comprehensive analysis required for investment decision'];
  }
}

module.exports = new StockQualityService();