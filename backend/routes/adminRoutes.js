const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');
const User = require('../models/User');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

// @desc    Get comprehensive analytics & charts data for Admin Dashboard
// @route   GET /api/admin/analytics
// @access  Private (ADMIN)
router.get('/analytics', async (req, res) => {
  try {
    const today = new Date();

    // 1. Last 7 Days Daily Sales & Revenue Trend
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];

      const dayBookings = await Booking.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const ticketsSold = dayBookings.reduce((sum, b) => {
        const isCountable = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
        return sum + (isCountable ? (b.devotees?.length || 1) : 0);
      }, 0);

      const revenue = dayBookings.reduce((sum, b) => {
        const isPaid = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
        return sum + (isPaid ? (b.totalPrice || 0) : 0);
      }, 0);

      const checkIns = await Booking.countDocuments({
        checkedInAt: { $gte: startOfDay, $lte: endOfDay }
      });

      dailyTrend.push({
        date: dateStr,
        day: dayName,
        ticketsSold,
        revenue,
        checkIns
      });
    }

    // 2. Temple-wise Bookings Distribution
    const temples = await Temple.find({}, 'name');
    const templeDistribution = [];
    for (const t of temples) {
      const count = await Booking.countDocuments({
        temple: t._id,
        status: { $in: ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'] }
      });
      templeDistribution.push({
        templeId: t._id,
        templeName: t.name,
        bookingCount: count
      });
    }
    // Sort descending by bookings
    templeDistribution.sort((a, b) => b.bookingCount - a.bookingCount);

    // 3. Status Ratios
    const totalConfirmed = await Booking.countDocuments({ status: { $in: ['Confirmed', 'CONFIRMED'] } });
    const totalCheckedIn = await Booking.countDocuments({ status: { $in: ['Checked In', 'CHECKED_IN'] } });
    const totalCancelled = await Booking.countDocuments({ status: { $in: ['Cancelled', 'CANCELLED'] } });
    const totalPending = await Booking.countDocuments({ status: { $in: ['Pending Verification', 'PENDING'] } });

    // 4. Upcoming Slots (Next 48 Hours)
    const todayStr = today.toISOString().split('T')[0];
    const upcomingSlots = await DarshanSlot.find({
      date: { $gte: todayStr }
    })
      .populate('temple', 'name location')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        dailyTrend,
        templeDistribution: templeDistribution.slice(0, 8),
        statusBreakdown: {
          confirmed: totalConfirmed,
          checkedIn: totalCheckedIn,
          cancelled: totalCancelled,
          pending: totalPending,
          total: totalConfirmed + totalCheckedIn + totalCancelled + totalPending
        },
        upcomingSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get summary report
// @route   GET /api/admin/reports
// @access  Private (ADMIN)
router.get('/reports', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalStaff = await User.countDocuments({ role: 'TEMPLE_STAFF' });
    const totalTemples = await Temple.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const confirmedBookings = await Booking.find({
      status: { $in: ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'] }
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalDevotees = confirmedBookings.reduce((sum, b) => sum + (b.devotees?.length || 1), 0);

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers,
          totalStaff,
          totalTemples,
          totalBookings,
          totalDevotees,
          totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
