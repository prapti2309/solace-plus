import logging
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory dictionary fallback when Redis is not available locally
_in_memory_redis_store: dict[str, tuple[str, Optional[float]]] = {}

class RedisClient:
    """
    Async Redis client with graceful in-memory fallback for local development without Docker/Redis.
    """
    def __init__(self, url: str):
        self.url = url
        self._redis: Optional[aioredis.Redis] = None
        self._use_fallback = False

    async def get_client(self):
        if self._use_fallback:
            return None
        if self._redis is None:
            try:
                self._redis = aioredis.from_url(self.url, decode_responses=True, socket_timeout=1.0)
                await self._redis.ping()
            except Exception as e:
                logger.warning(f"Redis connection failed ({e}). Falling back to in-memory session cache.")
                self._use_fallback = True
                self._redis = None
        return self._redis

    async def get(self, key: str) -> Optional[str]:
        client = await self.get_client()
        if client:
            try:
                return await client.get(key)
            except Exception:
                pass
        
        # Fallback store check
        if key in _in_memory_redis_store:
            val, expire_at = _in_memory_redis_store[key]
            import time
            if expire_at is not None and time.time() > expire_at:
                del _in_memory_redis_store[key]
                return None
            return val
        return None

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        client = await self.get_client()
        if client:
            try:
                return await client.set(key, value, ex=ex)
            except Exception:
                pass

        # Fallback store set
        import time
        expire_at = time.time() + ex if ex else None
        _in_memory_redis_store[key] = (value, expire_at)
        return True

    async def delete(self, key: str) -> bool:
        client = await self.get_client()
        if client:
            try:
                return await client.delete(key) > 0
            except Exception:
                pass

        if key in _in_memory_redis_store:
            del _in_memory_redis_store[key]
            return True
        return False

redis_client = RedisClient(settings.REDIS_URL)
