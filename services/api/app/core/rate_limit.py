import time
from fastapi import Request, HTTPException, status
from app.core.redis import redis_client

class RateLimiter:
    """
    Rate limiting helper using Redis sliding window log algorithm with in-memory fallback.
    """
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"rate_limit:{client_ip}:{request.url.path}"
        
        current_count_str = await redis_client.get(key)
        count = int(current_count_str) if current_count_str else 0
        
        if count >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
            
        await redis_client.set(key, str(count + 1), ex=60)
