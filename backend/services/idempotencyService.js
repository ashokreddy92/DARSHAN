/**
 * DarshanEase — Idempotency Service
 * Prevents duplicate transactions on bookings, payments, and donations
 * when network retries or double-clicks occur.
 */

const redisService = require('./redisService');
const redisKeys = require('../utils/redisKeys');

const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours

class IdempotencyService {
  /**
   * Check if an idempotency key has already been executed.
   */
  async getSavedResponse(idempotencyKey) {
    if (!idempotencyKey || !redisService.isAvailable()) return null;
    const key = redisKeys.idempotency(idempotencyKey);
    return await redisService.getJson(key);
  }

  /**
   * Save the response for an idempotency key.
   */
  async saveResponse(idempotencyKey, statusCode, responseBody) {
    if (!idempotencyKey || !redisService.isAvailable()) return false;
    const key = redisKeys.idempotency(idempotencyKey);

    const payload = {
      statusCode,
      body: responseBody,
      savedAt: new Date().toISOString()
    };

    return await redisService.setJson(key, payload, IDEMPOTENCY_TTL_SECONDS);
  }
}

module.exports = new IdempotencyService();
