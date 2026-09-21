/**
 * DarshanEase — Secure OTP Generator & Hasher
 * Cryptographically generates 6-digit numeric OTPs and produces HMAC-SHA256 hashes.
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * Uses crypto.randomInt to guarantee uniform randomness.
 */
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP using HMAC-SHA256 with email salt.
 * Ensures the plaintext OTP is never persisted in storage.
 */
const hashOtp = (email, otp) => {
  const secret = process.env.JWT_SECRET || 'darshanease-otp-secret-salt-2026';
  return crypto
    .createHmac('sha256', secret)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}`)
    .digest('hex');
};

/**
 * Constant-time comparison between submitted hash and stored hash.
 * Protects against timing attacks.
 */
const compareOtpHashes = (submittedHash, storedHash) => {
  if (!submittedHash || !storedHash || submittedHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(submittedHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
};

module.exports = {
  generateSecureOtp,
  hashOtp,
  compareOtpHashes
};
