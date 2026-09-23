/**
 * DarshanEase — Production-Grade Email OTP Service
 * Dual-layer persistence with MongoDB (OTP model + TTL index) and Redis caching.
 * Enforces cryptographic 6-digit OTPs, HMAC-SHA256 hashing, 5m expiration,
 * 60s resend cooldown, and 5-attempt brute-force lockout.
 */

const OTP = require('../models/OTP');
const redisService = require('./redisService');
const redisKeys = require('../utils/redisKeys');
const { generateSecureOtp, hashOtp, compareOtpHashes } = require('../utils/otpGenerator');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)
const COOLDOWN_MS = 60 * 1000;     // 60 seconds (60,000 ms)
const MAX_VERIFY_ATTEMPTS = 5;

class OtpService {
  /**
   * Generate and store a new 6-digit Email OTP.
   * Enforces 60-second cooldown and resets attempts.
   */
  async generateOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check 60-second resend cooldown (Redis check)
    if (redisService.isAvailable()) {
      const cooldownKey = redisKeys.otpCooldown(normalizedEmail);
      const remainingCooldown = await redisService.ttl(cooldownKey);
      if (remainingCooldown > 0) {
        return {
          success: false,
          cooldown: true,
          remainingSeconds: remainingCooldown,
          message: `Please wait ${remainingCooldown}s before requesting another OTP.`
        };
      }
    }

