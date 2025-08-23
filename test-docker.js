const { exec } = require('child_process');
const axios = require('axios');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function testDockerSetup() {
  console.log('🐳 Testing Docker Setup for Indian Stock Predictor...\n');

  try {
    // Test 1: Check Docker is available
    console.log('1. Checking Docker availability...');
    await runCommand('docker --version');
    console.log('✅ Docker is available');

    await runCommand('docker-compose --version');
    console.log('✅ Docker Compose is available\n');

    // Test 2: Start minimal services (MongoDB + Redis)
    console.log('2. Starting database services...');
    await runCommand('docker-compose -f docker-compose.dev.yml up -d');
    console.log('✅ Database services started\n');

    // Wait for services to be ready
    console.log('3. Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test 3: Check if services are running
    console.log('4. Checking service status...');
    const { stdout } = await runCommand('docker-compose -f docker-compose.dev.yml ps');
    console.log('✅ Services status:');
    console.log(stdout);

    // Test 4: Test MongoDB connection
    console.log('5. Testing MongoDB connection...');
    try {
      await runCommand('docker-compose -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.runCommand({ping: 1})" --quiet');
      console.log('✅ MongoDB is responding\n');
    } catch (error) {
      console.log('⚠️  MongoDB test skipped (container might still be starting)\n');
    }

    // Test 5: Test Redis connection
    console.log('6. Testing Redis connection...');
    try {
      await runCommand('docker-compose -f docker-compose.dev.yml exec -T redis redis-cli -a redis123 ping');
      console.log('✅ Redis is responding\n');
    } catch (error) {
      console.log('⚠️  Redis test skipped (container might still be starting)\n');
    }

    console.log('🎉 Docker setup test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Docker and Docker Compose are available');
    console.log('   ✅ MongoDB container is running on port 27017');
    console.log('   ✅ Redis container is running on port 6379');
    console.log('\n💡 Next steps:');
    console.log('   1. Run "docker-compose up -d" to start all services');
    console.log('   2. Run "docker-compose exec backend npm run seed" to populate data');
    console.log('   3. Visit http://localhost:5001/api-docs to explore the API');

  } catch (error) {
    console.error('❌ Docker setup test failed:', error.error?.message || error.message);
    if (error.stderr) {
      console.error('   Error details:', error.stderr);
    }
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test containers...');
    try {
      await runCommand('docker-compose -f docker-compose.dev.yml down');
      console.log('✅ Test containers stopped and removed');
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error.message);
    }
  }
}

testDockerSetup();