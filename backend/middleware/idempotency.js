/**
 * DarshanEase — Idempotency Middleware
 * Prevents accidental duplicate bookings and donations caused by double-submission.
 */

const idempotencyService = require('../services/idempotencyService');

const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // If client didn't supply an idempotency key, proceed normally
  if (!idempotencyKey) {
    return next();
  }

  try {
    const saved = await idempotencyService.getSavedResponse(idempotencyKey);

    if (saved) {
      console.log(`[IDEMPOTENCY_REPLAY] Returning cached result for key ${idempotencyKey}`);
      res.setHeader('X-Idempotency-Replay', 'true');
      return res.status(saved.statusCode || 200).json(saved.body);
    }

    // Intercept res.json to cache response on success
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyService.saveResponse(idempotencyKey, res.statusCode, body).catch((err) => {
          console.warn('[IDEMPOTENCY_SAVE_WARN] Could not cache response:', err.message);
        });
      }
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.warn('[IDEMPOTENCY_ERROR] Bypassing idempotency:', err.message);
    next();
  }
};

module.exports = idempotencyMiddleware;
