# Caching Strategies & Stampede Prevention

## Slide 1: Cache-Aside vs. Write-Through
- **Cache-Aside (Lazy Loading)**:
  1. Application checks the cache first.
  2. On a **Cache Miss**, the app reads from the database, writes the result into the cache with a **TTL (Time-To-Live)**, and returns it.
- **Write-Through**: Every write updates both the cache and the underlying database synchronously, ensuring strong cache consistency at the cost of higher write latency.

## Slide 2: Cache Stampede (Thundering Herd)
- **Problem**: When a popular cache key expires under high traffic, hundreds of concurrent requests see a Cache Miss at the same millisecond and hammer the database simultaneously.
- **Solutions**:
  - **Mutex / Singleflight Lock**: Only one request recomputes the value while others wait.
  - **Jittered TTL**: Adding a random offset (`TTL + random(0, 60s)`) so keys do not expire at the exact same instant.
