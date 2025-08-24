const axios = require('axios');

// Test the new fundamental analysis endpoint
async function testFundamentalAnalysisEndpoint() {
  const baseURL = 'http://localhost:5001';
  
  try {
    console.log('🧪 Testing Fundamental Analysis Endpoint...\n');
    
    // Test with a sample Indian stock symbol
    const symbol = 'RELIANCE';
    const exchange = 'NSE';
    const sector = 'Energy';
    
    console.log(`📊 Testing analysis for ${symbol}.${exchange} in ${sector} sector...`);
    
    const response = await axios.get(`${baseURL}/api/fundamentals/analysis/${symbol}`, {
      params: {
        exchange: exchange,
        sector: sector
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint responded successfully!');
      console.log(`📈 Analysis for: ${response.data.data.symbol}`);
      console.log(`🏢 Company: ${response.data.data.companyName}`);
      console.log(`🏭 Sector: ${response.data.data.sector}`);
      
      // Check if all required sections are present
      const requiredSections = ['ratios', 'scores', 'valuation', 'growth', 'profitability', 'financial_health', 'peer_comparison', 'recommendation'];
      const missingSections = requiredSections.filter(section => !response.data.data[section]);
      
      if (missingSections.length === 0) {
        console.log('✅ All required analysis sections are present');
        
        // Display key metrics
        const data = response.data.data;
        console.log('\n📊 Key Financial Ratios:');
        console.log(`   P/E Ratio: ${data.ratios.pe_ratio || 'N/A'}`);
        console.log(`   P/B Ratio: ${data.ratios.pb_ratio || 'N/A'}`);
        console.log(`   Debt-to-Equity: ${data.ratios.debt_to_equity || 'N/A'}`);
        console.log(`   ROE: ${data.ratios.roe || 'N/A'}%`);
        
        console.log('\n🎯 Valuation Scores:');
        console.log(`   Value Score: ${data.scores.value_score || 'N/A'}/100`);
        console.log(`   Growth Score: ${data.scores.growth_score || 'N/A'}/100`);
        console.log(`   Quality Score: ${data.scores.quality_score || 'N/A'}/100`);
        console.log(`   Composite Score: ${data.scores.composite_score || 'N/A'}/100`);
        
        console.log('\n💡 Investment Recommendation:');
        console.log(`   Action: ${data.recommendation.action || 'N/A'}`);
        console.log(`   Confidence: ${data.recommendation.confidence || 'N/A'}%`);
        console.log(`   Risk Rating: ${data.recommendation.risk_rating || 'N/A'}`);
        
        console.log('\n🔍 Peer Comparison:');
        console.log(`   Overall Sector Score: ${data.peer_comparison.overall_sector_score || 'N/A'}/100`);
        
        console.log('\n✅ Fundamental Analysis Engine is working correctly!');
      } else {
        console.log(`❌ Missing analysis sections: ${missingSections.join(', ')}`);
      }
      
    } else {
      console.log(`❌ Unexpected response status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
      if (error.response.status === 503) {
        console.log('💡 This might be due to Alpha Vantage API key not being configured');
      } else if (error.response.status === 429) {
        console.log('💡 Rate limit exceeded - this is expected with free API tiers');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first with: npm start');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run the test
testFundamentalAnalysisEndpoint();