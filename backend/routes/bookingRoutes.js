const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTempleBookings,
  cancelBooking,
  verifyBookingPayment,
  rejectBookingPayment,
  scanAndCheckInTicket,
  getAdminStats,
  getAdminTickets,
  getStaffTodayOverview
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiter');
const idempotencyMiddleware = require('../middleware/idempotency');

const router = express.Router();

router.use(protect); // All booking routes require authentication

// User routes (Rate-limited & protected against duplicate submissions via Idempotency-Key)
router.post('/', bookingLimiter, idempotencyMiddleware, createBooking);
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

// QR Ticket Scanning & Check-in (Admin, Staff, Organizer)
router.post('/scan-checkin', authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), scanAndCheckInTicket);

// Temple Staff Dashboard Today Overview
router.get('/staff/today', authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), getStaffTodayOverview);

// Admin dedicated routes
router.get('/admin/stats', authorize('ADMIN'), getAdminStats);
router.get('/admin/tickets', authorize('ADMIN'), getAdminTickets);

// Legacy Admin / Organizer booking views
router.get('/', authorize('ADMIN'), getAllBookings);
router.get('/temple/:templeId', authorize('ADMIN', 'ORGANIZER'), getTempleBookings);
router.put('/:id/verify', authorize('ADMIN', 'ORGANIZER'), verifyBookingPayment);
router.put('/:id/reject', authorize('ADMIN', 'ORGANIZER'), rejectBookingPayment);

module.exports = router;

