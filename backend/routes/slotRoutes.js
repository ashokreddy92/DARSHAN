const express = require('express');
const {
  getSlotsByTemple,
  createSlot,
  updateSlot,
  deleteSlot
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/temple/:templeId', getSlotsByTemple);

// Protected routes (Admin & Organizers)
router.post('/', protect, authorize('ADMIN', 'ORGANIZER'), createSlot);
router.put('/:id', protect, authorize('ADMIN', 'ORGANIZER'), updateSlot);
router.delete('/:id', protect, authorize('ADMIN', 'ORGANIZER'), deleteSlot);

module.exports = router;
