/**
 * DarshanEase — Cache-Aside Service
 * Implements high-throughput caching with MongoDB fallback, structured metrics,
 * and automated non-blocking key invalidation.
 */

const redisService = require('./redisService');

class CacheService {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
    };
  }

  /**
   * Cache-Aside implementation:
   * 1. Check Redis for key
   * 2. If HIT -> Return cached data immediately
   * 3. If MISS -> Execute fallback function (MongoDB query)
   * 4. Store query result in Redis with TTL
   * 5. Return fresh data
   */
  async getOrSet(key, fetchFunction, ttlSeconds = 600) {
    // If Redis is not available, execute database query directly
    if (!redisService.isAvailable()) {
      return await fetchFunction();
    }

    try {
      const cached = await redisService.getJson(key);
      if (cached !== null && cached !== undefined) {
        this.metrics.hits++;
        return cached;
      }

      this.metrics.misses++;
      const freshData = await fetchFunction();

      if (freshData !== null && freshData !== undefined) {
        // Store in Redis asynchronously
        await redisService.setJson(key, freshData, ttlSeconds);
      }

      return freshData;
    } catch (err) {
      console.warn(`[CACHE_FALLBACK] Error accessing cache for ${key}, falling back to DB:`, err.message);
      return await fetchFunction();
    }
  }

  /**
   * Invalidate a single cache key.
   */
  async invalidate(key) {
    const deleted = await redisService.del(key);
    console.log(`[CACHE_INVALIDATE] Key ${key} invalidated (${deleted} removed)`);
    return deleted;
  }

  /**
   * Invalidate all keys matching a wildcard pattern (e.g. `darshanease:temples:list:*`).
   */
  async invalidatePattern(pattern) {
    const count = await redisService.delPattern(pattern);
    console.log(`[CACHE_INVALIDATE_PATTERN] Pattern ${pattern} cleared (${count} keys removed)`);
    return count;
  }

  /**
   * Metrics for admin dashboard & monitoring.
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? ((this.metrics.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      totalRequests: total,
      hitRate
    };
  }
}

module.exports = new CacheService();
