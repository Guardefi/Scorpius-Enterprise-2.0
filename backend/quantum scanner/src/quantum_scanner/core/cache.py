"""
Advanced caching system for quantum scanner performance optimization.

This module provides Redis-based caching with TTL, compression, and
intelligent cache invalidation for expensive cryptographic operations.
"""

import hashlib
import pickle
import zlib
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Callable
from functools import wraps

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    redis = None
    REDIS_AVAILABLE = False

from ..core.logging import get_logger
from ..core.config import settings

logger = get_logger(__name__)


class CacheConfig:
    """Configuration for caching system."""
    
    def __init__(self):
        self.redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
        self.default_ttl = getattr(settings, 'CACHE_DEFAULT_TTL', 3600)  # 1 hour
        self.compression_threshold = getattr(settings, 'CACHE_COMPRESSION_THRESHOLD', 1024)  # 1KB
        self.max_key_length = getattr(settings, 'CACHE_MAX_KEY_LENGTH', 250)
        self.namespace = getattr(settings, 'CACHE_NAMESPACE', 'quantum_scanner')


class InMemoryCache:
    """Fallback in-memory cache when Redis is not available."""
    
    def __init__(self, max_size: int = 1000):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._access_times: Dict[str, datetime] = {}
        self.max_size = max_size
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if key in self._cache:
            entry = self._cache[key]
            if datetime.utcnow() < entry['expires']:
                self._access_times[key] = datetime.utcnow()
                return entry['value']
            else:
                await self.delete(key)
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache."""
        if len(self._cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self._access_times.keys(), key=self._access_times.get)
            await self.delete(oldest_key)
        
        expires = datetime.utcnow() + timedelta(seconds=ttl)
        self._cache[key] = {'value': value, 'expires': expires}
        self._access_times[key] = datetime.utcnow()
        return True
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        self._cache.pop(key, None)
        self._access_times.pop(key, None)
        return True
    
    async def clear(self) -> bool:
        """Clear all cache entries."""
        self._cache.clear()
        self._access_times.clear()
        return True


class QuantumCache:
    """High-performance cache system for quantum scanner operations."""
    
    def __init__(self, config: Optional[CacheConfig] = None):
        """Initialize cache system."""
        self.config = config or CacheConfig()
        self._redis_client: Optional[Any] = None  # Redis client when available
        self._fallback_cache = InMemoryCache()
        self._connection_healthy = False
        
    async def initialize(self):
        """Initialize cache connections."""
        if REDIS_AVAILABLE:
            try:
                self._redis_client = redis.from_url(
                    self.config.redis_url,
                    decode_responses=False,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                await self._redis_client.ping()
                self._connection_healthy = True
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, using in-memory cache: {e}")
                self._connection_healthy = False
        else:
            logger.info("Redis not available, using in-memory cache")
    
    def _generate_key(self, key: str) -> str:
        """Generate namespaced cache key with hash if too long."""
        namespaced_key = f"{self.config.namespace}:{key}"
        if len(namespaced_key) > self.config.max_key_length:
            key_hash = hashlib.sha256(namespaced_key.encode()).hexdigest()[:16]
            return f"{self.config.namespace}:hash:{key_hash}"
        return namespaced_key
    
    def _serialize_value(self, value: Any) -> bytes:
        """Serialize and optionally compress value."""
        serialized = pickle.dumps(value)
        if len(serialized) > self.config.compression_threshold:
            compressed = zlib.compress(serialized)
            return b'compressed:' + compressed
        return b'raw:' + serialized
    
    def _deserialize_value(self, data: bytes) -> Any:
        """Deserialize and decompress value."""
        if data.startswith(b'compressed:'):
            compressed_data = data[11:]  # Remove 'compressed:' prefix
            decompressed = zlib.decompress(compressed_data)
            return pickle.loads(decompressed)
        elif data.startswith(b'raw:'):
            raw_data = data[4:]  # Remove 'raw:' prefix
            return pickle.loads(raw_data)
        else:
            # Legacy format support
            return pickle.loads(data)
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        cache_key = self._generate_key(key)
        
        try:
            if self._connection_healthy and self._redis_client:
                data = await self._redis_client.get(cache_key)
                if data:
                    return self._deserialize_value(data)
            else:
                return await self._fallback_cache.get(cache_key)
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
            return await self._fallback_cache.get(cache_key)
        
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL."""
        cache_key = self._generate_key(key)
        ttl = ttl or self.config.default_ttl
        
        try:
            serialized_value = self._serialize_value(value)
            
            if self._connection_healthy and self._redis_client:
                await self._redis_client.setex(cache_key, ttl, serialized_value)
                return True
            else:
                return await self._fallback_cache.set(cache_key, value, ttl)
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return await self._fallback_cache.set(cache_key, value, ttl)
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        cache_key = self._generate_key(key)
        
        try:
            if self._connection_healthy and self._redis_client:
                await self._redis_client.delete(cache_key)
            await self._fallback_cache.delete(cache_key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern."""
        pattern_key = self._generate_key(pattern)
        cleared = 0
        
        try:
            if self._connection_healthy and self._redis_client:
                keys = await self._redis_client.keys(pattern_key)
                if keys:
                    cleared = await self._redis_client.delete(*keys)
            return cleared
        except Exception as e:
            logger.warning(f"Cache clear pattern error for {pattern}: {e}")
            return 0
    
    async def health_check(self) -> Dict[str, Any]:
        """Check cache system health."""
        health_info = {
            "redis_available": REDIS_AVAILABLE,
            "redis_connected": False,
            "fallback_cache_size": len(self._fallback_cache._cache),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self._redis_client:
            try:
                await self._redis_client.ping()
                health_info["redis_connected"] = True
                info = await self._redis_client.info()
                health_info["redis_memory_used"] = info.get("used_memory_human", "unknown")
                health_info["redis_connected_clients"] = info.get("connected_clients", 0)
            except Exception as e:
                health_info["redis_error"] = str(e)
        
        return health_info


# Global cache instance
_cache_instance: Optional[QuantumCache] = None


async def get_cache() -> QuantumCache:
    """Get global cache instance."""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = QuantumCache()
        await _cache_instance.initialize()
    return _cache_instance


def cached(ttl: Optional[int] = None, key_prefix: str = ""):
    """
    Decorator for caching function results.
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix, func.__name__]
            
            # Add args to key
            for arg in args:
                if hasattr(arg, '__dict__'):
                    # For objects, use their string representation
                    key_parts.append(str(hash(str(arg))))
                else:
                    key_parts.append(str(arg))
            
            # Add kwargs to key
            for k, v in sorted(kwargs.items()):
                key_parts.append(f"{k}={v}")
            
            cache_key = ":".join(str(part) for part in key_parts if part)
            
            # Try to get from cache
            cache = await get_cache()
            cached_result = await cache.get(cache_key)
            
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Call function and cache result
            logger.debug(f"Cache miss for {func.__name__}")
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


class CacheMetrics:
    """Cache performance metrics tracking."""
    
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.errors = 0
        self.total_operations = 0
        self.start_time = datetime.utcnow()
    
    @property
    def hit_rate(self) -> float:
        """Calculate cache hit rate."""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0
    
    @property
    def error_rate(self) -> float:
        """Calculate cache error rate."""
        return self.errors / self.total_operations if self.total_operations > 0 else 0.0
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get metrics summary."""
        uptime = datetime.utcnow() - self.start_time
        return {
            "hits": self.hits,
            "misses": self.misses,
            "errors": self.errors,
            "total_operations": self.total_operations,
            "hit_rate": self.hit_rate,
            "error_rate": self.error_rate,
            "uptime_seconds": uptime.total_seconds()
        }


# Global metrics instance
cache_metrics = CacheMetrics()
