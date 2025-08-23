# Indian Stock Predictor - Docker Setup

This document provides instructions for running the Indian Stock Predictor application using Docker Compose for local development and testing.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Node.js 18+ (for local testing scripts)
- Git

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd market-trend
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready (about 30-60 seconds):**
   ```bash
   docker-compose logs -f
   ```

4. **Seed the database with sample data:**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Test the API:**
   ```bash
   node test-local.js
   ```

## Services

The Docker Compose setup includes:

### 🗄️ MongoDB (Port 27017)
- **Image:** mongo:7.0
- **Credentials:** admin/password123
- **Database:** stock-predictor
- **Volume:** Persistent data storage

### 🔄 Redis (Port 6379)
- **Image:** redis:7.2-alpine
- **Password:** redis123
- **Volume:** Persistent cache storage

### 🚀 Backend API (Port 5001)
- **Framework:** Node.js + Express
- **Environment:** Development with hot reload
- **Health Check:** http://localhost:5001/health
- **API Docs:** http://localhost:5001/api-docs

### 🎨 Frontend (Port 3000)
- **Framework:** Vue.js 3 + Vite
- **Environment:** Development with hot reload
- **URL:** http://localhost:3000

## Available Commands

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Execute Commands
```bash
# Seed database
docker-compose exec backend npm run seed

# Run tests
docker-compose exec backend npm test

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Access Redis CLI
docker-compose exec redis redis-cli -a redis123
```

## API Endpoints

Once running, the following endpoints are available:

- **Health Check:** http://localhost:5001/health
- **API Root:** http://localhost:5001/api
- **API Status:** http://localhost:5001/api/status
- **Swagger Docs:** http://localhost:5001/api-docs

## Database Access

### MongoDB
- **Host:** localhost:27017
- **Username:** admin
- **Password:** password123
- **Database:** stock-predictor

### Redis
- **Host:** localhost:6379
- **Password:** redis123

## Development Workflow

1. **Make code changes** in `./backend` or `./frontend`
2. **Changes are automatically reflected** (hot reload enabled)
3. **View logs** with `docker-compose logs -f`
4. **Test changes** using the API endpoints or frontend

## Troubleshooting

### Services won't start
```bash
# Check if ports are in use
netstat -an | findstr "5001\|3000\|27017\|6379"

# Stop conflicting services
docker-compose down
```

### Database connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Clear everything and restart
```bash
# Stop and remove everything
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

### View container status
```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats
```

## Environment Variables

The Docker setup uses these key environment variables:

### Backend (.env.docker)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `CLIENT_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: WebSocket URL

## Production Considerations

This Docker setup is optimized for development. For production:

1. **Use production images** (multi-stage builds)
2. **Set secure passwords** and secrets
3. **Use external databases** for scalability
4. **Add reverse proxy** (nginx)
5. **Enable SSL/TLS**
6. **Configure monitoring** and logging

## Testing

### Automated Testing
```bash
# Run backend tests
docker-compose exec backend npm test

# Run with coverage
docker-compose exec backend npm run test:coverage
```

### Manual Testing
```bash
# Test API endpoints
node test-local.js

# Test specific endpoints
curl http://localhost:5001/health
curl http://localhost:5001/api
```

### Load Testing
```bash
# Install artillery (if not installed)
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 http://localhost:5001/health
```

## Monitoring

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps
```

### Resource Monitoring
```bash
# Monitor resource usage
docker stats

# View detailed container info
docker-compose exec backend top
```

## Backup and Restore

### Backup MongoDB
```bash
# Create backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/stock-predictor?authSource=admin" --out=/tmp/backup

# Copy backup to host
docker cp stock-predictor-mongodb:/tmp/backup ./backup
```

### Restore MongoDB
```bash
# Copy backup to container
docker cp ./backup stock-predictor-mongodb:/tmp/backup

# Restore backup
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/stock-predictor?authSource=admin" /tmp/backup/stock-predictor
```

## Support

For issues with the Docker setup:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test connectivity: `node test-local.js`
4. Restart services: `docker-compose restart`

## Next Steps

After successful setup:

1. **Explore the API** at http://localhost:5001/api-docs
2. **View the frontend** at http://localhost:3000
3. **Run the test suite** with `docker-compose exec backend npm test`
4. **Start developing** your stock prediction features!