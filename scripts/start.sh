#!/bin/bash

echo "Starting Scorpius Full Stack..."

# Build and start all services
docker-compose up --build -d

echo "Services starting..."
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin)"
echo "API Gateway: http://localhost:8000"
echo "Dashboard API: http://localhost:8001"

# Wait for services to be ready
sleep 10

echo "All services are running!"
echo "You can now start your Tailwind/Vite frontend and Electron app"
