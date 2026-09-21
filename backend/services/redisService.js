/**
 * DarshanEase — Core Redis Service
 * Encapsulates low-level Redis operations with fail-safe error handling,
 * non-blocking SCAN for pattern invalidations, and structured JSON serialization.
 */

const { getRedisClient, isRedisConnected } = require('../config/redis');

class RedisService {
  getClient() {
    return getRedisClient();
  }

  isAvailable() {
    return isRedisConnected();
  }

  async get(key) {
    try {
      const client = this.getClient();
      if (!client) return null;
      return await client.get(key);
    } catch (err) {
      console.warn(`[REDIS_GET_ERROR] Failed for key ${key}:`, err.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = null) {
    try {
      const client = this.getClient();
      if (!client) return false;

      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, value, 'EX', ttlSeconds);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (err) {
      console.warn(`[REDIS_SET_ERROR] Failed for key ${key}:`, err.message);
      return false;
    }
  }

  async getJson(key) {
    try {
      const data = await this.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.warn(`[REDIS_JSON_PARSE_ERROR] Corrupted JSON at key ${key}:`, err.message);
      return null;
    }
  }

  async setJson(key, value, ttlSeconds = null) {
    try {
      const serialized = JSON.stringify(value);
      return await this.set(key, serialized, ttlSeconds);
    } catch (err) {
      console.warn(`[REDIS_JSON_SET_ERROR] Serialization failed for key ${key}:`, err.message);
      return false;
    }
  }

  async del(key) {
    try {
      const client = this.getClient();
      if (!client) return 0;
      return await client.del(key);
    } catch (err) {
      console.warn(`[REDIS_DEL_ERROR] Failed for key ${key}:`, err.message);
      return 0;
    }
  }

  async exists(key) {
    try {
      const client = this.getClient();
      if (!client) return 0;
      return await client.exists(key);
    } catch (err) {
      console.warn(`[REDIS_EXISTS_ERROR] Failed for key ${key}:`, err.message);
      return 0;
    }
  }

  async expire(key, seconds) {
    try {
      const client = this.getClient();
      if (!client) return 0;
      return await client.expire(key, seconds);
    } catch (err) {
      console.warn(`[REDIS_EXPIRE_ERROR] Failed for key ${key}:`, err.message);
      return 0;
    }
  }

  async ttl(key) {
    try {
      const client = this.getClient();
      if (!client) return -2;
      return await client.ttl(key);
    } catch (err) {
      console.warn(`[REDIS_TTL_ERROR] Failed for key ${key}:`, err.message);
      return -2;
    }
  }

  async incr(key) {
    try {
      const client = this.getClient();
      if (!client) return null;
      return await client.incr(key);
    } catch (err) {
      console.warn(`[REDIS_INCR_ERROR] Failed for key ${key}:`, err.message);
      return null;
    }
  }

  /**
   * Non-blocking wildcard key deletion using SCAN.
   * Eliminates the performance danger of KEYS * in production.
   */
  async delPattern(pattern) {
    try {
      const client = this.getClient();
      if (!client) return 0;

      let cursor = '0';
      let deletedCount = 0;

      do {
        // SCAN 100 keys per iteration
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;

        if (keys && keys.length > 0) {
          const count = await client.del(...keys);
          deletedCount += count;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (err) {
      console.warn(`[REDIS_DEL_PATTERN_ERROR] Failed for pattern ${pattern}:`, err.message);
      return 0;
    }
  }

  /**
   * Atomic Lua script execution.
   */
  async evalScript(luaScript, numberOfKeys, ...args) {
    try {
      const client = this.getClient();
      if (!client) return null;
      return await client.eval(luaScript, numberOfKeys, ...args);
    } catch (err) {
      console.warn('[REDIS_LUA_ERROR] Lua execution failed:', err.message);
      return null;
    }
  }
}

module.exports = new RedisService();
