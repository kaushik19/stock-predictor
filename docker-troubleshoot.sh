#!/bin/bash

# Docker troubleshooting script for Stock Predictor

echo "🔍 Stock Predictor Docker Troubleshooting"
echo "========================================"

# Check Docker and Docker Compose versions
echo "📋 Docker Information:"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
echo ""

# Check container logs
echo "📝 Container Logs (last 50 lines):"
echo ""
echo "--- Frontend Logs ---"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=50 frontend
echo ""
echo "--- Backend Logs ---"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=50 backend
echo ""
echo "--- MongoDB Logs ---"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=20 mongodb
echo ""
echo "--- Redis Logs ---"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=20 redis
echo ""

# Check port availability
echo "🌐 Port Availability Check:"
echo "Checking if ports are accessible..."

# Check frontend port
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend (port 3000): Accessible"
else
    echo "❌ Frontend (port 3000): Not accessible"
fi

# Check backend port
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend (port 5001): Accessible"
else
    echo "❌ Backend (port 5001): Not accessible"
fi

# Check MongoDB port
if nc -z localhost 27017; then
    echo "✅ MongoDB (port 27017): Accessible"
else
    echo "❌ MongoDB (port 27017): Not accessible"
fi

# Check Redis port
if nc -z localhost 6379; then
    echo "✅ Redis (port 6379): Accessible"
else
    echo "❌ Redis (port 6379): Not accessible"
fi

echo ""
echo "🔧 Troubleshooting Tips:"
echo "1. If containers are not running, try: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build"
echo "2. If ports are not accessible, check if other services are using the same ports"
echo "3. If frontend is not loading, check the browser console for errors"
echo "4. If backend API is not working, check the backend logs for errors"
echo "5. Try restarting Docker Desktop if you're on Windows/Mac"
echo ""