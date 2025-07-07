"""
Core configuration for SCORPIUS backend
"""
from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App info
    APP_NAME: str = "SCORPIUS API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL")
    DATABASE_ECHO: bool = Field(default=False, env="DATABASE_ECHO")
    
    # Redis
    REDIS_URL: str = Field(default="redis://redis:6379/0", env="REDIS_URL")
    
    # Security
    SECRET_KEY: str = Field(env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3004"], 
        env="ALLOWED_ORIGINS"
    )
    
    # Stripe
    STRIPE_SECRET_KEY: str = Field(env="STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: str = Field(env="STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET: str = Field(env="STRIPE_WEBHOOK_SECRET")
    
    # Email
    SMTP_SERVER: Optional[str] = Field(default=None, env="SMTP_SERVER")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USERNAME: Optional[str] = Field(default=None, env="SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Subscription tiers
    SUBSCRIPTION_TIERS = {
        "free": {
            "name": "Free",
            "price": 0,
            "features": ["Basic Security Scan", "Weekly Reports"],
            "limits": {"scans_per_day": 5, "storage_gb": 1}
        },
        "pro": {
            "name": "Pro", 
            "price": 29,
            "features": ["Advanced Security Scan", "Daily Reports", "Real-time Monitoring"],
            "limits": {"scans_per_day": 100, "storage_gb": 10}
        },
        "enterprise": {
            "name": "Enterprise",
            "price": 99,
            "features": ["Enterprise Security Suite", "Real-time Alerts", "Custom Integrations", "24/7 Support"],
            "limits": {"scans_per_day": 1000, "storage_gb": 100}
        }
    }
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
