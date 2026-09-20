const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAdminTickets, scanAndCheckInTicket } = require('../controllers/bookingController');

// @route   GET /api/tickets
// @desc    Get all tickets with filters (admin and temple staff)
// @access  Private (Admin / Staff)
router.get('/', protect, authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), getAdminTickets);

// @route   POST /api/tickets/verify
// @desc    Scan and verify / check-in a ticket
// @access  Private (Admin / Staff)
router.post('/verify', protect, authorize('ADMIN', 'TEMPLE_STAFF', 'ORGANIZER'), scanAndCheckInTicket);

module.exports = router;
