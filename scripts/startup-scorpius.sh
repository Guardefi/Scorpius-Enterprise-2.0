#!/bin/bash
# =============================================================================
# Scorpius Platform Startup Script
# =============================================================================
# This script starts up the entire Scorpius cybersecurity platform
# including all backend services, frontend, and admin tools.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

print_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
 ____                      _             
/ ___|  ___ ___  _ __ _ __ (_)_   _ ___   
\___ \ / __/ _ \| '__| '_ \| | | | / __|  
 ___) | (_| (_) | |  | |_) | | |_| \__ \  
|____/ \___\___/|_|  | .__/|_|\__,_|___/  
                     |_|                  
  Enterprise Cybersecurity Platform
EOF
    echo -e "${NC}"
    echo "🚀 Starting Scorpius Platform..."
    echo "=" * 50
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists python3; then
        missing_deps+=("python3")
    fi
    
    if ! command_exists pip; then
        missing_deps+=("pip")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Stop any existing services
cleanup_existing() {
    print_status "Cleaning up existing services..."
    
    # Stop any existing Docker containers
    docker-compose -f docker/docker-compose.dev.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.yml down 2>/dev/null || true
    
    # Kill any processes on our ports
    for port in 8000 8080 3000 5432 6379 5050 8081; do
        if check_port $port; then
            print_warning "Port $port is in use, attempting to free it..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    print_success "Cleanup completed"
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    
    # Install essential packages for the demo
    pip install flask flask-cors pyjwt requests redis psycopg2-binary
    
    print_success "Python dependencies installed"
}

# Install and build frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Check if .env file exists, if not copy from example
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        fi
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start core infrastructure with health checks
    docker-compose -f docker/docker-compose.dev.yml --profile dev up -d --remove-orphans
    
    print_status "Waiting for infrastructure to be ready..."
    
    # Wait for Redis to be healthy
    local timeout=60
    local count=0
    while ! docker exec scorpius-redis-dev redis-cli ping >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            print_error "Redis failed to start within $timeout seconds"
            exit 1
        fi
        sleep 1
        count=$((count + 1))
    done
    
    # Wait for PostgreSQL to be ready
    count=0
    while ! docker exec scorpius-postgres-dev pg_isready -U postgres >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            print_error "PostgreSQL failed to start within $timeout seconds"
            exit 1
        fi
        sleep 1
        count=$((count + 1))
    done
    
    print_success "Infrastructure services are ready"
}

# Start API server
start_api_server() {
    print_status "Starting API server..."
    
    # Stop any existing gateway container that might conflict
    docker stop scorpius-gateway-dev 2>/dev/null || true
    
    # Start the demo API server in background
    python3 demo-api-server.py &
    API_PID=$!
    
    # Wait for API server to be ready
    local timeout=30
    local count=0
    while ! curl -s http://localhost:8000/health >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            print_error "API server failed to start within $timeout seconds"
            kill $API_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
        count=$((count + 1))
    done
    
    print_success "API server is ready on http://localhost:8000"
}

# Start frontend
start_frontend() {
    print_status "Starting frontend development server..."
    
    cd frontend
    
    # Start the frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait for frontend to be ready
    local timeout=60
    local count=0
    while ! curl -s http://localhost:8080 >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            print_error "Frontend failed to start within $timeout seconds"
            kill $FRONTEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
        count=$((count + 2))
    done
    
    print_success "Frontend is ready on http://localhost:8080"
}

# Run system tests
run_tests() {
    print_status "Running system integration tests..."
    
    # Give services a moment to fully initialize
    sleep 5
    
    if python3 test_system.py; then
        print_success "All system tests passed!"
    else
        print_warning "Some tests failed, but services might still be functional"
    fi
}

# Display final status
show_final_status() {
    echo ""
    echo -e "${GREEN}🎉 Scorpius Platform Started Successfully!${NC}"
    echo "=" * 50
    echo ""
    echo "📱 Access Points:"
    echo "   • Frontend Dashboard: http://localhost:8080"
    echo "   • API Server: http://localhost:8000"
    echo "   • Database Admin (PgAdmin): http://localhost:5050"
    echo "   • Redis Admin: http://localhost:8081"
    echo ""
    echo "🔐 Demo Login Credentials:"
    echo "   • Email: admin@scorpius.io"
    echo "   • Password: password123"
    echo ""
    echo "🛠️  Docker Services Running:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep scorpius
    echo ""
    echo "💡 Tips:"
    echo "   • Use 'docker-compose -f docker/docker-compose.dev.yml logs' to view logs"
    echo "   • Use './stop-scorpius.sh' to stop all services"
    echo "   • Use 'docker-compose -f docker/docker-compose.dev.yml down' to stop Docker services"
    echo ""
    echo "Press Ctrl+C to stop the API server and frontend, or run in background"
}

# Create stop script
create_stop_script() {
    cat > stop-scorpius.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Scorpius Platform..."

# Stop Docker services
docker-compose -f docker/docker-compose.dev.yml down

# Kill API server and frontend processes
pkill -f "demo-api-server.py"
pkill -f "npm run dev"
pkill -f "vite"

echo "✅ Scorpius Platform stopped"
EOF
    chmod +x stop-scorpius.sh
}

# Main execution
main() {
    print_banner
    
    check_prerequisites
    cleanup_existing
    install_python_deps
    setup_frontend
    start_infrastructure
    start_api_server
    start_frontend
    run_tests
    create_stop_script
    show_final_status
    
    # Keep the script running to maintain the API server and frontend
    echo "🔄 Services running... Press Ctrl+C to stop"
    trap "echo 'Stopping services...'; kill $API_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
    wait
}

# Run main function
main "$@"
