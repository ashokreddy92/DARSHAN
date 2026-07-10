const express = require('express');
const {
  getTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple
} = require('../controllers/templeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getTemples);
router.get('/:id', getTempleById);

// Protected routes (Admin & Organizers)
router.post('/', protect, authorize('ADMIN', 'ORGANIZER'), createTemple);
router.put('/:id', protect, authorize('ADMIN', 'ORGANIZER'), updateTemple);
router.delete('/:id', protect, authorize('ADMIN'), deleteTemple);

module.exports = router;