    // Cooldown check via MongoDB fallback if DB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const recentOtp = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
        if (recentOtp) {
          const elapsed = Date.now() - new Date(recentOtp.createdAt).getTime();
          if (elapsed < COOLDOWN_MS) {
            const remainingSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
            return {
              success: false,
              cooldown: true,
              remainingSeconds,
              message: `Please wait ${remainingSeconds}s before requesting another OTP.`
            };
          }
        }
      } catch (err) {
        console.warn('[OTP_SERVICE] Mongo findOne error:', err.message);
      }
    }

    // 2. Generate secure 6-digit numeric OTP and salted HMAC hash
    const otp = generateSecureOtp();
    const otpHash = hashOtp(normalizedEmail, otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // 3. Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await OTP.deleteMany({ email: normalizedEmail });
        await OTP.create({
          email: normalizedEmail,
          otpHash,
          expiresAt,
          attempts: 0,
          verified: false
        });
      } catch (err) {
        console.warn('[OTP_SERVICE] Mongo save error:', err.message);
      }
    }

    // 4. Mirror to Redis if available
    if (redisService.isAvailable()) {
      const otpKey = redisKeys.otp(normalizedEmail);
      const attemptsKey = redisKeys.otpAttempts(normalizedEmail);
      const cooldownKey = redisKeys.otpCooldown(normalizedEmail);

      await redisService.setJson(
        otpKey,
        { otpHash, attempts: 0, createdAt: new Date().toISOString() },
        300
      );
      await redisService.set(cooldownKey, '1', 60);
      await redisService.del(attemptsKey);
    }

    console.log(`[OTP_CREATED] Generated secure OTP for ${normalizedEmail} (TTL: 5m, Cooldown: 60s)`);

    return {
      success: true,
      otp, // Provided ONLY to email sender. NEVER returned via HTTP API.
      expiresIn: 300,
      cooldownSeconds: 60
    };
  }

  /**
   * Verify user-submitted OTP against stored HMAC hash.
   * Enforces 5-minute expiration and max 5 attempts lockout.
   */
  async verifyOtp(email, submittedOtp) {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = (submittedOtp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit OTP code.'
      };
    }

    const mongoose = require('mongoose');
    let otpData = null;

    // 1. Fetch active OTP record from Redis first if available
    if (redisService.isAvailable()) {
      const otpKey = redisKeys.otp(normalizedEmail);
      const cached = await redisService.getJson(otpKey);
      if (cached && cached.otpHash) {
        otpData = {
          otpHash: cached.otpHash,
          attempts: cached.attempts || 0,
          fromRedis: true
        };
      }
    }

    // 2. Fallback to MongoDB if not found in Redis
    if (!otpData && mongoose.connection.readyState === 1) {
      try {
        const otpDoc = await OTP.findOne({
          email: normalizedEmail,
          verified: false
        }).sort({ createdAt: -1 });

        if (otpDoc) {
          // Check expiration
          if (new Date() > new Date(otpDoc.expiresAt)) {
            await OTP.deleteMany({ email: normalizedEmail });
            return {
              success: false,
              message: 'Your OTP has expired. Please request a new OTP.'
            };
          }

          otpData = {
            otpHash: otpDoc.otpHash,
            attempts: otpDoc.attempts || 0,
            fromDb: true,
            docId: otpDoc._id
          };
        }
      } catch (err) {
        console.warn('[OTP_SERVICE] Mongo query error during verify:', err.message);
      }
    }

    if (!otpData) {
      return {
        success: false,
        message: 'Your OTP has expired. Please request a new OTP.'
      };
    }

    // Check brute-force lockout
    if (otpData.attempts >= MAX_VERIFY_ATTEMPTS) {
      if (mongoose.connection.readyState === 1) {
        try { await OTP.deleteMany({ email: normalizedEmail }); } catch (_) {}
      }
      if (redisService.isAvailable()) {
        await redisService.del(redisKeys.otp(normalizedEmail));
        await redisService.del(redisKeys.otpAttempts(normalizedEmail));
      }
      return {
        success: false,
        exhausted: true,
        message: 'Too many verification attempts. Please request a new OTP.'
      };
    }

    // 3. Compute hash and compare timing-safely
    const submittedHash = hashOtp(normalizedEmail, cleanOtp);
    const isMatch = compareOtpHashes(submittedHash, otpData.otpHash);

    if (!isMatch) {
      otpData.attempts += 1;
      const remainingAttempts = Math.max(0, MAX_VERIFY_ATTEMPTS - otpData.attempts);

      // Update attempt count in Redis
      if (redisService.isAvailable()) {
        const otpKey = redisKeys.otp(normalizedEmail);
        const ttl = await redisService.ttl(otpKey);
        if (ttl > 0) {
          await redisService.setJson(otpKey, { otpHash: otpData.otpHash, attempts: otpData.attempts }, ttl);
        }
      }

      // Update attempt count in MongoDB
      if (mongoose.connection.readyState === 1) {
        try {
          await OTP.updateOne(
            { email: normalizedEmail, verified: false },
            { $inc: { attempts: 1 } }
          );
        } catch (_) {}
      }

      if (remainingAttempts === 0) {
        if (mongoose.connection.readyState === 1) {
          try { await OTP.deleteMany({ email: normalizedEmail }); } catch (_) {}
        }
        if (redisService.isAvailable()) {
          await redisService.del(redisKeys.otp(normalizedEmail));
          await redisService.del(redisKeys.otpAttempts(normalizedEmail));
        }
        return {
          success: false,
          exhausted: true,
          message: 'Too many verification attempts. Please request a new OTP.'
        };
      }

      return {
        success: false,
        remainingAttempts,
        message: `Invalid OTP. Please check the code and try again. (${remainingAttempts} attempt(s) remaining)`
      };
    }

    // 4. Success: Clean up OTP immediately (One-time use)
    if (mongoose.connection.readyState === 1) {
      try { await OTP.deleteMany({ email: normalizedEmail }); } catch (_) {}
    }
    if (redisService.isAvailable()) {
      await redisService.del(redisKeys.otp(normalizedEmail));
      await redisService.del(redisKeys.otpAttempts(normalizedEmail));
    }

    console.log(`[OTP_VERIFY_SUCCESS] Email verified successfully for ${normalizedEmail}.`);

    return {
      success: true,
      message: 'Email verified successfully'
    };
  }

  /**
   * Resend OTP.
   */
  async resendOtp(email) {
    return await this.generateOtp(email);
  }
}

module.exports = new OtpService();
