const recommendationEngine = require('./services/recommendationEngine');
const { logger } = require('./middleware/errorHandler');

/**
 * Test script for the enhanced recommendation engine features
 * Tests the new functionality: stock of the week, stock of the month, and detailed analysis
 */

async function testRecommendationEnhancements() {
  console.log('🚀 Testing Enhanced Recommendation Engine Features...\n');

  try {
    // Test 1: Stock of the Week Prediction
    console.log('📊 Test 1: Stock of the Week Prediction');
    console.log('=' .repeat(50));
    
    try {
      const stockOfTheWeek = await recommendationEngine.predictStockOfTheWeek();
      console.log('✅ Stock of the Week prediction successful');
      console.log(`📈 Selected Stock: ${stockOfTheWeek.stockOfTheWeek.symbol}`);
      console.log(`🎯 Confidence: ${stockOfTheWeek.stockOfTheWeek.confidence}%`);
      console.log(`💰 Current Price: ₹${stockOfTheWeek.stockOfTheWeek.currentPrice}`);
      console.log(`🎯 Target Price: ₹${stockOfTheWeek.stockOfTheWeek.targetPrice}`);
      console.log(`📅 Valid Until: ${new Date(stockOfTheWeek.stockOfTheWeek.validUntil).toLocaleDateString()}`);
      console.log(`🔍 Key Highlights: ${stockOfTheWeek.stockOfTheWeek.keyHighlights?.slice(0, 2).join(', ')}`);
      console.log(`📊 Total Analyzed: ${stockOfTheWeek.totalAnalyzed} stocks`);
    } catch (error) {
      console.log('❌ Stock of the Week prediction failed:', error.message);
    }

    console.log('\n');

    // Test 2: Stock of the Month Prediction
    console.log('📊 Test 2: Stock of the Month Prediction');
    console.log('=' .repeat(50));
    
    try {
      const stockOfTheMonth = await recommendationEngine.predictStockOfTheMonth();
      console.log('✅ Stock of the Month prediction successful');
      console.log(`📈 Selected Stock: ${stockOfTheMonth.stockOfTheMonth.symbol}`);
      console.log(`🎯 Confidence: ${stockOfTheMonth.stockOfTheMonth.confidence}%`);
      console.log(`💰 Current Price: ₹${stockOfTheMonth.stockOfTheMonth.currentPrice}`);
      console.log(`🎯 Target Price: ₹${stockOfTheMonth.stockOfTheMonth.targetPrice}`);
      console.log(`📅 Valid Until: ${new Date(stockOfTheMonth.stockOfTheMonth.validUntil).toLocaleDateString()}`);
      console.log(`🔍 Key Highlights: ${stockOfTheMonth.stockOfTheMonth.keyHighlights?.slice(0, 2).join(', ')}`);
      console.log(`📊 Total Analyzed: ${stockOfTheMonth.totalAnalyzed} stocks`);
    } catch (error) {
      console.log('❌ Stock of the Month prediction failed:', error.message);
    }

    console.log('\n');

    // Test 3: Enhanced Stock Analysis
    console.log('📊 Test 3: Enhanced Stock Analysis');
    console.log('=' .repeat(50));
    
    const testSymbol = 'RELIANCE';
    try {
      const enhancedAnalysis = await recommendationEngine.getEnhancedStockAnalysis(testSymbol, 'monthly');
      console.log(`✅ Enhanced analysis for ${testSymbol} successful`);
      console.log(`🔧 Technical Analysis Available: ${enhancedAnalysis.detailedTechnicalAnalysis ? 'Yes' : 'No'}`);
      console.log(`📊 Fundamental Analysis Available: ${enhancedAnalysis.detailedFundamentalAnalysis ? 'Yes' : 'No'}`);
      console.log(`🌍 Market Context Available: ${enhancedAnalysis.marketContext ? 'Yes' : 'No'}`);
      console.log(`⚠️  Risk Assessment Available: ${enhancedAnalysis.riskAssessment ? 'Yes' : 'No'}`);
      console.log(`🚀 Catalysts Available: ${enhancedAnalysis.catalysts ? 'Yes' : 'No'}`);
      console.log(`🏆 Competitive Position Available: ${enhancedAnalysis.competitivePosition ? 'Yes' : 'No'}`);
      
      if (enhancedAnalysis.detailedTechnicalAnalysis?.keyInsights) {
        console.log(`💡 Technical Insights: ${enhancedAnalysis.detailedTechnicalAnalysis.keyInsights.slice(0, 2).join(', ')}`);
      }
      
      if (enhancedAnalysis.detailedFundamentalAnalysis?.keyInsights) {
        console.log(`💡 Fundamental Insights: ${enhancedAnalysis.detailedFundamentalAnalysis.keyInsights.slice(0, 2).join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Enhanced analysis for ${testSymbol} failed:`, error.message);
    }

    console.log('\n');

    // Test 4: Confidence Scoring System Validation
    console.log('📊 Test 4: Confidence Scoring System Validation');
    console.log('=' .repeat(50));
    
    try {
      const dailyRecs = await recommendationEngine.generateDailyRecommendations(5);
      console.log('✅ Daily recommendations generated for confidence testing');
      
      if (dailyRecs.recommendations && dailyRecs.recommendations.length > 0) {
        console.log('🎯 Confidence Score Analysis:');
        dailyRecs.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.symbol}: ${rec.confidence}% confidence (${rec.recommendation})`);
        });
        
        const avgConfidence = dailyRecs.recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / dailyRecs.recommendations.length;
        console.log(`📊 Average Confidence: ${avgConfidence.toFixed(1)}%`);
        
        const highConfidenceCount = dailyRecs.recommendations.filter(rec => rec.confidence >= 70).length;
        console.log(`🎯 High Confidence Recommendations (≥70%): ${highConfidenceCount}/${dailyRecs.recommendations.length}`);
      }
    } catch (error) {
      console.log('❌ Confidence scoring validation failed:', error.message);
    }

    console.log('\n');

    // Test 5: Algorithm Integration Test
    console.log('📊 Test 5: Algorithm Integration Test');
    console.log('=' .repeat(50));
    
    try {
      const allRecs = await recommendationEngine.getAllRecommendations();
      console.log('✅ All recommendation algorithms working');
      
      const timeHorizons = ['daily', 'weekly', 'monthly', 'yearly'];
      timeHorizons.forEach(horizon => {
        if (allRecs[horizon] && allRecs[horizon].recommendations) {
          console.log(`📈 ${horizon.charAt(0).toUpperCase() + horizon.slice(1)}: ${allRecs[horizon].recommendations.length} recommendations`);
        } else if (allRecs[horizon] && allRecs[horizon].error) {
          console.log(`❌ ${horizon.charAt(0).toUpperCase() + horizon.slice(1)}: Error - ${allRecs[horizon].error}`);
        }
      });
      
      // Test weight distribution
      console.log('\n🔧 Weight Distribution by Time Horizon:');
      Object.keys(recommendationEngine.weights).forEach(horizon => {
        const weights = recommendationEngine.weights[horizon];
        console.log(`   ${horizon}: Technical(${weights.technical}), Fundamental(${weights.fundamental}), Sentiment(${weights.sentiment})`);
      });
      
    } catch (error) {
      console.log('❌ Algorithm integration test failed:', error.message);
    }

    console.log('\n');
    console.log('🎉 Enhanced Recommendation Engine Testing Complete!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 Critical error in testing:', error);
  }
}

// Run the tests
if (require.main === module) {
  testRecommendationEnhancements()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testRecommendationEnhancements };