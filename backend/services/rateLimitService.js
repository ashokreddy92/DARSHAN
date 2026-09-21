/**
 * DarshanEase — Redis Rate Limiting Service
 * Provides atomic, race-condition-free rate limiting per endpoint, IP, email, or user.
 */

const redisService = require('./redisService');
const redisKeys = require('../utils/redisKeys');

class RateLimitService {
  constructor() {
    this.blockedCount = 0;
  }

  /**
   * Check and increment rate limit counter atomically.
   * @param {string} endpoint - Endpoint or action name (e.g., 'send-otp', 'bookings')
   * @param {string} identifier - Unique client identifier (IP, email, or userId)
   * @param {number} maxRequests - Maximum requests permitted in window
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<{ allowed: boolean, remaining: number, retryAfter: number, total: number }>}
   */
  async checkRateLimit(endpoint, identifier, maxRequests, windowSeconds) {
    if (!redisService.isAvailable()) {
      // Graceful degradation: allow request when Redis is down
      return { allowed: true, remaining: maxRequests, retryAfter: 0, total: 1 };
    }

    const key = redisKeys.rateLimit(endpoint, identifier);

    try {
      const client = redisService.getClient();
      if (!client) return { allowed: true, remaining: maxRequests, retryAfter: 0, total: 1 };

      // Atomic MULTI/EXEC transaction to increment and ensure expiration
      const results = await client
        .multi()
        .incr(key)
        .ttl(key)
        .exec();

      const [[err1, count], [err2, ttl]] = results;

      if (err1) throw err1;

      // If the key is newly created (ttl was -1), set its window expiration
      if (ttl === -1 || count === 1) {
        await client.expire(key, windowSeconds);
      }

      const effectiveTtl = ttl > 0 ? ttl : windowSeconds;

      if (count > maxRequests) {
        this.blockedCount++;
        console.warn(`[RATE_LIMIT_TRIGGERED] ${endpoint} exceeded by ${identifier} (${count}/${maxRequests}). Retry in ${effectiveTtl}s.`);
        return {
          allowed: false,
          remaining: 0,
          retryAfter: effectiveTtl,
          total: count
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - count),
        retryAfter: 0,
        total: count
      };
    } catch (err) {
      console.warn(`[RATE_LIMIT_ERROR] Failed for ${key}, bypassing limit:`, err.message);
      return { allowed: true, remaining: maxRequests, retryAfter: 0, total: 1 };
    }
  }

  getBlockedCount() {
    return this.blockedCount;
  }
}

module.exports = new RateLimitService();
