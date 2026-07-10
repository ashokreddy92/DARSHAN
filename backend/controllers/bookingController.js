const Booking = require('../models/Booking');
const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');

// Helper: Generate Unique Booking Reference
const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'DSE-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (USER)
const createBooking = async (req, res) => {
  try {
    const { slotId, devotees } = req.body;

    if (!devotees || devotees.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one pilgrim/devotee' });
    }

    // Fetch slot
    const slot = await DarshanSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Darshan slot not found' });
    }

    // Check availability
    const availableTickets = slot.maxCapacity - slot.bookedCount;
    if (availableTickets < devotees.length) {
      return res.status(400).json({
        success: false,
        message: `Insufficient slots. Only ${availableTickets} slots are available for this time.`
      });
    }

    const totalPrice = slot.price * devotees.length;
    const bookingReference = generateBookingReference();

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      temple: slot.temple,
      slot: slotId,
      devotees,
      totalPrice,
      bookingReference
    });

    // Update slot booked count
    slot.bookedCount += devotees.length;
    await slot.save();

    // Populate temple and slot for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('temple')
      .populate('slot');

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (USER, ORGANIZER, ADMIN)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('temple')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (ADMIN)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('temple')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings for a specific temple
// @route   GET /api/bookings/temple/:templeId
// @access  Private (ADMIN, ORGANIZER)
const getTempleBookings = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.templeId);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    // Role check: Organizer can only view bookings for their own temple
    if (req.user.role !== 'ADMIN' && temple.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this temple'
      });
    }

    const bookings = await Booking.find({ temple: req.params.templeId })
      .populate('user', 'name email phone')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (USER, ADMIN)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: User who booked it or Admin can cancel
    if (req.user.role !== 'ADMIN' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'Cancelled';
    await booking.save();

    // Revert slot booked count
    const slot = await DarshanSlot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - booking.devotees.length);
      await slot.save();
    }

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTempleBookings,
  cancelBooking
};
