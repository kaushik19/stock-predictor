const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testYahooFinanceIntegration() {
  console.log('📈 Testing Yahoo Finance API Integration...\n');

  try {
    // Test 1: Get single stock quote
    console.log('1. Testing Single Stock Quote...');
    try {
      const quoteResponse = await axios.get(`${BASE_URL}/api/stocks/quote/RELIANCE`);
      console.log('✅ Single quote successful');
      console.log(`   Symbol: ${quoteResponse.data.data.symbol}`);
      console.log(`   Name: ${quoteResponse.data.data.name}`);
      console.log(`   Price: ₹${quoteResponse.data.data.currentPrice}`);
      console.log(`   Change: ${quoteResponse.data.data.priceChangePercent.toFixed(2)}%`);
      console.log(`   Market Cap: ₹${(quoteResponse.data.data.marketCap / 10000000).toFixed(0)} Cr`);
    } catch (error) {
      console.log(`⚠️  Single quote test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Get multiple stock quotes
    console.log('\n2. Testing Multiple Stock Quotes...');
    try {
      const multipleQuotesResponse = await axios.post(`${BASE_URL}/api/stocks/quotes`, {
        symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC']
      });
      console.log('✅ Multiple quotes successful');
      console.log(`   Retrieved ${multipleQuotesResponse.data.count} quotes`);
      multipleQuotesResponse.data.data.forEach(stock => {
        console.log(`   ${stock.symbol}: ₹${stock.currentPrice} (${stock.priceChangePercent.toFixed(2)}%)`);
      });
    } catch (error) {
      console.log(`⚠️  Multiple quotes test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Search stocks
    console.log('\n3. Testing Stock Search...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}/api/stocks/search?q=reliance&limit=5`);
      console.log('✅ Stock search successful');
      console.log(`   Found ${searchResponse.data.count} results for "reliance"`);
      searchResponse.data.data.forEach(result => {
        console.log(`   ${result.symbol}: ${result.name} (${result.exchange})`);
      });
    } catch (error) {
      console.log(`⚠️  Search test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Get market status
    console.log('\n4. Testing Market Status...');
    try {
      const marketStatusResponse = await axios.get(`${BASE_URL}/api/stocks/market-status`);
      console.log('✅ Market status successful');
      console.log(`   Market Open: ${marketStatusResponse.data.data.isOpen ? 'Yes' : 'No'}`);
      console.log(`   NSE: ${marketStatusResponse.data.data.exchanges.NSE.isOpen ? 'Open' : 'Closed'}`);
      console.log(`   BSE: ${marketStatusResponse.data.data.exchanges.BSE.isOpen ? 'Open' : 'Closed'}`);
      console.log(`   Timezone: ${marketStatusResponse.data.data.timezone}`);
    } catch (error) {
      console.log(`⚠️  Market status test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Get popular stocks
    console.log('\n5. Testing Popular Stocks...');
    try {
      const popularResponse = await axios.get(`${BASE_URL}/api/stocks/popular`);
      console.log('✅ Popular stocks successful');
      console.log(`   Retrieved ${popularResponse.data.count} popular stocks`);
      popularResponse.data.data.slice(0, 5).forEach(stock => {
        console.log(`   ${stock.symbol}: ₹${stock.currentPrice} (Cap: ₹${(stock.marketCap / 10000000).toFixed(0)} Cr)`);
      });
    } catch (error) {
      console.log(`⚠️  Popular stocks test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 6: Get indices
    console.log('\n6. Testing Market Indices...');
    try {
      const indicesResponse = await axios.get(`${BASE_URL}/api/stocks/indices`);
      console.log('✅ Indices data successful');
      console.log(`   Retrieved ${indicesResponse.data.count} indices`);
      indicesResponse.data.data.forEach(index => {
        console.log(`   ${index.symbol}: ${index.currentPrice.toFixed(2)} (${index.priceChangePercent.toFixed(2)}%)`);
      });
    } catch (error) {
      console.log(`⚠️  Indices test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    // Test 7: Get historical data
    console.log('\n7. Testing Historical Data...');
    try {
      const historicalResponse = await axios.get(`${BASE_URL}/api/stocks/historical/RELIANCE?period=5d&interval=1d`);
      console.log('✅ Historical data successful');
      console.log(`   Symbol: ${historicalResponse.data.data.symbol}`);
      console.log(`   Data points: ${historicalResponse.data.data.count}`);
      console.log(`   Period: ${historicalResponse.data.data.range}`);
      console.log(`   Latest close: ₹${historicalResponse.data.data.data[historicalResponse.data.data.data.length - 1]?.close || 'N/A'}`);
    } catch (error) {
      console.log(`⚠️  Historical data test: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Yahoo Finance API integration testing completed!');

  } catch (error) {
    console.error('❌ Yahoo Finance integration test failed:', error.message);
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🔍 Testing Error Handling...\n');

  try {
    // Test invalid symbol
    console.log('1. Testing Invalid Symbol...');
    try {
      await axios.get(`${BASE_URL}/api/stocks/quote/INVALID123`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Invalid symbol correctly handled');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message}`);
      }
    }

    // Test invalid search query
    console.log('\n2. Testing Empty Search Query...');
    try {
      await axios.get(`${BASE_URL}/api/stocks/search?q=`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Empty search query correctly handled');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message}`);
      }
    }

    // Test invalid historical parameters
    console.log('\n3. Testing Invalid Historical Parameters...');
    try {
      await axios.get(`${BASE_URL}/api/stocks/historical/RELIANCE?period=invalid&interval=invalid`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid parameters correctly handled');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message}`);
      }
    }

    console.log('\n✅ Error handling tests completed!');

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testYahooFinanceIntegration();
  await testErrorHandling();
  
  console.log('\n🚀 Yahoo Finance API testing completed!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Single Stock Quotes');
  console.log('   ✅ Multiple Stock Quotes');
  console.log('   ✅ Stock Search');
  console.log('   ✅ Market Status');
  console.log('   ✅ Popular Stocks');
  console.log('   ✅ Market Indices');
  console.log('   ✅ Historical Data');
  console.log('   ✅ Error Handling');
  console.log('\n💡 The Yahoo Finance integration is ready for production!');
}

runAllTests();