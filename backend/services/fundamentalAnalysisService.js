const { logger } = require('../middleware/errorHandler');

/**
 * Fundamental Analysis Service
 * Provides comprehensive fundamental analysis calculations and scoring
 */
class FundamentalAnalysisService {
  constructor() {
    this.sectorBenchmarks = {
      'Technology': { avgPE: 25, avgPB: 4.5, avgROE: 18, avgDebtToEquity: 0.3 },
      'Banking': { avgPE: 12, avgPB: 1.2, avgROE: 15, avgDebtToEquity: 6.5 },
      'Energy': { avgPE: 15, avgPB: 1.8, avgROE: 12, avgDebtToEquity: 0.8 },
      'Healthcare': { avgPE: 22, avgPB: 3.2, avgROE: 16, avgDebtToEquity: 0.4 },
      'Consumer Goods': { avgPE: 18, avgPB: 2.8, avgROE: 14, avgDebtToEquity: 0.5 },
      'Industrials': { avgPE: 16, avgPB: 2.2, avgROE: 13, avgDebtToEquity: 0.6 },
      'Telecommunications': { avgPE: 14, avgPB: 1.5, avgROE: 11, avgDebtToEquity: 1.2 },
      'Utilities': { avgPE: 13, avgPB: 1.4, avgROE: 10, avgDebtToEquity: 0.9 },
      'Materials': { avgPE: 17, avgPB: 2.0, avgROE: 12, avgDebtToEquity: 0.7 },
      'Real Estate': { avgPE: 20, avgPB: 1.6, avgROE: 8, avgDebtToEquity: 1.5 }
    };
  }

