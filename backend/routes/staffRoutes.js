const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');
const Booking = require('../models/Booking');
const User = require('../models/User');

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

// @desc    Get all staff members for a specific temple
// @route   GET /api/staff/members
// @access  Private (ADMIN, ORGANIZER)
router.get('/members', async (req, res) => {
  try {
    const { templeId } = req.query;
    if (!templeId) {
      return res.status(400).json({ success: false, message: 'Temple ID is required' });
    }

    const staffMembers = await User.find({
      role: 'TEMPLE_STAFF',
      temple: templeId
    })
      .select('-password')
      .populate('temple', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: staffMembers.length,
      data: staffMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Assign or create a staff member for a temple
// @route   POST /api/staff/assign
// @access  Private (ADMIN, ORGANIZER)
router.post('/assign', async (req, res) => {
  try {
    const { email, name, phone, templeId, password } = req.body;

    if (!email || !templeId) {
      return res.status(400).json({ success: false, message: 'Email and Temple ID are required' });
    }

    const templeObj = await Temple.findById(templeId);
    if (!templeObj) {
      return res.status(404).json({ success: false, message: 'Target temple not found' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // Update existing user to TEMPLE_STAFF role and assign to temple
      user.role = 'TEMPLE_STAFF';
      user.temple = templeId;
      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      await user.save();
    } else {
      // Create new user account as TEMPLE_STAFF
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required for new staff accounts' });
      }
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : undefined,
        password: password || 'staff123',
        role: 'TEMPLE_STAFF',
        temple: templeId,
        isActive: true
      });
    }

    const updatedStaff = await User.findById(user._id).select('-password').populate('temple', 'name location');

    res.status(201).json({
      success: true,
      message: `Successfully assigned ${updatedStaff.name} as Temple Staff for ${templeObj.name}`,
      data: updatedStaff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove / Unassign staff member from a temple
// @route   DELETE /api/staff/members/:id
// @access  Private (ADMIN, ORGANIZER)
router.delete('/members/:id', async (req, res) => {
  try {
    const staffUser = await User.findById(req.params.id);
    if (!staffUser) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    staffUser.role = 'USER';
    staffUser.temple = null;
    await staffUser.save();

    res.json({
      success: true,
      message: `Staff member ${staffUser.name} unassigned successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
