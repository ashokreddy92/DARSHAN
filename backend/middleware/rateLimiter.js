/**
 * DarshanEase — Redis Rate Limiter Middleware
 * Configurable multi-tier rate limiting by IP, Email, or authenticated User ID.
 */

const rateLimitService = require('../services/rateLimitService');

/**
 * Factory for route-level rate limiting.
 * @param {Object} options
 * @param {string} options.endpoint - Descriptive name of the endpoint
 * @param {number} options.maxRequests - Number of allowed requests in the window
 * @param {number} options.windowSeconds - Window length in seconds
 * @param {'ip'|'email'|'user'} options.identifierType - Source of client identity
 */
const createRateLimiter = ({
  endpoint,
  maxRequests,
  windowSeconds,
  identifierType = 'ip'
}) => {
  return async (req, res, next) => {
    let identifier;

    switch (identifierType) {
      case 'email':
        identifier = (req.body.email || req.query.email || '').toLowerCase().trim();
        break;
      case 'user':
        identifier = req.user ? req.user._id.toString() : (req.ip || 'anonymous');
        break;
      case 'ip':
      default:
        identifier = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown-ip';
        break;
    }

    if (!identifier) {
      identifier = req.ip || 'unknown';
    }

    const result = await rateLimitService.checkRateLimit(
      endpoint,
      identifier,
      maxRequests,
      windowSeconds
    );

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Too many requests for this action. Please try again in ${result.retryAfter} second(s).`,
        retryAfter: result.retryAfter
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  // Pre-configured limiters per Section 10
  sendOtpLimiter: createRateLimiter({
    endpoint: 'send-otp',
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    identifierType: 'email'
  }),
  verifyOtpLimiter: createRateLimiter({
    endpoint: 'verify-otp',
    maxRequests: 10,
    windowSeconds: 900, // 15 minutes
    identifierType: 'ip'
  }),
  resendOtpLimiter: createRateLimiter({
    endpoint: 'resend-otp',
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    identifierType: 'email'
  }),
  bookingLimiter: createRateLimiter({
    endpoint: 'booking',
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
    identifierType: 'user'
  }),
  paymentLimiter: createRateLimiter({
    endpoint: 'payment',
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
    identifierType: 'user'
  })
};
