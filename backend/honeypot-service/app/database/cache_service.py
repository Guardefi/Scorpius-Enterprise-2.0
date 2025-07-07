"""
Cache Service for Honeypot Detection Service
"""
import json
import logging
import os
from typing import Any, Dict, Optional

import redis.asyncio as redis
from redis.exceptions import ConnectionError, RedisError

logger = logging.getLogger(__name__)


class CacheService:
    """Redis-based cache service for honeypot detection"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self._fallback_cache: Dict[str, Any] = {}  # In-memory fallback
        
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            logger.info("Initializing Redis cache service...")
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Redis cache service initialized successfully")
            
        except (ConnectionError, RedisError) as e:
            logger.warning(f"Redis connection failed: {e}")
            logger.warning("Using in-memory fallback cache")
            self.redis_client = None
            
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self.redis_client:
                value = await self.redis_client.get(key)
                if value:
                    return json.loads(value)
            else:
                return self._fallback_cache.get(key)
        except Exception as e:
            logger.warning(f"Cache get failed for key {key}: {e}")
            return self._fallback_cache.get(key)
        return None
        
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        try:
            if self.redis_client:
                await self.redis_client.setex(key, ttl, json.dumps(value))
                return True
            else:
                self._fallback_cache[key] = value
                return True
        except Exception as e:
            logger.warning(f"Cache set failed for key {key}: {e}")
            self._fallback_cache[key] = value
            return False
            
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            if self.redis_client:
                await self.redis_client.delete(key)
            else:
                self._fallback_cache.pop(key, None)
            return True
        except Exception as e:
            logger.warning(f"Cache delete failed for key {key}: {e}")
            self._fallback_cache.pop(key, None)
            return False
            
    async def clear(self) -> bool:
        """Clear all cache"""
        try:
            if self.redis_client:
                await self.redis_client.flushdb()
            else:
                self._fallback_cache.clear()
            logger.info("Cache cleared successfully")
            return True
        except Exception as e:
            logger.warning(f"Cache clear failed: {e}")
            self._fallback_cache.clear()
            return False
            
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            if self.redis_client:
                return await self.redis_client.exists(key) > 0
            else:
                return key in self._fallback_cache
        except Exception as e:
            logger.warning(f"Cache exists check failed for key {key}: {e}")
            return key in self._fallback_cache
            
    async def get_cached_analysis(self, address: str, chain_id: int) -> Optional[Dict[str, Any]]:
        """Get cached analysis result"""
        cache_key = f"analysis:{address}:{chain_id}"
        return await self.get(cache_key)
        
    async def cache_analysis(self, address: str, chain_id: int, result: Dict[str, Any], ttl: int = 3600) -> bool:
        """Cache analysis result"""
        cache_key = f"analysis:{address}:{chain_id}"
        return await self.set(cache_key, result, ttl)
        
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis cache service closed")


# Global cache service instance
cache_service = CacheService() 