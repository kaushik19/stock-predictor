#!/bin/bash

# Docker development script for Stock Predictor

echo "🚀 Starting Stock Predictor in Development Mode with Docker..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Show container status
echo "📊 Container Status:"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Show logs
echo "📝 Recent logs:"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail=20

echo ""
echo "✅ Stock Predictor is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🗄️  MongoDB: localhost:27017"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
echo "  Restart: docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart"
echo ""