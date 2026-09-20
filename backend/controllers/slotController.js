const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');

// @desc    Get slots for a temple or all temples
// @route   GET /api/slots/temple/:templeId
// @route   GET /api/slots
// @access  Public
const getSlotsByTemple = async (req, res) => {
  try {
    const { date, templeId: queryTempleId } = req.query;
    const templeParam = req.params.templeId || queryTempleId;
    let query = {};

    if (templeParam && templeParam !== 'all') {
      query.temple = templeParam;
    }

    if (date) {
      query.date = date; // Format: YYYY-MM-DD
    }

    const slots = await DarshanSlot.find(query)
      .populate('temple', 'name location deity')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new slot (single temple or all temples)
// @route   POST /api/slots
// @access  Private (ADMIN, ORGANIZER)
const createSlot = async (req, res) => {
  try {
    const { temple, allTemples, date, timeSlot, maxCapacity, price, slotType } = req.body;

    // Handle creating slots across all temples simultaneously (Admin only)
    if (allTemples || temple === 'all') {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only administrator is authorized to create slots for all temples'
        });
      }

      const allTemplesList = await Temple.find({});
      if (!allTemplesList || allTemplesList.length === 0) {
        return res.status(404).json({ success: false, message: 'No temples found in system' });
      }

      const bulkOps = allTemplesList.map((t) => ({
        updateOne: {
          filter: {
            temple: t._id,
            date,
            timeSlot,
            slotType: slotType || 'General'
          },
          update: {
            $setOnInsert: {
              temple: t._id,
              date,
              timeSlot,
              maxCapacity: maxCapacity || 50,
              bookedCount: 0,
              price: price || 0,
              slotType: slotType || 'General'
            }
          },
          upsert: true
        }
      }));

      const result = await DarshanSlot.bulkWrite(bulkOps, { ordered: false });

      return res.status(201).json({
        success: true,
        message: `Slots scheduled across ${allTemplesList.length} temples!`,
        data: {
          totalTemples: allTemplesList.length,
          upsertedCount: result.upsertedCount || 0,
          matchedCount: result.matchedCount || 0
        }
      });
    }

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

// @desc    Bulk auto-generate slots for all temples for upcoming days
// @route   POST /api/slots/generate-all
// @access  Private (ADMIN)
const generateAllTemplesSlots = async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 14;
    const temples = await Temple.find({});

    if (!temples || temples.length === 0) {
      return res.status(404).json({ success: false, message: 'No temples found in system' });
    }

    const timeSlots = [
      '06:00 AM - 08:00 AM',
      '09:00 AM - 11:00 AM',
      '03:00 PM - 05:00 PM',
      '06:00 PM - 08:00 PM'
    ];

    const slotTypes = [
      { type: 'General', price: 0, capacity: 100 },
      { type: 'VIP', price: 500, capacity: 30 },
      { type: 'Special Pooja', price: 1000, capacity: 15 }
    ];

    const today = new Date();
    const bulkOps = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      for (const temple of temples) {
        for (const slotTypeData of slotTypes) {
          for (const timeSlot of timeSlots) {
            bulkOps.push({
              updateOne: {
                filter: {
                  temple: temple._id,
                  date: dateString,
                  timeSlot: timeSlot,
                  slotType: slotTypeData.type
                },
                update: {
                  $setOnInsert: {
                    temple: temple._id,
                    date: dateString,
                    timeSlot: timeSlot,
                    maxCapacity: slotTypeData.capacity,
                    bookedCount: 0,
                    price: slotTypeData.price,
                    slotType: slotTypeData.type
                  }
                },
                upsert: true
              }
            });
          }
        }
      }
    }

    let upsertedCount = 0;
    if (bulkOps.length > 0) {
      const result = await DarshanSlot.bulkWrite(bulkOps, { ordered: false });
      upsertedCount = result.upsertedCount || 0;
    }

    res.status(200).json({
      success: true,
      message: `Successfully generated slots for all ${temples.length} temples over ${days} days! (${upsertedCount} new slots added)`,
      data: {
        templesCount: temples.length,
        days,
        newSlotsAdded: upsertedCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSlotsByTemple,
  createSlot,
  updateSlot,
  deleteSlot,
  generateAllTemplesSlots
};

