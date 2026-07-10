const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTempleBookings,
  cancelBooking
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

module.exports = router;
