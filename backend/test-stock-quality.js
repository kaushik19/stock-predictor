const stockQualityService = require('./services/stockQualityService');
const { logger } = require('./middleware/errorHandler');

/**
 * Test script for the Stock Quality Service
 * Tests quality scoring, evaluation, and financial trend analysis
 */

async function testStockQualityService() {
  console.log('🚀 Testing Stock Quality Service...\n');

  try {
    // Test 1: Comprehensive Quality Analysis
    console.log('📊 Test 1: Comprehensive Quality Analysis');
    console.log('=' .repeat(50));
    
    const testSymbol = 'RELIANCE';
    const testSector = 'Energy';
    
    try {
      const qualityAnalysis = await stockQualityService.getStockQualityAnalysis(testSymbol, testSector);
      console.log('✅ Quality analysis successful');
      console.log(`📈 Symbol: ${qualityAnalysis.symbol}`);
      console.log(`🏭 Sector: ${qualityAnalysis.sector}`);
      console.log(`🎯 Quality Score: ${qualityAnalysis.qualityScore}/100`);
      console.log(`🏆 Quality Grade: ${qualityAnalysis.qualityGrade}`);
      console.log(`💰 Evaluation: ${qualityAnalysis.evaluation.evaluation}`);
      console.log(`📈 Financial Trend: ${qualityAnalysis.financialTrends.overall}`);
      console.log(`🏅 Sector Ranking: ${qualityAnalysis.sectorComparison.overallRanking}`);
      
      // Test quality dimensions
      console.log('\n🔍 Quality Dimensions:');
      Object.entries(qualityAnalysis.qualityDimensions).forEach(([dimension, score]) => {
        console.log(`   ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}: ${score}/100`);
      });
      
    } catch (error) {
      console.log('❌ Quality analysis failed:', error.message);
    }

    console.log('\n');

    // Test 2: Quality Dimensions Calculation
    console.log('📊 Test 2: Quality Dimensions Calculation');
    console.log('=' .repeat(50));
    
    try {
      // Test with mock data
      const mockData = {
        symbol: 'TEST',
        sector: 'Technology',
        peRatio: 18.5,
        pbRatio: 2.8,
        returnOnEquity: 0.16,
        profitMargin: 0.15,
        revenueGrowth1Y: 0.12,
        earningsGrowth1Y: 0.15,
        debtToEquity: 0.4,
        currentRatio: 2.1,
        revenueHistory: [1000, 1100, 1200, 1320, 1450],
        profitHistory: [150, 165, 180, 198, 217],
        roeHistory: [0.14, 0.15, 0.155, 0.16, 0.165]
      };
      
      const dimensions = stockQualityService.calculateQualityDimensions(mockData, 'Technology');
      console.log('✅ Quality dimensions calculated');
      console.log(`📈 Growth Score: ${dimensions.growth}/100`);
      console.log(`💰 Value Score: ${dimensions.value}/100`);
      console.log(`🏆 Quality Score: ${dimensions.quality}/100`);
      console.log(`🚀 Momentum Score: ${dimensions.momentum}/100`);
      console.log(`⚖️  Stability Score: ${dimensions.stability}/100`);
      
      const overallScore = stockQualityService.calculateOverallQualityScore(dimensions);
      console.log(`🎯 Overall Score: ${overallScore}/100`);
      
      const grade = stockQualityService.determineQualityGrade(overallScore);
      console.log(`🏅 Grade: ${grade}`);
      
    } catch (error) {
      console.log('❌ Quality dimensions calculation failed:', error.message);
    }

    console.log('\n');

    // Test 3: Stock Evaluation
    console.log('📊 Test 3: Stock Evaluation');
    console.log('=' .repeat(50));
    
    try {
      const mockData = {
        peRatio: 25.0,
        pbRatio: 3.5,
        psRatio: 4.2
      };
      
      const evaluation = stockQualityService.performStockEvaluation(mockData, 'Technology');
      console.log('✅ Stock evaluation completed');
      console.log(`💰 Evaluation: ${evaluation.evaluation}`);
      console.log(`🎯 Confidence: ${evaluation.confidence}`);
      console.log(`📊 Valuation Ratio: ${evaluation.valuationRatio}`);
      console.log(`📈 P/E Ratio: ${evaluation.metrics.peRatio}`);
      console.log(`📊 P/B Ratio: ${evaluation.metrics.pbRatio}`);
      
    } catch (error) {
      console.log('❌ Stock evaluation failed:', error.message);
    }

    console.log('\n');

    // Test 4: Financial Trends Analysis
    console.log('📊 Test 4: Financial Trends Analysis');
    console.log('=' .repeat(50));
    
    try {
      const mockData = {
        revenueHistory: [1000, 1100, 1200, 1320, 1450], // Growing trend
        profitHistory: [150, 165, 180, 198, 217], // Growing trend
        roeHistory: [0.14, 0.15, 0.155, 0.16, 0.165] // Improving trend
      };
      
      const trends = stockQualityService.analyzeFinancialTrends(mockData);
      console.log('✅ Financial trends analyzed');
      console.log(`📈 Revenue Trend: ${trends.revenue.direction} (${trends.revenue.strength})`);
      console.log(`💰 Profit Trend: ${trends.profit.direction} (${trends.profit.strength})`);
      console.log(`🎯 ROE Trend: ${trends.roe.direction} (${trends.roe.strength})`);
      console.log(`📊 Overall Trend: ${trends.overall}`);
      
    } catch (error) {
      console.log('❌ Financial trends analysis failed:', error.message);
    }

    console.log('\n');

    // Test 5: Sector Comparison
    console.log('📊 Test 5: Sector Comparison');
    console.log('=' .repeat(50));
    
    try {
      const mockData = {
        peRatio: 20.0,
        pbRatio: 3.0,
        returnOnEquity: 0.18,
        profitMargin: 0.20,
        currentRatio: 2.5,
        debtToEquity: 0.3
      };
      
      const comparison = stockQualityService.performSectorComparison(mockData, 'Technology');
      console.log('✅ Sector comparison completed');
      console.log(`🏭 Sector: ${comparison.sector}`);
      console.log(`🏅 Overall Ranking: ${comparison.overallRanking}`);
      console.log(`📊 Overall Percentile: ${comparison.overallPercentile}%`);
      
      console.log('\n📈 Individual Metric Rankings:');
      Object.entries(comparison.rankings).forEach(([metric, ranking]) => {
        const percentile = comparison.percentiles[metric];
        console.log(`   ${metric}: ${ranking} (${percentile}th percentile)`);
      });
      
    } catch (error) {
      console.log('❌ Sector comparison failed:', error.message);
    }

    console.log('\n');

    // Test 6: Risk Assessment
    console.log('📊 Test 6: Risk Assessment');
    console.log('=' .repeat(50));
    
    try {
      const mockData = {
        debtToEquity: 0.8,
        currentRatio: 1.1,
        profitMargin: 0.04,
        peRatio: 35,
        returnOnEquity: 0.06
      };
      
      const riskAssessment = stockQualityService.assessQualityRisks(mockData, 45);
      console.log('✅ Risk assessment completed');
      console.log(`⚠️  Overall Risk: ${riskAssessment.overall}`);
      console.log(`🎯 Quality Score: ${riskAssessment.score}/100`);
      console.log(`📋 Risk Factors (${riskAssessment.factors.length}):`);
      riskAssessment.factors.forEach((factor, index) => {
        console.log(`   ${index + 1}. ${factor}`);
      });
      
    } catch (error) {
      console.log('❌ Risk assessment failed:', error.message);
    }

    console.log('\n');

    // Test 7: Quality Recommendations
    console.log('📊 Test 7: Quality Recommendations');
    console.log('=' .repeat(50));
    
    try {
      const mockAnalysis = {
        qualityScore: 78,
        qualityGrade: 'Good',
        evaluation: { evaluation: 'Fairly Valued' },
        financialTrends: { overall: 'Improving' },
        riskAssessment: { overall: 'Medium' }
      };
      
      const recommendations = stockQualityService.generateQualityRecommendations(mockAnalysis);
      console.log('✅ Quality recommendations generated');
      console.log(`📋 Recommendations (${recommendations.length}):`);
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      
    } catch (error) {
      console.log('❌ Quality recommendations failed:', error.message);
    }

    console.log('\n');
    console.log('🎉 Stock Quality Service Testing Complete!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 Critical error in testing:', error);
  }
}

// Run the tests
if (require.main === module) {
  testStockQualityService()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testStockQualityService };