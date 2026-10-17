import time
from collections import defaultdict
from fastapi import HTTPException, status

class SlidingWindowRateLimiter:
    """In-memory sliding window rate limiter per API key / Tenant."""
    def __init__(self):
        self.requests = defaultdict(list)

    def check(self, key_id: str, limit: int = 120, window_seconds: int = 60) -> bool:
        now = time.time()
        window_start = now - window_seconds
        
        # Filter out expired timestamps
        self.requests[key_id] = [t for t in self.requests[key_id] if t > window_start]
        
        if len(self.requests[key_id]) >= limit:
            return False
            
        self.requests[key_id].append(now)
        return True

rate_limiter = SlidingWindowRateLimiter()

def enforce_rate_limit(key_id: str, limit: int = 120):
    if not rate_limiter.check(key_id, limit):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded ({limit} requests per minute). Please throttle your client."
        )
