const express = require('express');
const {
  loginAdmin,
  getMe,
  sendOtp,
  verifyOtp,
  resendOtp,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendOtpLimiter, verifyOtpLimiter, resendOtpLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Email OTP Authentication endpoints (Passwordless Devotee Access)
router.post('/send-otp', sendOtpLimiter, sendOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
router.post('/resend-otp', resendOtpLimiter, resendOtp);

// Central Admin Authentication
router.post('/admin/login', loginAdmin);

// Session & Profile
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

module.exports = router;

