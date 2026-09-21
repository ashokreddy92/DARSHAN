/**
 * DarshanEase — Centralized Redis Key Management
 * Enforces predictable namespaces and eliminates ad-hoc Redis keys.
 */

const PREFIX = process.env.REDIS_KEY_PREFIX || 'darshanease:';

const redisKeys = {
  prefix: PREFIX,

  // User & Sessions
  user: (userId) => `${PREFIX}user:${userId}`,
  session: (sessionId) => `${PREFIX}session:${sessionId}`,
  tokenBlacklist: (tokenId) => `${PREFIX}token:blacklist:${tokenId}`,

  // Temple Caching
  temple: (templeId) => `${PREFIX}temple:${templeId}`,
  templesList: (hash = 'all') => `${PREFIX}temples:list:${hash}`,
  templesListPattern: () => `${PREFIX}temples:list:*`,

  // Darshan Slot Caching
  slot: (slotId) => `${PREFIX}slot:${slotId}`,
  slots: (templeId, date = 'all') => `${PREFIX}slots:${templeId}:${date}`,
  slotsPattern: (templeId = '*') => `${PREFIX}slots:${templeId}:*`,

  // Bookings & Locks
  booking: (bookingId) => `${PREFIX}booking:${bookingId}`,
  bookingLock: (slotId) => `${PREFIX}lock:booking:${slotId}`,
  paymentLock: (paymentId) => `${PREFIX}lock:payment:${paymentId}`,
  reservation: (slotId, userId) => `${PREFIX}reservation:${slotId}:${userId}`,

  // Email OTP Authentication
  otp: (email) => `${PREFIX}otp:${email.toLowerCase().trim()}`,
  otpAttempts: (email) => `${PREFIX}otp:attempts:${email.toLowerCase().trim()}`,
  otpCooldown: (email) => `${PREFIX}otp:cooldown:${email.toLowerCase().trim()}`,

  // Rate Limiting
  rateLimit: (endpoint, identifier) => `${PREFIX}rate:${endpoint}:${identifier}`,

  // Idempotency
  idempotency: (key) => `${PREFIX}idempotency:${key}`,

  // Analytics & Stats
  analyticsToday: () => `${PREFIX}analytics:today`,
  staffOverview: (templeId) => `${PREFIX}analytics:staff:${templeId}`,

  // Pub/Sub Channels
  channels: {
    bookingEvents: `${PREFIX}events:booking`,
    slotEvents: `${PREFIX}events:slot`,
    adminEvents: `${PREFIX}events:admin`,
  }
};

module.exports = redisKeys;
