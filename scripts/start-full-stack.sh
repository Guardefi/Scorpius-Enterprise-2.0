#!/bin/bash

echo "🚀 Starting Scorpius Full Stack Integration..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Copying .env.example to .env"
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration"
fi

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

echo "⏳ Waiting for services to initialize..."
sleep 30

echo "🔍 Checking service health..."
curl -f http://localhost:8000/health || echo "❌ API Gateway not ready"
curl -f http://localhost:9090 || echo "❌ Prometheus not ready"
curl -f http://localhost:3000 || echo "❌ Grafana not ready"

echo "✅ Scorpius Full Stack Started!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:     http://localhost:5173"
echo "   API Gateway:  http://localhost:8000"
echo "   Prometheus:   http://localhost:9090"
echo "   Grafana:      http://localhost:3000 (admin/admin)"
echo ""
echo "📊 Service Ports:"
echo "   Bridge:       http://localhost:8001"
echo "   Quantum:      http://localhost:8002"
echo "   Reporting:    http://localhost:8003"
echo "   Time Machine: http://localhost:8004"
echo "   Core:         http://localhost:8005"
echo ""
echo "🔧 To stop all services: docker-compose down"
echo "📝 To view logs: docker-compose logs -f [service-name]"
