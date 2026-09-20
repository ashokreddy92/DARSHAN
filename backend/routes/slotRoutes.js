const express = require('express');
const {
  getSlotsByTemple,
  createSlot,
  updateSlot,
  deleteSlot,
  generateAllTemplesSlots
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/temple/:templeId', getSlotsByTemple);
router.get('/', getSlotsByTemple);

// Protected routes (Admin & Organizers)
router.post('/generate-all', protect, authorize('ADMIN'), generateAllTemplesSlots);
router.post('/', protect, authorize('ADMIN', 'ORGANIZER'), createSlot);
router.put('/:id', protect, authorize('ADMIN', 'ORGANIZER'), updateSlot);
router.delete('/:id', protect, authorize('ADMIN', 'ORGANIZER'), deleteSlot);

module.exports = router;

