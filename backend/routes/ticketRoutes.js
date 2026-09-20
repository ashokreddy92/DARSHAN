const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAdminTickets, scanAndCheckInTicket } = require('../controllers/bookingController');

// @route   GET /api/tickets
// @desc    Get all tickets with filters (admin and temple staff)
// @access  Private (Admin / Staff)
router.get('/', protect, adminOnly, getAdminTickets);

// @route   POST /api/tickets/verify
// @desc    Scan and verify / check-in a ticket
// @access  Private (Admin / Staff)
router.post('/verify', protect, adminOnly, scanAndCheckInTicket);

module.exports = router;
