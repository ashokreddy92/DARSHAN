const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('../services/otpService');
const redisService = require('../services/redisService');
const redisKeys = require('../utils/redisKeys');
const { sendEmail } = require('../utils/emailHelper');

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'darshaneasemenjwtsecret12345!', {
    expiresIn: '30d'
  });
};



// @desc    Authenticate admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and select password fields explicitly
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied. Standard users must log in through the user portal.' });
      }
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is attached by protect middleware
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send 6-digit Email OTP
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Generate secure hashed OTP in Redis & MongoDB
    const result = await otpService.generateOtp(normalizedEmail);

    if (!result.success) {
      return res.status(429).json({
        success: false,
        cooldown: result.cooldown || false,
        remainingSeconds: result.remainingSeconds || 60,
        message: result.message
      });
    }

    // Deliver branded HTML email
    const emailService = require('../services/emailService');
    const emailResult = await emailService.sendOtpEmail(normalizedEmail, result.otp);

    if (!emailResult.success && !emailResult.simulated) {
      console.error('[EMAIL_DELIVERY_ERROR] Failed to send email to', normalizedEmail);
      return res.status(500).json({
        success: false,
        message: 'Unable to send OTP right now. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300,
      cooldownSeconds: 60
    });
  } catch (error) {
    console.error('[SEND_OTP_ERROR]', error);
    res.status(500).json({ success: false, message: 'Unable to send OTP right now. Please try again later.' });
  }
};

// @desc    Verify Email OTP & Login / Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanOtp = (otp || '').toString().trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check the code and try again.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const verification = await otpService.verifyOtp(normalizedEmail, cleanOtp);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        exhausted: verification.exhausted || false,
        remainingAttempts: verification.remainingAttempts,
        message: verification.message
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-create new devotee account
      const userName = normalizedEmail.split('@')[0];
      user = await User.create({
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: normalizedEmail,
        role: 'USER',
        isEmailVerified: true
      });
      console.log(`[USER_REGISTERED_OTP] Auto-registered new user: ${user.email} (${user._id})`);
    } else {
      // Ensure email verified flag is set
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
      console.log(`[USER_LOGGED_IN_OTP] Authenticated existing user: ${user.email} (${user._id})`);
    }

    const token = generateToken(user._id);

    // Set secure cookie if supported
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const devoteeUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      profileImage: user.profileImage || '',
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: devoteeUser,
      data: {
        token,
        user: devoteeUser
      }
    });
  } catch (error) {
    console.error('[VERIFY_OTP_ERROR]', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  return sendOtp(req, res);
};

// @desc    Logout user & clear cookie / blacklist token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const remainingSeconds = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
          const blacklistKey = redisKeys.tokenBlacklist(token);
          await redisService.set(blacklistKey, 'revoked', remainingSeconds);
        }
      } catch (err) {
        // Token blacklist decode fail safe
      }
    }

    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginAdmin,
  getMe,
  sendOtp,
  verifyOtp,
  resendOtp,
  logoutUser
};

