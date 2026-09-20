const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(protect);
router.use(authorize('TEMPLE_STAFF', 'ADMIN', 'ORGANIZER'));

// Helper: Determine current active slot based on current time
const getCurrentSlot = (timeSlots) => {
  const now = new Date();
  const currentHour = now.getHours(); // 0 - 23

  for (const slot of timeSlots) {
    if (slot.timeSlot.includes('06:00 AM') && currentHour >= 6 && currentHour < 8) return slot;
    if (slot.timeSlot.includes('09:00 AM') && currentHour >= 9 && currentHour < 11) return slot;
    if (slot.timeSlot.includes('03:00 PM') && currentHour >= 15 && currentHour < 17) return slot;
    if (slot.timeSlot.includes('06:00 PM') && currentHour >= 18 && currentHour < 20) return slot;
  }
  return null;
};

// @desc    Get temple staff overview for assigned temple
// @route   GET /api/staff/overview
// @access  Private (TEMPLE_STAFF, ADMIN, ORGANIZER)
router.get('/overview', async (req, res) => {
  try {
    const templeId = req.user.role === 'TEMPLE_STAFF' ? req.user.temple : (req.query.templeId || req.user.temple);
    if (!templeId) {
      return res.status(400).json({ success: false, message: 'No temple assigned to staff account' });
    }

    const temple = await Temple.findById(templeId);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Assigned temple not found' });
    }

    const todayDateString = new Date().toISOString().split('T')[0];

    // Today's slots for this temple
    const todaySlots = await DarshanSlot.find({ temple: templeId, date: todayDateString }).sort({ timeSlot: 1 });
    const slotIds = todaySlots.map(s => s._id);

    // Today's bookings for this temple
    const todayBookings = await Booking.find({
      temple: templeId,
      $or: [
        { slot: { $in: slotIds } },
        { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      ]
    })
      .populate('slot', 'timeSlot slotType price maxCapacity bookedCount')
      .populate('user', 'name email phone')
      .populate('checkedInBy', 'name')
      .sort({ updatedAt: -1 });

    const totalTodayBookings = todayBookings.length;
    const totalTicketsSold = todayBookings.reduce((sum, b) => {
      const isCountable = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
      return sum + (isCountable ? (b.devotees?.length || 1) : 0);
    }, 0);

    const checkedInCount = todayBookings.filter(b => ['Checked In', 'CHECKED_IN'].includes(b.status)).length;
    const remainingCount = todayBookings.filter(b => ['Confirmed', 'CONFIRMED'].includes(b.status)).length;

    const currentActiveSlot = getCurrentSlot(todaySlots);

    res.json({
      success: true,
      data: {
        temple: {
          _id: temple._id,
          name: temple.name,
          location: temple.location,
          deity: temple.deity,
          openingHours: temple.openingHours
        },
        todayDate: todayDateString,
        stats: {
          todayBookings: totalTodayBookings,
          todayTicketsSold: totalTicketsSold,
          checkedInDevotees: checkedInCount,
          remainingDevotees: remainingCount
        },
        currentSlot: currentActiveSlot ? {
          timeSlot: currentActiveSlot.timeSlot,
          slotType: currentActiveSlot.slotType,
          maxCapacity: currentActiveSlot.maxCapacity,
          bookedCount: currentActiveSlot.bookedCount
        } : null,
        upcomingSlots: todaySlots.slice(0, 6),
        recentTickets: todayBookings.slice(0, 50)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
