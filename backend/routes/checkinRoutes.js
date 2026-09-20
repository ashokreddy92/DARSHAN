const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scanAndCheckInTicket } = require('../controllers/bookingController');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(protect);

// @desc    Scan and check in ticket (Gate Entry)
// @route   POST /api/checkin
// @access  Private (ADMIN, TEMPLE_STAFF, ORGANIZER)
router.post('/', authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), scanAndCheckInTicket);

// @desc    Read-only verify ticket details by QR code or reference
// @route   GET /api/checkin/verify/:code
// @access  Private (ADMIN, TEMPLE_STAFF, ORGANIZER)
router.get('/verify/:code', authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), async (req, res) => {
  try {
    const cleanCode = req.params.code.trim();
    const booking = await Booking.findOne({
      $or: [
        { bookingReference: cleanCode },
        { qrCode: cleanCode },
        ...(cleanCode.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanCode }] : [])
      ]
    })
      .populate('temple', 'name location deity')
      .populate('slot', 'date timeSlot slotType price')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
