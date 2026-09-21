const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');
const cacheService = require('../services/cacheService');
const redisKeys = require('../utils/redisKeys');
const { broadcastEvent } = require('../socket/socketService');

// @desc    Get slots for a temple or all temples
// @route   GET /api/slots/temple/:templeId
// @route   GET /api/slots
// @access  Public
const getSlotsByTemple = async (req, res) => {
  try {
    const { date, templeId: queryTempleId } = req.query;
    const templeParam = req.params.templeId || queryTempleId;
    let query = { slotType: { $ne: 'General' } };

    if (templeParam && templeParam !== 'all') {
      query.temple = templeParam;
    }

    if (date) {
      query.date = date; // Format: YYYY-MM-DD
    }

    const cacheKey = redisKeys.slots(templeParam || 'all', date || 'all');
    const slots = await cacheService.getOrSet(
      cacheKey,
      async () => {
        let results = await DarshanSlot.find(query)
          .populate('temple', 'name location deity')
          .sort({ date: 1, timeSlot: 1 });

        // Auto-generate standard slots if a valid future date was queried and none exist yet
        if (results.length === 0 && templeParam && templeParam !== 'all' && date) {
          const [y, m, d] = date.split('-').map(Number);
          const reqDate = new Date(y, m - 1, d);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const maxDate = new Date(today);
          maxDate.setDate(maxDate.getDate() + 90);

          if (reqDate >= today && reqDate <= maxDate) {
            const timeSlots = [
              '06:00 AM - 08:00 AM',
              '09:00 AM - 11:00 AM',
              '02:00 PM - 04:00 PM',
              '06:00 PM - 08:00 PM'
            ];
            const slotTypes = [
              { type: 'VIP', price: 300, capacity: 30 },
              { type: 'Special Pooja', price: 500, capacity: 15 }
            ];

            const newSlots = [];
            for (const slotTypeData of slotTypes) {
              for (const timeSlot of timeSlots) {
                newSlots.push({
                  temple: templeParam,
                  date,
                  timeSlot,
                  maxCapacity: slotTypeData.capacity,
                  bookedCount: 0,
                  price: slotTypeData.price,
                  slotType: slotTypeData.type
                });
              }
            }
            await DarshanSlot.insertMany(newSlots);
            results = await DarshanSlot.find(query)
              .populate('temple', 'name location deity')
              .sort({ date: 1, timeSlot: 1 });
          }
        }
        return results;
      },
      60 // 60 seconds TTL
    );

    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly overview of slot availability for a temple
// @route   GET /api/slots/temple/:templeId/month-overview?month=YYYY-MM
const getMonthOverview = async (req, res) => {
  try {
    const { templeId } = req.params;
    const { month } = req.query; // YYYY-MM
    if (!templeId || !month) {
      return res.status(400).json({ success: false, message: 'Temple ID and month (YYYY-MM) are required' });
    }

    const regex = new RegExp(`^${month}`);
    const slots = await DarshanSlot.find({
      temple: templeId,
      date: { $regex: regex },
      slotType: { $ne: 'General' }
    }).select('date maxCapacity bookedCount');

    const summary = {};
    for (const s of slots) {
      if (!summary[s.date]) {
        summary[s.date] = { totalCapacity: 0, booked: 0, available: 0, count: 0 };
      }
      const cap = Number(s.maxCapacity || 50);
      const booked = Number(s.bookedCount || 0);
      summary[s.date].totalCapacity += cap;
      summary[s.date].booked += booked;
      summary[s.date].available += Math.max(0, cap - booked);
      summary[s.date].count += 1;
    }

    res.json({ success: true, month, data: summary });
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

    if (slotType === 'General') {
      return res.status(400).json({
        success: false,
        message: 'General Darshan tickets have been discontinued and can no longer be created.'
      });
    }

    const effectiveSlotType = slotType || 'VIP';

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
            slotType: effectiveSlotType
          },
          update: {
            $setOnInsert: {
              temple: t._id,
              date,
              timeSlot,
              maxCapacity: maxCapacity || 50,
              bookedCount: 0,
              price: price || 300,
              slotType: effectiveSlotType
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
      maxCapacity: maxCapacity || 30,
      price: price || 300,
      slotType: effectiveSlotType
    });

    // Invalidate slot cache & broadcast
    await cacheService.invalidatePattern(redisKeys.slotsPattern());
    broadcastEvent('slot_updated', { templeId: slot.temple, slotId: slot._id, action: 'created' });

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

    if (slotType === 'General') {
      return res.status(400).json({
        success: false,
        message: 'General Darshan tickets have been discontinued and cannot be updated.'
      });
    }

    slot.date = date || slot.date;
    slot.timeSlot = timeSlot || slot.timeSlot;
    slot.maxCapacity = maxCapacity !== undefined ? maxCapacity : slot.maxCapacity;
    slot.price = price !== undefined ? price : slot.price;
    slot.slotType = slotType || slot.slotType;

    await slot.save();

    // Invalidate slot cache & broadcast
    await cacheService.invalidatePattern(redisKeys.slotsPattern());
    broadcastEvent('slot_updated', { templeId: slot.temple, slotId: slot._id, action: 'updated' });

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

    const templeId = slot.temple;
    await slot.deleteOne();

    // Invalidate slot cache & broadcast
    await cacheService.invalidatePattern(redisKeys.slotsPattern());
    broadcastEvent('slot_updated', { templeId, slotId: req.params.id, action: 'deleted' });

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
  getMonthOverview,
  createSlot,
  updateSlot,
  deleteSlot,
  generateAllTemplesSlots
};

