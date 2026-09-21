/**
 * DarshanEase — Distributed Booking Lock Service
 * Prevents race conditions and double-booking on high-demand temple darshan slots.
 * Enforces atomic lock acquisition (NX EX), 30s expiration to prevent deadlocks,
 * and safe release using an atomic Lua script matching a unique UUID token.
 */

const crypto = require('crypto');
const redisService = require('./redisService');
const redisKeys = require('../utils/redisKeys');

const LUA_RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

class BookingLockService {
  constructor() {
    this.activeLocks = new Set();
  }

  /**
   * Acquire a distributed lock for a darshan slot with automatic retries and backoff.
   * @param {string} slotId - ID of the darshan slot to lock
   * @param {number} ttlSeconds - Expiration time in seconds (default: 30)
   * @param {number} maxRetries - Maximum retry attempts if locked by another user (default: 5)
   * @param {number} retryDelayMs - Delay between retries in milliseconds (default: 150)
   * @returns {Promise<{ acquired: boolean, token?: string, lockKey?: string, error?: string }>}
   */
  async acquireLock(slotId, ttlSeconds = 30, maxRetries = 5, retryDelayMs = 150) {
    const lockKey = redisKeys.bookingLock(slotId);
    const token = crypto.randomUUID(); // Unique token per request to prevent accidental release by other workers

    const client = redisService.getClient();
    if (!client) {
      // Graceful fallback: Redis is offline or disabled.
      // MongoDB's atomic findOneAndUpdate ($expr: bookedCount + devotees <= maxCapacity)
      // provides database-level atomic isolation to guarantee zero overbooking.
      console.warn(`[BOOKING_LOCK_FALLBACK] Redis is unavailable for slot ${slotId}. Relying on MongoDB atomic transaction isolation.`);
      return {
        acquired: true,
        fallback: true,
        token: 'mongo-atomic-fallback',
        lockKey
      };
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Atomic command: SET lockKey token NX EX ttlSeconds
        const result = await client.set(lockKey, token, 'NX', 'EX', ttlSeconds);

        if (result === 'OK') {
          this.activeLocks.add(lockKey);
          console.log(`[BOOKING_LOCK_ACQUIRED] Slot ${slotId} locked by token ${token.substring(0, 8)}... (TTL: ${ttlSeconds}s)`);
          return {
            acquired: true,
            token,
            lockKey
          };
        }

        // Lock is currently held by another booking process; wait with jitter before retrying
        if (attempt < maxRetries) {
          const jitter = Math.floor(Math.random() * 50);
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs + jitter));
        }
      } catch (err) {
        console.error(`[BOOKING_LOCK_ERROR] Attempt ${attempt} failed for slot ${slotId}:`, err.message);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    console.warn(`[BOOKING_LOCK_CONTENTION] Failed to acquire lock for slot ${slotId} after ${maxRetries} attempts.`);
    return {
      acquired: false,
      error: 'Slot is currently being booked by another devotee. Please try again in a few seconds.'
    };
  }

  /**
   * Safely release lock using atomic Lua script.
   * Ensures the lock is only released if the current value matches the token.
   */
  async releaseLock(slotId, token) {
    if (!token) return false;

    const lockKey = redisKeys.bookingLock(slotId);
    const client = redisService.getClient();

    if (!client) {
      this.activeLocks.delete(lockKey);
      return false;
    }

    try {
      const result = await client.eval(LUA_RELEASE_LOCK_SCRIPT, 1, lockKey, token);
      this.activeLocks.delete(lockKey);

      if (result === 1) {
        console.log(`[BOOKING_LOCK_RELEASED] Lock released for slot ${slotId}`);
        return true;
      } else {
        console.warn(`[BOOKING_LOCK_EXPIRED] Lock for slot ${slotId} had already expired or was stolen.`);
        return false;
      }
    } catch (err) {
      console.error(`[BOOKING_LOCK_RELEASE_ERROR] Failed for slot ${slotId}:`, err.message);
      this.activeLocks.delete(lockKey);
      return false;
    }
  }

  /**
   * Helper: Execute an action within the protection of a distributed lock.
   */
  async withLock(slotId, actionFn, ttlSeconds = 30) {
    const lock = await this.acquireLock(slotId, ttlSeconds);
    if (!lock.acquired) {
      throw new Error(lock.error || 'Could not acquire booking lock');
    }

    try {
      return await actionFn();
    } finally {
      await this.releaseLock(slotId, lock.token);
    }
  }

  getActiveLocksCount() {
    return this.activeLocks.size;
  }
}

module.exports = new BookingLockService();
