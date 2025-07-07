#!/bin/bash
# =============================================================================
# Scorpius Platform Stop Script
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Scorpius Platform...${NC}"

# Stop Docker services
echo "Stopping Docker services..."
docker-compose -f docker/docker-compose.dev.yml down 2>/dev/null || true
docker-compose -f docker/docker-compose.yml down 2>/dev/null || true

# Kill API server and frontend processes
echo "Stopping API server and frontend..."
pkill -f "demo-api-server.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill any remaining Node processes that might be from our frontend
ps aux | grep -E "(node.*vite|npm.*dev)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✅ Scorpius Platform stopped${NC}"
echo "All services have been terminated."
