#!/bin/bash
# Deployment script for Quantum Scanner + Scorpius Integration

set -e

echo "🚀 Starting Quantum Scanner + Scorpius Integration Deployment..."

# Create required directories
echo "📁 Creating required directories..."
mkdir -p logs models data nginx/ssl monitoring/grafana/provisioning

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose pull

# Build services
echo "🔨 Building services..."
docker-compose build --no-cache

# Start services
echo "🎯 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Performing health checks..."

# Check Quantum Scanner
if curl -f http://localhost/quantum/health > /dev/null 2>&1; then
    echo "✅ Quantum Scanner is healthy"
else
    echo "❌ Quantum Scanner health check failed"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
fi

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U quantum -d quantum_scanner > /dev/null 2>&1; then
    echo "✅ PostgreSQL is healthy"
else
    echo "❌ PostgreSQL health check failed"
fi

# Show service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Available endpoints:"
echo "  • Quantum Scanner API: http://localhost/quantum/"
echo "  • Scorpius Orchestrator: http://localhost/scorpius/"
echo "  • AI Threat Predictor: http://localhost/quantum/ai-threat-predictor/"
echo "  • Prometheus Metrics: http://localhost:9090"
echo "  • Grafana Dashboard: http://localhost:3000 (admin/admin123)"
echo ""
echo "To view logs: docker-compose logs -f [service-name]"
echo "To stop services: docker-compose down"
