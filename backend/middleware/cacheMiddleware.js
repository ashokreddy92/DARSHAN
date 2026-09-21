/**
 * DarshanEase — Route Caching Middleware
 * Automatically intercepts GET requests, checks Redis for cached payloads,
 * and seamlessly caches downstream controller responses.
 */

const redisService = require('../services/redisService');

const cacheMiddleware = (ttlSeconds = 600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !redisService.isAvailable()) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // Allow clients to bypass cache if explicitly requested
    if (req.headers['x-no-cache']) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `darshanease:cache:${req.baseUrl || ''}${req.path}:${JSON.stringify(req.query)}`;

    try {
      const cached = await redisService.get(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        return res.send(cached);
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept original res.json to capture response payload
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Only cache successful 200 responses
        if (res.statusCode === 200 && body && body.success !== false) {
          redisService.set(cacheKey, JSON.stringify(body), ttlSeconds).catch((err) => {
            console.warn(`[CACHE_MIDDLEWARE_WARN] Failed to write cache for ${cacheKey}:`, err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.warn(`[CACHE_MIDDLEWARE_ERROR] Error for ${cacheKey}:`, err.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
