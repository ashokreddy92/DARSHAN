const express = require('express');
const { createDonation, getAllDonations, getMyDonations } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Optional protect middleware for guest/user donation
// We will manually extract user if header present, otherwise allow public
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'darshaneasemenjwtsecret12345!');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      console.warn('Optional token decoding failed', e.message);
    }
  }
  next();
};

router.post('/', optionalProtect, createDonation);
router.get('/my-donations', protect, getMyDonations);
router.get('/', protect, authorize('ADMIN'), getAllDonations);

module.exports = router;
