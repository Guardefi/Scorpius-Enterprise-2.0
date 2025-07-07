FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create requirements.txt based on the imports we see in the code
COPY <<EOF requirements.txt
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
web3>=6.11.0
eth-account>=0.9.0
pydantic>=2.4.0
pyyaml>=6.0.1
aiohttp>=3.8.6
websockets>=11.0.3
numpy>=1.24.3
pandas>=2.0.3
scikit-learn>=1.3.0
redis>=5.0.0
python-multipart>=0.0.6
structlog>=23.1.0
prometheus-client>=0.17.1
requests>=2.31.0
httpx>=0.24.1
matplotlib>=3.7.2
seaborn>=0.12.2
eth-typing>=3.5.0
eth-utils>=2.3.0
hexbytes>=0.3.1
toolz>=0.12.0
lru-dict>=1.2.0
coincurve>=17.0.0
EOF

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy MEV bot source code
COPY . .

# Create default config file
COPY <<EOF mev_config.yaml
# MEV Bot Configuration
rpc_url: "http://localhost:8545"
private_key: ""
profit_threshold: 0.015
gas_limit: 500000
max_gas_price_gwei: 200
log_level: "INFO"
simulation_cache_size: 1000
min_profit_threshold: 0.1
min_prediction_threshold: 0.7
enable_multi_chain: true
target_gas_price: 50000000000
model_dir: "models"
rl_enabled: true
rl_update_frequency: 100
EOF

# Create necessary directories
RUN mkdir -p models data circuits keys logs

# Set permissions
RUN chmod +x *.py

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/status || exit 1

# Expose port
EXPOSE 8000

# Set environment variables
ENV MEV_PORT=8000

# Start the MEV bot API server
CMD ["python", "mev_api_server.py"] 