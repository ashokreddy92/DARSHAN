/**
 * DarshanEase — Centralized Production-Grade Redis Client Configuration
 * Built with ioredis for high throughput, automatic reconnects, structured logs, and fault tolerance.
 */

const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;
let connectionAttempts = 0;

// Structured metrics tracking
const redisMetrics = {
  connectCount: 0,
  disconnectCount: 0,
  errorCount: 0,
  lastError: null,
  lastConnectedAt: null,
};

const createRedisClient = () => {
  const isEnabled = process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === undefined;
  
  if (!isEnabled) {
    console.log('[REDIS_STATUS] Redis is disabled via REDIS_ENABLED=false. Skipping connection.');
    return null;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const options = {
      maxRetriesPerRequest: 1, // Don't hang incoming HTTP requests if Redis is down
      enableReadyCheck: true,
      autoResubscribe: true,
      autoResendUnfulfilledCommands: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        connectionAttempts++;
        const delay = Math.min(times * 150, 3000);
        if (times <= 3 || times % 10 === 0) {
          console.warn(`[REDIS_RECONNECTING] Attempt #${times}. Reconnecting in ${delay}ms...`);
        }
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on cluster failover
        }
        return false;
      }
    };

    // If rediss:// is used, enable TLS
    if (redisUrl.startsWith('rediss://')) {
      options.tls = {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      };
    }

    const client = new Redis(redisUrl, options);

    client.on('connect', () => {
      isConnected = true;
      redisMetrics.connectCount++;
      redisMetrics.lastConnectedAt = new Date().toISOString();
      console.log('[REDIS_CONNECTED] Successfully connected to Redis infrastructure.');
    });

    client.on('ready', () => {
      isConnected = true;
      connectionAttempts = 0;
      console.log('[REDIS_READY] Redis client ready to process commands.');
    });

    client.on('close', () => {
      if (isConnected) {
        isConnected = false;
        redisMetrics.disconnectCount++;
        console.warn('[REDIS_DISCONNECTED] Redis connection closed.');
      }
    });

    client.on('reconnecting', () => {
      isConnected = false;
    });

    client.on('error', (err) => {
      isConnected = false;
      redisMetrics.errorCount++;
      redisMetrics.lastError = err.message;
      // Structured logging without exposing sensitive URI or passwords
      if (connectionAttempts <= 2 || connectionAttempts % 15 === 0) {
        console.error('[REDIS_ERROR]', err.code || err.message);
      }
    });

    // Initiate connection asynchronously without blocking server startup
    client.connect().catch((err) => {
      console.warn(`[REDIS_INIT_NOTICE] Initial connection deferred (${err.message}). Application will continue with database fallback.`);
    });

    return client;
  } catch (initErr) {
    console.error('[REDIS_CONFIG_ERROR] Failed to initialize Redis client:', initErr.message);
    return null;
  }
};

/**
 * Returns the singleton Redis client instance.
 */
const getRedisClient = () => {
  if (!redisClient && (process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === undefined)) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

/**
 * Sets a custom Redis client (used for mocking during tests).
 */
const setRedisClient = (customClient) => {
  redisClient = customClient;
  isConnected = !!customClient;
};

/**
 * Check if Redis is currently connected and responsive.
 */
const isRedisConnected = () => {
  if (!redisClient) return false;
  if (isConnected) return true;
  return redisClient.status === 'ready' || redisClient.status === 'connect';
};

/**
 * Get internal connection health & metrics.
 */
const getRedisHealth = async () => {
  if (process.env.REDIS_ENABLED === 'false') {
    return { status: 'disabled', message: 'Redis is explicitly disabled in environment' };
  }

  if (!redisClient) {
    return { status: 'disconnected', message: 'Redis client not initialized' };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const latencyMs = Date.now() - start;

    return {
      status: 'healthy',
      latencyMs: `${latencyMs}ms`,
      rawLatencyMs: latencyMs,
      metrics: redisMetrics,
      clientStatus: redisClient.status
    };
  } catch (err) {
    return {
      status: 'disconnected',
      error: err.message,
      clientStatus: redisClient ? redisClient.status : 'uninitialized'
    };
  }
};

/**
 * Graceful shutdown hook.
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      console.log('[REDIS_SHUTDOWN] Gracefully terminating Redis connection...');
      await redisClient.quit();
      console.log('[REDIS_SHUTDOWN_CLEAN] Redis connection closed.');
    } catch (err) {
      console.warn('[REDIS_SHUTDOWN_FORCE] Force disconnecting Redis client:', err.message);
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
};

module.exports = {
  getRedisClient,
  setRedisClient,
  isRedisConnected,
  getRedisHealth,
  closeRedis,
  redisMetrics
};
