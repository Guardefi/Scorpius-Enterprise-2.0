# Quantum Scanner AI Threat Predictor - Production Docker Image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app/src
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV QUANTUM_SCANNER_ENV=production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY pyproject.toml .
COPY README.md .

# Install the package in development mode
RUN pip install -e .

# Create necessary directories
RUN mkdir -p /app/models /app/logs /app/data /app/config

# Copy configuration files (if they exist)
COPY docker/config/ ./config/

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash quantum && \
    chown -R quantum:quantum /app
USER quantum

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "quantum_scanner.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
