/**
 * DarshanEase — Temporary Slot Reservation Service
 * Holds darshan slot capacity for up to 10 minutes while devotee completes payment.
 * Automatically releases if payment expires or fails.
 */

const redisService = require('./redisService');
const redisKeys = require('../utils/redisKeys');

const RESERVATION_TTL_SECONDS = 600; // 10 minutes

class ReservationService {
  /**
   * Create a 10-minute temporary reservation.
   */
  async createReservation(slotId, userId, count, details = {}) {
    if (!redisService.isAvailable()) {
      return { success: true, simulated: true };
    }

    const key = redisKeys.reservation(slotId, userId);
    const reservationData = {
      slotId,
      userId,
      count,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000).toISOString(),
      details
    };

    const saved = await redisService.setJson(key, reservationData, RESERVATION_TTL_SECONDS);
    console.log(`[SLOT_RESERVATION_CREATED] Reserved ${count} pilgrim slots for user ${userId} on slot ${slotId} (TTL: 10m)`);

    return {
      success: saved,
      reservationKey: key,
      expiresIn: RESERVATION_TTL_SECONDS
    };
  }

  /**
   * Check if an active reservation exists for user and slot.
   */
  async getReservation(slotId, userId) {
    if (!redisService.isAvailable()) return null;
    const key = redisKeys.reservation(slotId, userId);
    return await redisService.getJson(key);
  }

  /**
   * Release reservation when payment succeeds or is cancelled.
   */
  async releaseReservation(slotId, userId) {
    if (!redisService.isAvailable()) return true;
    const key = redisKeys.reservation(slotId, userId);
    const deleted = await redisService.del(key);
    console.log(`[SLOT_RESERVATION_RELEASED] Released reservation for user ${userId} on slot ${slotId}`);
    return deleted > 0;
  }
}

module.exports = new ReservationService();
