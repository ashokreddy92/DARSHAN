const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users with search, role & status filters
// @route   GET /api/users
// @access  Private (ADMIN)
const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role.toUpperCase();
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('temple', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role & assigned temple
// @route   PUT /api/users/:id/role
// @access  Private (ADMIN)
const updateUserRole = async (req, res) => {
  try {
    const { role, temple } = req.body;

    if (!['USER', 'ADMIN', 'ORGANIZER', 'TEMPLE_STAFF'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && role !== 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot demote your own administrator account' });
    }

    user.role = role;
    if (role === 'TEMPLE_STAFF') {
      user.temple = temple || null;
    } else {
      user.temple = null;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('temple', 'name location');

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate or deactivate user account
// @route   PUT /api/users/:id/status
// @access  Private (ADMIN)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user booking history
// @route   GET /api/users/:id/bookings
// @access  Private (ADMIN)
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate('temple', 'name location deity')
      .populate('slot', 'date timeSlot slotType price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getUserBookings
};
