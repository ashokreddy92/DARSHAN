const express = require('express');
const {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getUserBookings
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All user management routes are strictly ADMIN only
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.get('/:id/bookings', getUserBookings);

module.exports = router;
