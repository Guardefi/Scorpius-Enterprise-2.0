# 🚀 Scorpius Platform Quick Start

This directory contains startup scripts to easily launch the entire Scorpius cybersecurity platform.

## 📋 Prerequisites

Before running the startup scripts, make sure you have:

- ✅ **Docker & Docker Compose** - For infrastructure services
- ✅ **Node.js & npm** - For the frontend (v16+ recommended)
- ✅ **Python 3** - For the API server (v3.8+ recommended)
- ✅ **pip** - Python package manager

## 🚀 Quick Start

### Windows Users

Choose one of these options:

#### Option 1: PowerShell (Recommended)
```powershell
# Run in PowerShell (as Administrator if needed)
.\startup-scorpius.ps1
```

#### Option 2: Batch File
```cmd
# Double-click or run in Command Prompt
startup-scorpius.bat
```

### Linux/Mac Users

```bash
# Make executable (if needed)
chmod +x startup-scorpius.sh

# Run the script
./startup-scorpius.sh
```

## 🛑 Stopping Services

### Windows
```powershell
# PowerShell
.\stop-scorpius.ps1

# Or just close the startup script window
```

### Linux/Mac
```bash
./stop-scorpius.sh

# Or press Ctrl+C in the startup script terminal
```

## 🌐 Access Points

Once started, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend Dashboard** | http://localhost:8080 | Main Scorpius interface |
| **API Server** | http://localhost:8000 | Backend API |
| **Database Admin** | http://localhost:5050 | PostgreSQL management |
| **Redis Admin** | http://localhost:8081 | Redis management |

## 🔐 Demo Login

Use these credentials to log into the frontend:

- **Email:** `admin@scorpius.io`
- **Password:** `password123`

## 📊 What the Script Does

1. **Prerequisites Check** - Verifies all required tools are installed
2. **Cleanup** - Stops any existing services on the required ports
3. **Dependencies** - Installs Python packages and npm dependencies
4. **Infrastructure** - Starts Docker containers (Redis, PostgreSQL, admin tools)
5. **API Server** - Launches the demo Flask API server
6. **Frontend** - Starts the React/Vite development server
7. **Health Check** - Runs integration tests to verify everything works

## 🐳 Docker Services

The script starts these Docker containers:

- **Redis** - In-memory data store (port 6379)
- **PostgreSQL** - Database server (port 5432)
- **PgAdmin** - Database admin interface (port 5050)
- **Redis Commander** - Redis admin interface (port 8081)

## 🔧 Troubleshooting

### Port Conflicts
If you get port conflicts, the script will try to free them automatically. You can also manually stop services:

```bash
# Windows
netstat -ano | findstr ":8000"
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Docker Issues
```bash
# Reset Docker services
docker-compose -f docker/docker-compose.dev.yml down
docker system prune -f
```

### Missing Dependencies
The script will tell you what's missing. Install the required tools:

- **Docker**: https://docs.docker.com/get-docker/
- **Node.js**: https://nodejs.org/
- **Python**: https://python.org/

## 📝 Manual Setup

If you prefer to start services manually:

```bash
# 1. Install dependencies
pip install flask flask-cors pyjwt requests redis psycopg2-binary
cd frontend && npm install && cd ..

# 2. Start infrastructure
docker-compose -f docker/docker-compose.dev.yml --profile dev up -d

# 3. Start API server
python demo-api-server.py &

# 4. Start frontend
cd frontend && npm run dev
```

## 💡 Tips

- **Background Running**: The PowerShell and bash scripts can run services in the background
- **Development**: Frontend has hot-reload enabled for development
- **Logs**: Use `docker-compose -f docker/docker-compose.dev.yml logs` to view container logs
- **Persistence**: Database data persists between restarts via Docker volumes

## 🆘 Support

If you encounter issues:

1. Check that all prerequisites are installed
2. Ensure ports 8000, 8080, 5432, 6379, 5050, 8081 are available
3. Run the integration tests: `python test_system.py`
4. Check Docker container status: `docker ps`

---

**Happy Hacking with Scorpius! 🦂🛡️**
