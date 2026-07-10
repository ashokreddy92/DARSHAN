const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');

// @desc    Get slots for a temple
// @route   GET /api/slots/temple/:templeId
// @access  Public
const getSlotsByTemple = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { temple: req.params.templeId };

    if (date) {
      query.date = date; // Format: YYYY-MM-DD
    }

    const slots = await DarshanSlot.find(query).sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new slot
// @route   POST /api/slots
// @access  Private (ADMIN, ORGANIZER)
const createSlot = async (req, res) => {
  try {
    const { temple, date, timeSlot, maxCapacity, price, slotType } = req.body;

    // Verify temple exists
    const templeExists = await Temple.findById(temple);
    if (!templeExists) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    // Role check: Organizer can only create slots for their own temple
    if (req.user.role !== 'ADMIN' && templeExists.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create slots for this temple'
      });
    }

    // Create slot
    const slot = await DarshanSlot.create({
      temple,
      date,
      timeSlot,
      maxCapacity,
      price: price || 0,
      slotType: slotType || 'General'
    });

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A slot with this date, time, and type already exists for this temple'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update slot
// @route   PUT /api/slots/:id
// @access  Private (ADMIN, ORGANIZER)
const updateSlot = async (req, res) => {
  try {
    let slot = await DarshanSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const templeExists = await Temple.findById(slot.temple);

    // Role check
    if (req.user.role !== 'ADMIN' && templeExists.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update slots for this temple'
      });
    }

    const { date, timeSlot, maxCapacity, price, slotType } = req.body;

    slot.date = date || slot.date;
    slot.timeSlot = timeSlot || slot.timeSlot;
    slot.maxCapacity = maxCapacity !== undefined ? maxCapacity : slot.maxCapacity;
    slot.price = price !== undefined ? price : slot.price;
    slot.slotType = slotType || slot.slotType;

    await slot.save();

    res.json({ success: true, data: slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A slot with this date, time, and type already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private (ADMIN, ORGANIZER)
const deleteSlot = async (req, res) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const templeExists = await Temple.findById(slot.temple);

    // Role check
    if (req.user.role !== 'ADMIN' && templeExists.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete slots for this temple'
      });
    }

    await slot.deleteOne();

    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSlotsByTemple,
  createSlot,
  updateSlot,
  deleteSlot
};
