# Docker Setup for Indian Stock Predictor

This guide will help you set up and run the Indian Stock Predictor application using Docker.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB of available RAM
- Ports 3000, 5001, 27017, and 6379 should be available

## Quick Start

### Option 1: Using the Development Script (Recommended)

**Windows:**
```bash
docker-dev.bat
```

**Linux/Mac:**
```bash
chmod +x docker-dev.sh
./docker-dev.sh
```

### Option 2: Manual Docker Compose

```bash
# Start all services in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Services

The application consists of 4 main services:

### 1. Frontend (Vue.js)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Technology:** Vue 3 + Vite + TypeScript
- **Features:** Stock analysis dashboard, authentication, real-time updates

### 2. Backend (Node.js)
- **Port:** 5001
- **URL:** http://localhost:5001
- **Technology:** Express.js + MongoDB + Redis
- **Features:** REST API, authentication, stock data processing

### 3. MongoDB Database
- **Port:** 27017
- **Username:** admin
- **Password:** password123
- **Database:** stock-predictor

### 4. Redis Cache
- **Port:** 6379
- **Password:** redis123
- **Purpose:** Caching, session storage, real-time data

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://admin:password123@mongodb:27017/stock-predictor?authSource=admin
REDIS_URL=redis://:redis123@redis:6379
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## Development Workflow

### Starting the Application
1. Run the development script or use docker-compose
2. Wait for all services to start (usually 30-60 seconds)
3. Access the frontend at http://localhost:3000
4. API documentation available at http://localhost:5001/api-docs

### Making Changes
- **Frontend:** Changes are automatically reloaded via Vite HMR
- **Backend:** Changes trigger automatic restart via nodemon
- **Database:** Data persists in Docker volumes

### Viewing Logs
```bash
# All services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
```

### Restarting Services
```bash
# Restart all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart

# Restart specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart frontend
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
# or on Windows
netstat -ano | findstr :3000

# Kill the process or change the port in docker-compose.yml
```

#### 2. Frontend Not Loading
- Check if the container is running: `docker ps`
- Check frontend logs: `docker-compose logs frontend`
- Verify port 3000 is accessible: `curl http://localhost:3000`
- Clear browser cache and try again

#### 3. Backend API Not Working
- Check backend logs: `docker-compose logs backend`
- Verify MongoDB connection: `docker-compose logs mongodb`
- Test API endpoint: `curl http://localhost:5001/health`

#### 4. Database Connection Issues
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify MongoDB is running: `docker ps | grep mongodb`
- Check connection string in backend logs

#### 5. Hot Reload Not Working
- Ensure volumes are properly mounted
- On Windows, enable file sharing in Docker Desktop
- Try restarting the frontend container

### Troubleshooting Script
Run the troubleshooting script to diagnose issues:

**Linux/Mac:**
```bash
chmod +x docker-troubleshoot.sh
./docker-troubleshoot.sh
```

### Manual Debugging

#### Access Container Shell
```bash
# Frontend container
docker exec -it stock-predictor-frontend sh

# Backend container
docker exec -it stock-predictor-backend sh

# MongoDB container
docker exec -it stock-predictor-mongodb mongosh
```

#### Check Container Resources
```bash
# View container stats
docker stats

# View container details
docker inspect stock-predictor-frontend
```

## Data Persistence

### Volumes
- **mongodb_data:** MongoDB database files
- **redis_data:** Redis persistence files

### Backup Data
```bash
# Backup MongoDB
docker exec stock-predictor-mongodb mongodump --out /backup

# Backup Redis
docker exec stock-predictor-redis redis-cli BGSAVE
```

### Reset Data
```bash
# Stop services and remove volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Restart with fresh data
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Performance Optimization

### For Development
- Allocate at least 4GB RAM to Docker
- Enable file sharing for hot reload
- Use SSD storage for better performance

### For Production
- Use multi-stage builds
- Optimize image sizes
- Configure proper resource limits
- Use production environment variables

## Security Notes

### Development Environment
- Default passwords are used (change for production)
- Debug mode is enabled
- CORS is permissive
- All ports are exposed

### Production Considerations
- Change all default passwords
- Use environment-specific secrets
- Configure proper CORS settings
- Use reverse proxy (nginx)
- Enable SSL/TLS
- Implement proper logging and monitoring

## Useful Commands

```bash
# View all containers
docker ps -a

# View images
docker images

# Clean up unused resources
docker system prune -a

# View Docker Compose configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml config

# Scale services (if needed)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --scale backend=2

# Update images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml pull
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Support

If you encounter issues:

1. Run the troubleshooting script
2. Check the logs for error messages
3. Verify all prerequisites are met
4. Try restarting Docker Desktop
5. Check the GitHub issues for similar problems

For additional help, please create an issue with:
- Your operating system
- Docker version
- Error logs
- Steps to reproduce the issue