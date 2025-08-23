# Indian Stock Predictor - Testing Guide

This guide provides comprehensive instructions for testing the Indian Stock Predictor application both locally and with Docker.

## 🚀 Quick Start Testing

### Option 1: Local Testing (Recommended for Development)

1. **Prerequisites:**
   ```bash
   # Ensure you have MongoDB and Redis running locally
   # MongoDB: mongodb://localhost:27017
   # Redis: redis://localhost:6379
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the backend server:**
   ```bash
   npm run dev:backend
   ```

5. **Test the API:**
   ```bash
   npm run test:local
   ```

### Option 2: Docker Testing (Recommended for Production-like Environment)

1. **Prerequisites:**
   ```bash
   # Ensure Docker and Docker Compose are installed
   docker --version
   docker-compose --version
   ```

2. **Test Docker setup:**
   ```bash
   npm run test:docker
   ```

3. **Start all services:**
   ```bash
   npm run docker:up
   ```

4. **Seed the database:**
   ```bash
   npm run docker:seed
   ```

5. **Test the API:**
   ```bash
   npm run test:local
   ```

## 🧪 Detailed Testing

### Backend API Testing

#### 1. Health Check
```bash
curl http://localhost:5001/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

#### 2. API Root
```bash
curl http://localhost:5001/api
```
Expected response:
```json
{
  "message": "Indian Stock Predictor API",
  "version": "1.0.0",
  "status": "Running",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "stocks": "/api/stocks",
    "recommendations": "/api/recommendations"
  }
}
```

#### 3. API Documentation
Visit: http://localhost:5001/api-docs

### Database Testing

#### 1. Run Model Tests
```bash
# Local
cd backend && npm test

# Docker
npm run docker:test
```

#### 2. Check Database Content
```bash
# MongoDB (local)
mongosh stock-predictor
db.users.countDocuments()
db.stocks.countDocuments()

# MongoDB (Docker)
docker-compose exec mongodb mongosh -u admin -p password123 stock-predictor
```

#### 3. Check Redis Cache
```bash
# Redis (local)
redis-cli
keys *

# Redis (Docker)
docker-compose exec redis redis-cli -a redis123
keys *
```

### Performance Testing

#### 1. Load Testing with Artillery
```bash
# Install artillery
npm install -g artillery

# Basic load test
artillery quick --count 10 --num 5 http://localhost:5001/health

# Advanced load test
artillery run load-test.yml
```

#### 2. Memory and CPU Monitoring
```bash
# Local monitoring
top -p $(pgrep -f "node server.js")

# Docker monitoring
docker stats
```

## 📊 Test Results Validation

### Expected Test Results

#### Model Tests (10 tests)
- ✅ User Model: 3 tests (creation, validation, password hashing)
- ✅ Stock Model: 2 tests (creation, market cap calculation)
- ✅ Recommendation Model: 2 tests (creation, expiry handling)
- ✅ Portfolio Model: 3 tests (creation, holdings, watchlist)

#### API Tests (4 endpoints)
- ✅ Health Check: Status 200, uptime > 0
- ✅ API Root: Version 1.0.0, 5 features
- ✅ API Status: Memory usage, Node version
- ✅ Swagger Docs: Content length > 3000 bytes

#### Database Tests
- ✅ MongoDB: Connection successful
- ✅ Collections: Users, Stocks, Recommendations, Portfolios
- ✅ Sample Data: 2 users, 5 stocks, 2 recommendations, 2 portfolios

### Performance Benchmarks

#### Response Times (Target)
- Health Check: < 50ms
- API Root: < 100ms
- Database Queries: < 200ms
- Complex Recommendations: < 500ms

#### Resource Usage (Target)
- Memory: < 100MB (development)
- CPU: < 10% (idle)
- Database Connections: < 10

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -an | findstr "5001"

# Kill the process
taskkill /PID <process_id> /F
```

#### 2. Database Connection Failed
```bash
# Check MongoDB status
mongosh --eval "db.runCommand({ping: 1})"

# Check Redis status
redis-cli ping
```

#### 3. Docker Issues
```bash
# Check Docker status
docker ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

#### 4. Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Enable Debug Logging
```bash
# Set environment variable
export DEBUG=stock-predictor:*

# Or in .env file
DEBUG=stock-predictor:*
LOG_LEVEL=debug
```

#### View Detailed Logs
```bash
# Local
tail -f backend/logs/app.log

# Docker
docker-compose logs -f backend
```

## 📈 Monitoring and Metrics

### Application Metrics

#### Health Metrics
- Server uptime
- Memory usage
- Response times
- Error rates

#### Business Metrics
- Active users
- API requests per minute
- Database query performance
- Cache hit rates

### Monitoring Tools

#### Built-in Monitoring
- Health check endpoint: `/health`
- Status endpoint: `/api/status`
- Swagger metrics: `/api-docs`

#### External Monitoring (Optional)
- Prometheus + Grafana
- New Relic
- DataDog
- Winston logging

## 🔒 Security Testing

### Basic Security Checks

#### 1. CORS Configuration
```bash
curl -H "Origin: http://malicious-site.com" http://localhost:5001/api
```

#### 2. Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..20}; do curl http://localhost:5001/api; done
```

#### 3. Input Validation
```bash
# Test with invalid data
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "123"}'
```

## 📝 Test Reports

### Generate Test Reports

#### Coverage Report
```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

#### Performance Report
```bash
artillery run load-test.yml --output report.json
artillery report report.json
```

### Continuous Integration

#### GitHub Actions (Example)
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:local
      - run: npm run docker:test
```

## 🎯 Next Steps

After successful testing:

1. **Development**: Start building new features
2. **Integration**: Connect with external APIs
3. **Frontend**: Develop Vue.js components
4. **Deployment**: Set up production environment
5. **Monitoring**: Implement comprehensive monitoring

## 📞 Support

For testing issues:

1. Check this guide first
2. Review application logs
3. Test with minimal configuration
4. Create issue with detailed error information

---

**Happy Testing! 🚀**