  /**
   * Calculate comprehensive fundamental analysis
   */
  async analyzeFundamentals(companyData, sector = 'Technology') {
    try {
      const analysis = {
        symbol: companyData.symbol,
        companyName: companyData.name,
        sector: sector,
        lastUpdated: new Date().toISOString(),
        ratios: {},
        scores: {},
        valuation: {},
        growth: {},
        profitability: {},
        financial_health: {},
        peer_comparison: {},
        recommendation: {}
      };

      // Calculate financial ratios
      analysis.ratios = this.calculateFinancialRatios(companyData);
      
      // Calculate growth metrics
      analysis.growth = this.calculateGrowthMetrics(companyData);
      
      // Calculate profitability metrics
      analysis.profitability = this.calculateProfitabilityMetrics(companyData);
      
      // Calculate financial health metrics
      analysis.financial_health = this.calculateFinancialHealth(companyData);
      
      // Perform peer comparison
      analysis.peer_comparison = this.performPeerComparison(analysis.ratios, sector);
      
      // Calculate valuation scores
      analysis.scores = this.calculateValuationScores(analysis.ratios, analysis.growth, sector);
      
      // Generate overall valuation assessment
      analysis.valuation = this.generateValuationAssessment(analysis.scores, analysis.ratios);
      
      // Generate recommendation
      analysis.recommendation = this.generateRecommendation(analysis);

      return analysis;
    } catch (error) {
      logger.error('Error in fundamental analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate key financial ratios
   */
  calculateFinancialRatios(data) {
    const ratios = {};

    try {
      // Price ratios
      ratios.pe_ratio = this.parseNumber(data.peRatio);
      ratios.pb_ratio = this.parseNumber(data.pbRatio);
      ratios.ps_ratio = this.parseNumber(data.psRatio);
      ratios.peg_ratio = this.parseNumber(data.pegRatio);

      // Profitability ratios
      ratios.profit_margin = this.parseNumber(data.profitMargin) !== null ? this.parseNumber(data.profitMargin) * 100 : null;
      ratios.operating_margin = this.parseNumber(data.operatingMargin) !== null ? this.parseNumber(data.operatingMargin) * 100 : null;
      ratios.gross_margin = this.parseNumber(data.grossMargin) !== null ? this.parseNumber(data.grossMargin) * 100 : null;
      ratios.roe = this.parseNumber(data.returnOnEquity) !== null ? this.parseNumber(data.returnOnEquity) * 100 : null;
      ratios.roa = this.parseNumber(data.returnOnAssets) !== null ? this.parseNumber(data.returnOnAssets) * 100 : null;
      ratios.roic = this.parseNumber(data.returnOnCapital) !== null ? this.parseNumber(data.returnOnCapital) * 100 : null;

      // Liquidity ratios
      ratios.current_ratio = this.parseNumber(data.currentRatio);
      ratios.quick_ratio = this.parseNumber(data.quickRatio);
      ratios.cash_ratio = this.parseNumber(data.cashRatio);

      // Leverage ratios
      ratios.debt_to_equity = this.parseNumber(data.debtToEquity);
      ratios.debt_ratio = this.parseNumber(data.debtRatio);
      ratios.equity_ratio = this.parseNumber(data.equityRatio);
      ratios.interest_coverage = this.parseNumber(data.interestCoverage);

      // Efficiency ratios
      ratios.asset_turnover = this.parseNumber(data.assetTurnover);
      ratios.inventory_turnover = this.parseNumber(data.inventoryTurnover);
      ratios.receivables_turnover = this.parseNumber(data.receivablesTurnover);

      // Market ratios
      ratios.dividend_yield = this.parseNumber(data.dividendYield) !== null ? this.parseNumber(data.dividendYield) * 100 : null;
      ratios.dividend_payout_ratio = this.parseNumber(data.payoutRatio) !== null ? this.parseNumber(data.payoutRatio) * 100 : null;
      ratios.book_value_per_share = this.parseNumber(data.bookValuePerShare);
      ratios.earnings_per_share = this.parseNumber(data.eps);

    } catch (error) {
      logger.error('Error calculating financial ratios:', error);
    }

    return ratios;
  }

  /**
   * Calculate growth metrics
   */
  calculateGrowthMetrics(data) {
    const growth = {};

    try {
      // Revenue growth
      growth.revenue_growth_1y = this.parseNumber(data.revenueGrowth1Y) !== null ? this.parseNumber(data.revenueGrowth1Y) * 100 : null;
      growth.revenue_growth_3y = this.parseNumber(data.revenueGrowth3Y) !== null ? this.parseNumber(data.revenueGrowth3Y) * 100 : null;
      growth.revenue_growth_5y = this.parseNumber(data.revenueGrowth5Y) !== null ? this.parseNumber(data.revenueGrowth5Y) * 100 : null;

      // Earnings growth
      growth.earnings_growth_1y = this.parseNumber(data.earningsGrowth1Y) !== null ? this.parseNumber(data.earningsGrowth1Y) * 100 : null;
      growth.earnings_growth_3y = this.parseNumber(data.earningsGrowth3Y) !== null ? this.parseNumber(data.earningsGrowth3Y) * 100 : null;
      growth.earnings_growth_5y = this.parseNumber(data.earningsGrowth5Y) !== null ? this.parseNumber(data.earningsGrowth5Y) * 100 : null;

      // Book value growth
      growth.book_value_growth_1y = this.parseNumber(data.bookValueGrowth1Y) !== null ? this.parseNumber(data.bookValueGrowth1Y) * 100 : null;
      growth.book_value_growth_3y = this.parseNumber(data.bookValueGrowth3Y) !== null ? this.parseNumber(data.bookValueGrowth3Y) * 100 : null;

      // Dividend growth
      growth.dividend_growth_1y = this.parseNumber(data.dividendGrowth1Y) !== null ? this.parseNumber(data.dividendGrowth1Y) * 100 : null;
      growth.dividend_growth_3y = this.parseNumber(data.dividendGrowth3Y) !== null ? this.parseNumber(data.dividendGrowth3Y) * 100 : null;

      // Calculate average growth rates
      growth.avg_revenue_growth = this.calculateAverage([
        growth.revenue_growth_1y,
        growth.revenue_growth_3y,
        growth.revenue_growth_5y
      ]);

      growth.avg_earnings_growth = this.calculateAverage([
        growth.earnings_growth_1y,
        growth.earnings_growth_3y,
        growth.earnings_growth_5y
      ]);

    } catch (error) {
      logger.error('Error calculating growth metrics:', error);
    }

    return growth;
  }

  /**
   * Calculate profitability metrics
   */
  calculateProfitabilityMetrics(data) {
    const profitability = {};

    try {
      // Margin analysis
      profitability.gross_margin_trend = this.analyzeTrend(data.grossMarginHistory);
      profitability.operating_margin_trend = this.analyzeTrend(data.operatingMarginHistory);
      profitability.net_margin_trend = this.analyzeTrend(data.netMarginHistory);

      // Return metrics
      profitability.roe_trend = this.analyzeTrend(data.roeHistory);
      profitability.roa_trend = this.analyzeTrend(data.roaHistory);
      profitability.roic_trend = this.analyzeTrend(data.roicHistory);

      // Profitability scores
      profitability.margin_quality_score = this.calculateMarginQualityScore(data);
      profitability.return_quality_score = this.calculateReturnQualityScore(data);
      profitability.profitability_consistency = this.calculateProfitabilityConsistency(data);

    } catch (error) {
      logger.error('Error calculating profitability metrics:', error);
    }

    return profitability;
  }

  /**
   * Calculate financial health metrics
   */
  calculateFinancialHealth(data) {
    const health = {};

    try {
      // Liquidity health
      health.liquidity_score = this.calculateLiquidityScore(data);
      
      // Solvency health
      health.solvency_score = this.calculateSolvencyScore(data);
      
      // Efficiency health
      health.efficiency_score = this.calculateEfficiencyScore(data);
      
      // Overall financial health
      health.overall_score = this.calculateOverallHealthScore(health);
      
      // Financial strength rating
      health.strength_rating = this.getStrengthRating(health.overall_score);
      
      // Risk assessment
      health.risk_level = this.assessRiskLevel(data, health);
      
      // Bankruptcy risk (Altman Z-Score)
      health.altman_z_score = this.calculateAltmanZScore(data);
      health.bankruptcy_risk = this.assessBankruptcyRisk(health.altman_z_score);

    } catch (error) {
      logger.error('Error calculating financial health:', error);
    }

    return health;
  }

  /**
   * Perform peer comparison analysis
   */
  performPeerComparison(ratios, sector) {
    const comparison = {};
    const benchmarks = this.sectorBenchmarks[sector] || this.sectorBenchmarks['Technology'];

    try {
      // PE comparison
      comparison.pe_vs_sector = {
        company: ratios.pe_ratio,
        sector_avg: benchmarks.avgPE,
        percentile: this.calculatePercentile(ratios.pe_ratio, benchmarks.avgPE, 'lower_better'),
        assessment: this.assessMetric(ratios.pe_ratio, benchmarks.avgPE, 'lower_better')
      };

      // PB comparison
      comparison.pb_vs_sector = {
        company: ratios.pb_ratio,
        sector_avg: benchmarks.avgPB,
        percentile: this.calculatePercentile(ratios.pb_ratio, benchmarks.avgPB, 'lower_better'),
        assessment: this.assessMetric(ratios.pb_ratio, benchmarks.avgPB, 'lower_better')
      };

      // ROE comparison
      comparison.roe_vs_sector = {
        company: ratios.roe,
        sector_avg: benchmarks.avgROE,
        percentile: this.calculatePercentile(ratios.roe, benchmarks.avgROE, 'higher_better'),
        assessment: this.assessMetric(ratios.roe, benchmarks.avgROE, 'higher_better')
      };

      // Debt-to-Equity comparison
      comparison.debt_equity_vs_sector = {
        company: ratios.debt_to_equity,
        sector_avg: benchmarks.avgDebtToEquity,
        percentile: this.calculatePercentile(ratios.debt_to_equity, benchmarks.avgDebtToEquity, 'lower_better'),
        assessment: this.assessMetric(ratios.debt_to_equity, benchmarks.avgDebtToEquity, 'lower_better')
      };

      // Overall sector comparison score
      comparison.overall_sector_score = this.calculateOverallSectorScore(comparison);

    } catch (error) {
      logger.error('Error in peer comparison:', error);
    }

    return comparison;
  }

  /**
   * Calculate valuation scores
   */
  calculateValuationScores(ratios, growth, sector) {
    const scores = {};

    try {
      // Value score (based on price ratios)
      scores.value_score = this.calculateValueScore(ratios, sector);
      
      // Growth score
      scores.growth_score = this.calculateGrowthScore(growth);
      
      // Quality score (based on profitability and financial health)
      scores.quality_score = this.calculateQualityScore(ratios);
      
      // Momentum score (based on recent performance)
      scores.momentum_score = this.calculateMomentumScore(ratios, growth);
      
      // Overall composite score
      scores.composite_score = this.calculateCompositeScore(scores);
      
      // Score interpretation
      scores.interpretation = this.interpretCompositeScore(scores.composite_score);

    } catch (error) {
      logger.error('Error calculating valuation scores:', error);
    }

    return scores;
  }

  /**
   * Generate valuation assessment
   */
  generateValuationAssessment(scores, ratios) {
    const assessment = {};

    try {
      // Overall valuation
      assessment.overall_valuation = this.determineOverallValuation(scores.composite_score);
      
      // Fair value estimate
      assessment.fair_value_estimate = this.calculateFairValueEstimate(ratios, scores);
      
      // Margin of safety
      assessment.margin_of_safety = this.calculateMarginOfSafety(ratios, assessment.fair_value_estimate);
      
      // Investment thesis
      assessment.investment_thesis = this.generateInvestmentThesis(scores, ratios);
      
      // Key strengths and weaknesses
      assessment.strengths = this.identifyStrengths(scores, ratios);
      assessment.weaknesses = this.identifyWeaknesses(scores, ratios);
      
      // Risk factors
      assessment.risk_factors = this.identifyRiskFactors(ratios, scores);

    } catch (error) {
      logger.error('Error generating valuation assessment:', error);
    }

    return assessment;
  }

  /**
   * Generate investment recommendation
   */
  generateRecommendation(analysis) {
    const recommendation = {};

    try {
      const compositeScore = analysis.scores.composite_score || 50;
      const healthScore = analysis.financial_health.overall_score || 50;
      const sectorScore = analysis.peer_comparison.overall_sector_score || 50;

      // Overall recommendation
      recommendation.action = this.determineRecommendationAction(compositeScore, healthScore, sectorScore);
      
      // Confidence level
      recommendation.confidence = this.calculateRecommendationConfidence(analysis);
      
      // Target price
      recommendation.target_price = analysis.valuation.fair_value_estimate;
      
      // Time horizon
      recommendation.time_horizon = this.determineTimeHorizon(analysis);
      
      // Risk rating
      recommendation.risk_rating = analysis.financial_health.risk_level;
      
      // Key reasons
      recommendation.reasons = this.generateRecommendationReasons(analysis);
      
      // Catalysts to watch
      recommendation.catalysts = this.identifyCatalysts(analysis);

    } catch (error) {
      logger.error('Error generating recommendation:', error);
    }

    return recommendation;
  }

  // Helper methods for calculations

  calculateValueScore(ratios, sector) {
    const benchmarks = this.sectorBenchmarks[sector] || this.sectorBenchmarks['Technology'];
    let score = 50; // Base score

    // PE ratio scoring
    if (ratios.pe_ratio && benchmarks.avgPE) {
      const peScore = Math.max(0, Math.min(100, 100 - ((ratios.pe_ratio / benchmarks.avgPE - 1) * 50)));
      score += (peScore - 50) * 0.3;
    }

    // PB ratio scoring
    if (ratios.pb_ratio && benchmarks.avgPB) {
      const pbScore = Math.max(0, Math.min(100, 100 - ((ratios.pb_ratio / benchmarks.avgPB - 1) * 50)));
      score += (pbScore - 50) * 0.2;
    }

    // Dividend yield bonus
    if (ratios.dividend_yield > 2) {
      score += Math.min(10, ratios.dividend_yield - 2);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateGrowthScore(growth) {
    let score = 50; // Base score

    // Revenue growth scoring
    if (growth.avg_revenue_growth !== null) {
      score += Math.min(25, Math.max(-25, growth.avg_revenue_growth * 2));
    }

    // Earnings growth scoring
    if (growth.avg_earnings_growth !== null) {
      score += Math.min(25, Math.max(-25, growth.avg_earnings_growth * 1.5));
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateQualityScore(ratios) {
    let score = 50; // Base score

    // ROE scoring
    if (ratios.roe !== null) {
      score += Math.min(20, Math.max(-20, (ratios.roe - 15) * 2));
    }

    // Profit margin scoring
    if (ratios.profit_margin !== null) {
      score += Math.min(15, Math.max(-15, (ratios.profit_margin - 10) * 1.5));
    }

    // Debt-to-equity scoring (lower is better)
    if (ratios.debt_to_equity !== null) {
      score += Math.min(15, Math.max(-15, (1 - ratios.debt_to_equity) * 15));
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateMomentumScore(ratios, growth) {
    let score = 50; // Base score

    // Recent growth momentum
    if (growth.earnings_growth_1y !== null) {
      score += Math.min(30, Math.max(-30, growth.earnings_growth_1y * 2));
    }

    if (growth.revenue_growth_1y !== null) {
      score += Math.min(20, Math.max(-20, growth.revenue_growth_1y * 1.5));
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateCompositeScore(scores) {
    const weights = {
      value: 0.25,
      growth: 0.25,
      quality: 0.30,
      momentum: 0.20
    };

    let compositeScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(key => {
      const scoreKey = `${key}_score`;
      if (scores[scoreKey] !== null && scores[scoreKey] !== undefined) {
        compositeScore += scores[scoreKey] * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? Math.round(compositeScore / totalWeight) : 50;
  }

  // Enhanced calculation methods for financial health and analysis

  /**
   * Calculate liquidity score based on current ratio, quick ratio, and cash ratio
   */
  calculateLiquidityScore(data) {
    let score = 50; // Base score
    
    try {
      const currentRatio = this.parseNumber(data.currentRatio);
      const quickRatio = this.parseNumber(data.quickRatio);
      const cashRatio = this.parseNumber(data.cashRatio);
      
      // Current ratio scoring (ideal range: 1.5-3.0)
      if (currentRatio !== null) {
        if (currentRatio >= 1.5 && currentRatio <= 3.0) {
          score += 20;
        } else if (currentRatio >= 1.2 && currentRatio < 1.5) {
          score += 10;
        } else if (currentRatio > 3.0) {
          score += 5; // Too high might indicate inefficient use of assets
        } else if (currentRatio < 1.0) {
          score -= 20; // Poor liquidity
        }
      }
      
      // Quick ratio scoring (ideal: > 1.0)
      if (quickRatio !== null) {
        if (quickRatio >= 1.0) {
          score += 15;
        } else if (quickRatio >= 0.8) {
          score += 5;
        } else {
          score -= 10;
        }
      }
      
      // Cash ratio scoring (ideal: > 0.2)
      if (cashRatio !== null) {
        if (cashRatio >= 0.2) {
          score += 15;
        } else if (cashRatio >= 0.1) {
          score += 5;
        } else {
          score -= 5;
        }
      }
      
    } catch (error) {
      logger.error('Error calculating liquidity score:', error);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate solvency score based on debt ratios and interest coverage
   */
  calculateSolvencyScore(data) {
    let score = 50; // Base score
    
    try {
      const debtToEquity = this.parseNumber(data.debtToEquity);
      const debtRatio = this.parseNumber(data.debtRatio);
      const interestCoverage = this.parseNumber(data.interestCoverage);
      
      // Debt-to-equity scoring (lower is better, ideal < 0.5)
      if (debtToEquity !== null) {
        if (debtToEquity <= 0.3) {
          score += 25;
        } else if (debtToEquity <= 0.5) {
          score += 15;
        } else if (debtToEquity <= 1.0) {
          score += 5;
        } else if (debtToEquity <= 2.0) {
          score -= 10;
        } else {
          score -= 25;
        }
      }
      
      // Debt ratio scoring (ideal < 0.4)
      if (debtRatio !== null) {
        if (debtRatio <= 0.3) {
          score += 15;
        } else if (debtRatio <= 0.5) {
          score += 5;
        } else if (debtRatio <= 0.7) {
          score -= 5;
        } else {
          score -= 15;
        }
      }
      
      // Interest coverage scoring (higher is better, ideal > 5)
      if (interestCoverage !== null) {
        if (interestCoverage >= 10) {
          score += 10;
        } else if (interestCoverage >= 5) {
          score += 5;
        } else if (interestCoverage >= 2.5) {
          score += 0;
        } else if (interestCoverage >= 1.5) {
          score -= 10;
        } else {
          score -= 20;
        }
      }
      
    } catch (error) {
      logger.error('Error calculating solvency score:', error);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate efficiency score based on asset turnover and other efficiency metrics
   */
  calculateEfficiencyScore(data) {
    let score = 50; // Base score
    
    try {
      const assetTurnover = this.parseNumber(data.assetTurnover);
      const inventoryTurnover = this.parseNumber(data.inventoryTurnover);
      const receivablesTurnover = this.parseNumber(data.receivablesTurnover);
      
      // Asset turnover scoring (higher is better, ideal > 0.5)
      if (assetTurnover !== null) {
        if (assetTurnover >= 1.0) {
          score += 20;
        } else if (assetTurnover >= 0.7) {
          score += 10;
        } else if (assetTurnover >= 0.5) {
          score += 5;
        } else {
          score -= 5;
        }
      }
      
      // Inventory turnover scoring (higher is better, varies by industry)
      if (inventoryTurnover !== null) {
        if (inventoryTurnover >= 8) {
          score += 15;
        } else if (inventoryTurnover >= 4) {
          score += 10;
        } else if (inventoryTurnover >= 2) {
          score += 5;
        } else {
          score -= 5;
        }
      }
      
      // Receivables turnover scoring (higher is better, ideal > 6)
      if (receivablesTurnover !== null) {
        if (receivablesTurnover >= 10) {
          score += 15;
        } else if (receivablesTurnover >= 6) {
          score += 10;
        } else if (receivablesTurnover >= 4) {
          score += 5;
        } else {
          score -= 5;
        }
      }
      
    } catch (error) {
      logger.error('Error calculating efficiency score:', error);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateOverallHealthScore(health) { 
    return Math.round((health.liquidity_score + health.solvency_score + health.efficiency_score) / 3); 
  }

  getStrengthRating(score) { 
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'strong';
    if (score >= 50) return 'moderate';
    if (score >= 30) return 'weak';
    return 'poor';
  }

  assessRiskLevel(data, health) { 
    const score = health.overall_score;
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }

  /**
   * Calculate Altman Z-Score for bankruptcy prediction
   */
  calculateAltmanZScore(data) {
    try {
      const workingCapital = this.parseNumber(data.workingCapital) || 0;
      const totalAssets = this.parseNumber(data.totalAssets) || 1;
      const retainedEarnings = this.parseNumber(data.retainedEarnings) || 0;
      const ebit = this.parseNumber(data.ebit) || 0;
      const marketValue = this.parseNumber(data.marketCapitalization) || 0;
      const totalLiabilities = this.parseNumber(data.totalLiabilities) || 0;
      const sales = this.parseNumber(data.totalRevenue) || 0;
      
      // Altman Z-Score formula for public companies
      const z1 = 1.2 * (workingCapital / totalAssets);
      const z2 = 1.4 * (retainedEarnings / totalAssets);
      const z3 = 3.3 * (ebit / totalAssets);
      const z4 = 0.6 * (marketValue / totalLiabilities);
      const z5 = 1.0 * (sales / totalAssets);
      
      const zScore = z1 + z2 + z3 + z4 + z5;
      
      return Math.round(zScore * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Error calculating Altman Z-Score:', error);
      return 2.5; // Default safe score
    }
  }

  assessBankruptcyRisk(zScore) { 
    if (zScore > 2.99) return 'low';
    if (zScore > 1.8) return 'medium';
    return 'high';
  }

  /**
   * Calculate overall sector comparison score
   */
  calculateOverallSectorScore(comparison) {
    try {
      const scores = [];
      
      // Convert assessments to numeric scores
      const assessmentToScore = {
        'excellent': 90,
        'good': 75,
        'average': 50,
        'below_average': 30,
        'poor': 15
      };
      
      if (comparison.pe_vs_sector && comparison.pe_vs_sector.assessment) {
        scores.push(assessmentToScore[comparison.pe_vs_sector.assessment] || 50);
      }
      
      if (comparison.pb_vs_sector && comparison.pb_vs_sector.assessment) {
        scores.push(assessmentToScore[comparison.pb_vs_sector.assessment] || 50);
      }
      
      if (comparison.roe_vs_sector && comparison.roe_vs_sector.assessment) {
        scores.push(assessmentToScore[comparison.roe_vs_sector.assessment] || 50);
      }
      
      if (comparison.debt_equity_vs_sector && comparison.debt_equity_vs_sector.assessment) {
        scores.push(assessmentToScore[comparison.debt_equity_vs_sector.assessment] || 50);
      }
      
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
    } catch (error) {
      logger.error('Error calculating overall sector score:', error);
      return 50;
    }
  }

  calculateFairValueEstimate(ratios, scores) { return null; }
  calculateMarginOfSafety(ratios, fairValue) { return null; }
  generateInvestmentThesis(scores, ratios) { return 'Investment thesis based on fundamental analysis'; }
  identifyStrengths(scores, ratios) { return ['Strong profitability', 'Good growth prospects']; }
  identifyWeaknesses(scores, ratios) { return ['High valuation', 'Increasing debt levels']; }
  identifyRiskFactors(ratios, scores) { return ['Market volatility', 'Sector competition']; }
  determineTimeHorizon(analysis) { return 'medium_term'; }
  generateRecommendationReasons(analysis) { return ['Strong fundamentals', 'Good growth trajectory']; }
  identifyCatalysts(analysis) { return ['Earnings growth', 'Market expansion']; }
  calculateMarginQualityScore(data) { return 75; }
  calculateReturnQualityScore(data) { return 70; }
  calculateProfitabilityConsistency(data) { return 80; }

  // Additional helper methods

  parseNumber(value) {
    if (value === null || value === undefined || value === 'None' || value === '') {
      return null;
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  calculateAverage(values) {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : null;
  }

  analyzeTrend(history) {
    if (!history || history.length < 2) return 'insufficient_data';
    
    const recent = history.slice(-3);
    const older = history.slice(0, -3);
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    if (recentAvg === null || olderAvg === null) return 'insufficient_data';
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  calculatePercentile(value, benchmark, direction) {
    if (value === null || benchmark === null) return null;
    
    const ratio = value / benchmark;
    
    if (direction === 'lower_better') {
      if (ratio <= 0.8) return 90;
      if (ratio <= 0.9) return 75;
      if (ratio <= 1.1) return 50;
      if (ratio <= 1.2) return 25;
      return 10;
    } else {
      if (ratio >= 1.2) return 90;
      if (ratio >= 1.1) return 75;
      if (ratio >= 0.9) return 50;
      if (ratio >= 0.8) return 25;
      return 10;
    }
  }

  assessMetric(value, benchmark, direction) {
    if (value === null || benchmark === null) return 'unknown';
    
    const ratio = value / benchmark;
    
    if (direction === 'lower_better') {
      if (ratio <= 0.7) return 'excellent';
      if (ratio <= 0.85) return 'good';
      if (ratio <= 1.15) return 'average';
      if (ratio <= 1.3) return 'below_average';
      return 'poor';
    } else {
      if (ratio >= 1.3) return 'excellent';
      if (ratio >= 1.15) return 'good';
      if (ratio >= 0.85) return 'average';
      if (ratio >= 0.7) return 'below_average';
      return 'poor';
    }
  }

  determineRecommendationAction(compositeScore, healthScore, sectorScore) {
    const avgScore = (compositeScore + healthScore + sectorScore) / 3;
    
    if (avgScore >= 75) return 'strong_buy';
    if (avgScore >= 65) return 'buy';
    if (avgScore >= 45) return 'hold';
    if (avgScore >= 35) return 'sell';
    return 'strong_sell';
  }

  calculateRecommendationConfidence(analysis) {
    let confidence = 50;
    
    // Higher confidence for consistent metrics
    const scores = analysis.scores;
    if (scores) {
      const scoreVariance = this.calculateVariance([
        scores.value_score,
        scores.growth_score,
        scores.quality_score,
        scores.momentum_score
      ]);
      
      confidence += Math.max(0, 30 - scoreVariance);
    }
    
    // Higher confidence for good financial health
    if (analysis.financial_health && analysis.financial_health.overall_score > 70) {
      confidence += 10;
    }
    
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  calculateVariance(values) {
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length < 2) return 50;
    
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validValues.length;
    
    return Math.sqrt(variance);
  }

  interpretCompositeScore(score) {
    if (score >= 80) return 'excellent_value';
    if (score >= 70) return 'good_value';
    if (score >= 60) return 'fair_value';
    if (score >= 40) return 'overvalued';
    return 'significantly_overvalued';
  }

  determineOverallValuation(score) {
    if (score >= 70) return 'undervalued';
    if (score >= 55) return 'fairly_valued';
    return 'overvalued';
  }
}

module.exports = new FundamentalAnalysisService();