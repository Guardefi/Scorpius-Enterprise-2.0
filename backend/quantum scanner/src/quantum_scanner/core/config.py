"""Configuration management for the Quantum Security Platform."""

import os
from typing import List, Optional


class Settings:
    """Application settings with environment variable support."""
    
    def __init__(self):
        # Core application settings
        self.app_name = os.getenv("QUANTUM_APP_NAME", "Quantum Security Platform")
        self.version = os.getenv("QUANTUM_VERSION", "1.0.0")
        self.environment = os.getenv("QUANTUM_ENV", "development")
        self.debug = os.getenv("QUANTUM_DEBUG", "false").lower() == "true"
        self.log_level = os.getenv("QUANTUM_LOG_LEVEL", "INFO")
        
        # API settings
        self.api_host = os.getenv("QUANTUM_API_HOST", "0.0.0.0")
        self.api_port = int(os.getenv("QUANTUM_API_PORT", "8000"))
        self.api_workers = int(os.getenv("QUANTUM_API_WORKERS", "1"))
        self.cors_origins = ["*"]  # Simplified for demo
        
        # Database settings
        self.database_url = os.getenv(
            "QUANTUM_DATABASE_URL",
            "postgresql://quantum:password@localhost:5432/quantum_db"
        )
        self.redis_url = os.getenv("QUANTUM_REDIS_URL", "redis://localhost:6379/0")
        
        # Security settings
        self.secret_key = os.getenv("QUANTUM_SECRET_KEY", "change-me-in-production")
        self.jwt_algorithm = os.getenv("QUANTUM_JWT_ALGORITHM", "HS256")
        self.jwt_expire_minutes = int(os.getenv("QUANTUM_JWT_EXPIRE_MINUTES", "30"))
        
        # Post-Quantum Cryptography settings
        self.pqc_algorithms = ["Kyber768", "Dilithium3", "SPHINCS+"]
        self.fips_compliance_mode = True
        self.quantum_safe_only = False
        
        # Service-specific settings
        self.cbom_deep_scan = True
        self.cbom_output_format = "CycloneDX"
        
        self.attack_sim_gpu_enabled = False
        self.attack_sim_max_rsa_bits = 512
        
        self.threat_intel_update_interval = 3600
        self.threat_intel_sources = ["nvd", "arxiv", "oqs-discuss"]
        
        self.dashboard_auto_refresh = 30
        self.dashboard_theme = "dark"
        
        # Monitoring and observability
        self.prometheus_enabled = True
        self.prometheus_port = 9090
        self.jaeger_enabled = False
        self.jaeger_endpoint = None
        
        # Kubernetes settings
        self.k8s_namespace = "quantum-security"
        self.k8s_service_account = "quantum-scanner"
        
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() in ("development", "dev")
    
    def get_database_url(self) -> str:
        """Get the database URL with proper formatting."""
        return self.database_url


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings
