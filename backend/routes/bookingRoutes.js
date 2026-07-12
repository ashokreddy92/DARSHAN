const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTempleBookings,
  cancelBooking,
  verifyBookingPayment,
  rejectBookingPayment
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

// Admin / Organizer only booking views
router.get('/', authorize('ADMIN'), getAllBookings);
router.get('/temple/:templeId', authorize('ADMIN', 'ORGANIZER'), getTempleBookings);
router.put('/:id/verify', authorize('ADMIN', 'ORGANIZER'), verifyBookingPayment);
router.put('/:id/reject', authorize('ADMIN', 'ORGANIZER'), rejectBookingPayment);

module.exports = router;
