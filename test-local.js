const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAPI() {
  console.log('🧪 Testing Indian Stock Predictor API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log(`   Uptime: ${Math.round(healthResponse.data.uptime)}s`);
    console.log(`   Environment: ${healthResponse.data.environment}\n`);

    // Test 2: API Root
    console.log('2. Testing API Root...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API Root:', apiResponse.data.message);
    console.log(`   Version: ${apiResponse.data.version}`);
    console.log(`   Features: ${apiResponse.data.features.length} available\n`);

    // Test 3: API Status
    console.log('3. Testing API Status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/status`);
    console.log('✅ API Status:', statusResponse.data.status);
    console.log(`   Memory Used: ${statusResponse.data.memory.used}MB`);
    console.log(`   Node Version: ${statusResponse.data.version.node}\n`);

    // Test 4: Swagger Documentation
    console.log('4. Testing Swagger Documentation...');
    const swaggerResponse = await axios.get(`${BASE_URL}/api-docs/`);
    console.log('✅ Swagger Documentation: Available');
    console.log(`   Content Length: ${swaggerResponse.headers['content-length']} bytes\n`);

    console.log('🎉 All API tests passed successfully!');
    console.log('\n📚 Available Endpoints:');
    console.log(`   Health Check: ${BASE_URL}/health`);
    console.log(`   API Root: ${BASE_URL}/api`);
    console.log(`   API Status: ${BASE_URL}/api/status`);
    console.log(`   Documentation: ${BASE_URL}/api-docs`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    process.exit(1);
  }
}

// Test database connection
async function testDatabase() {
  console.log('\n🗄️  Testing Database Connection...');
  
  try {
    const mongoose = require('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-predictor';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB: Connected successfully');
    
    // Test collections
    const { User, Stock, Recommendation, Portfolio } = require('./backend/models');
    
    const userCount = await User.countDocuments();
    const stockCount = await Stock.countDocuments();
    const recommendationCount = await Recommendation.countDocuments();
    const portfolioCount = await Portfolio.countDocuments();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Stocks: ${stockCount}`);
    console.log(`   Recommendations: ${recommendationCount}`);
    console.log(`   Portfolios: ${portfolioCount}`);
    
    await mongoose.connection.close();
    console.log('✅ MongoDB: Connection closed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testAPI();
  await testDatabase();
  
  console.log('\n🚀 Local testing completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Open http://localhost:5001/api-docs to explore the API');
  console.log('   2. Use the /api endpoints to interact with the system');
  console.log('   3. Run "npm run seed" in backend/ to populate with sample data');
}

runTests();